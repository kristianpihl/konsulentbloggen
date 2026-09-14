import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getAllPostsForAdmin } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";
import type { Post } from "@/types/post";

const TREND_DAYS = 14;
const WORDS_PER_MINUTE = 200;
// Gulv på estimert lesetid — hindrer at svært korte innlegg (eller
// testdata) gir absurd høy fullføringsgrad når noen bare er innom et
// par sekunder ekstra.
const MIN_ESTIMATED_READING_SECONDS = 20;
// Tak på fullføringsgrad som vises — over dette gir prosenttallet ikke
// mer innsikt, bare støy fra enkeltbesøk som ble stående lenge.
export const MAX_COMPLETION_RATE = 200;

export interface PostEngagement {
  slug: string;
  title: string;
  views: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  completionRate: number | null; // prosent av estimert lesetid, kan overstige 100
  shares: number;
  shareRate: number | null; // prosent av visninger
  avgScrollDepth: number | null; // prosent
  trend: number[]; // sidevisninger per dag, siste TREND_DAYS dager (eldst → nyest)
}

export interface CategoryEngagement {
  category: string;
  postCount: number;
  views: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  completionRate: number | null;
  shares: number;
  shareRate: number | null;
  avgScrollDepth: number | null;
  trend: number[];
}

export interface PostEngagementSummary {
  totalViews: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  completionRate: number | null;
  shareRate: number | null;
  posts: PostEngagement[];
  categories: CategoryEngagement[];
  windowDays: number;
  trendDays: number;
}

const EMPTY_SUMMARY = (windowDays: number): PostEngagementSummary => ({
  totalViews: 0,
  uniqueReaders: 0,
  avgDurationSeconds: null,
  completionRate: null,
  shareRate: null,
  posts: [],
  categories: [],
  windowDays,
  trendDays: TREND_DAYS,
});

function average(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

// Median i stedet for gjennomsnitt for fullføringsgrad — langt mer
// robust mot enkeltbesøk som ble stående lenge (f.eks. en fane i
// bakgrunnen), som ellers kan dra et gjennomsnitt kraftig opp når det
// er få besøk totalt.
function median(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
}

function categoriesForPost(post: Post): string[] {
  return CATEGORIES.filter((category) =>
    post.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()),
  );
}

// Grov, men fornuftig lesetid-estimering: ordantall i Markdown-kilden
// delt på en typisk lesehastighet. Brukes til å regne ut fullføringsgrad
// (faktisk lesetid ÷ estimert lesetid).
function estimateReadingSeconds(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(MIN_ESTIMATED_READING_SECONDS, (wordCount / WORDS_PER_MINUTE) * 60);
}

function clampCompletionRate(rate: number): number {
  return Math.min(rate, MAX_COMPLETION_RATE);
}

function completionRateFromRatios(ratios: number[]): number | null {
  const m = median(ratios);
  return m === null ? null : clampCompletionRate(m);
}

interface RunningTotals {
  views: number;
  sessions: Set<string>;
  durations: number[];
  scrollDepths: number[];
  dailyCounts: Map<string, number>;
  // (faktisk lesetid ÷ estimert lesetid) × 100, én verdi per visning —
  // medianen av disse blir fullføringsgraden.
  completionRatios: number[];
}

function newTotals(): RunningTotals {
  return {
    views: 0,
    sessions: new Set(),
    durations: [],
    scrollDepths: [],
    dailyCounts: new Map(),
    completionRatios: [],
  };
}

// Henter engasjementstall for de siste `windowDays` dagene, kun for
// blogginnlegg (/blog/[slug]) — ikke forsiden, kategorisider eller andre
// sider. Kjøres som admin (RLS gir kun admin lesetilgang til
// page_views/post_shares).
export async function getPostEngagementStats(
  windowDays = 30,
): Promise<PostEngagementSummary> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [{ data: viewRows, error: viewError }, shareRowsResult, allPosts] =
    await Promise.all([
      supabase
        .from("page_views")
        .select("path, session_id, duration_seconds, scroll_depth, created_at")
        .gte("created_at", since)
        .like("path", "/blog/%")
        .limit(20000),
      supabase
        .from("post_shares")
        .select("path")
        .gte("created_at", since)
        .like("path", "/blog/%")
        .limit(20000),
      getAllPostsForAdmin(),
    ]);

  if (viewError || !viewRows) {
    console.error("Klarte ikke å hente besøksstatistikk:", viewError?.message);
    return EMPTY_SUMMARY(windowDays);
  }

  if (shareRowsResult.error) {
    console.error(
      "Klarte ikke å hente delingsstatistikk (kjør migrasjon 007?):",
      shareRowsResult.error.message,
    );
  }
  const shareRows = shareRowsResult.data ?? [];

  const postBySlug = new Map(allPosts.map((post) => [post.slug, post]));
  const estimatedSecondsBySlug = new Map(
    allPosts.map((post) => [post.slug, estimateReadingSeconds(post.content)]),
  );
  const trendKeys = lastNDayKeys(TREND_DAYS);

  const sharesBySlug = new Map<string, number>();
  for (const row of shareRows) {
    const slug = row.path.replace(/^\/blog\//, "");
    sharesBySlug.set(slug, (sharesBySlug.get(slug) ?? 0) + 1);
  }
  const sharesByCategory = new Map<string, number>();
  for (const row of shareRows) {
    const slug = row.path.replace(/^\/blog\//, "");
    const post = postBySlug.get(slug);
    if (!post) continue;
    for (const category of categoriesForPost(post)) {
      sharesByCategory.set(category, (sharesByCategory.get(category) ?? 0) + 1);
    }
  }

  const totalViews = viewRows.length;
  const uniqueReaders = new Set(viewRows.map((row) => row.session_id)).size;
  const globalCompletionRatios: number[] = [];

  const bySlug = new Map<string, RunningTotals>();
  const byCategory = new Map<string, RunningTotals>();
  const categorySlugs = new Map<string, Set<string>>();

  for (const row of viewRows) {
    const slug = row.path.replace(/^\/blog\//, "");
    const estimatedSeconds = estimatedSecondsBySlug.get(slug);
    const ratio =
      typeof row.duration_seconds === "number" && estimatedSeconds
        ? (row.duration_seconds / estimatedSeconds) * 100
        : null;

    const postEntry = bySlug.get(slug) ?? newTotals();
    postEntry.views += 1;
    postEntry.sessions.add(row.session_id);
    if (typeof row.duration_seconds === "number") {
      postEntry.durations.push(row.duration_seconds);
    }
    if (ratio !== null) {
      postEntry.completionRatios.push(ratio);
      globalCompletionRatios.push(ratio);
    }
    if (typeof row.scroll_depth === "number") {
      postEntry.scrollDepths.push(row.scroll_depth);
    }
    const key = dayKey(row.created_at);
    postEntry.dailyCounts.set(key, (postEntry.dailyCounts.get(key) ?? 0) + 1);
    bySlug.set(slug, postEntry);

    const post = postBySlug.get(slug);
    if (!post) continue;

    for (const category of categoriesForPost(post)) {
      const catEntry = byCategory.get(category) ?? newTotals();
      catEntry.views += 1;
      catEntry.sessions.add(row.session_id);
      if (typeof row.duration_seconds === "number") {
        catEntry.durations.push(row.duration_seconds);
      }
      if (ratio !== null) {
        catEntry.completionRatios.push(ratio);
      }
      if (typeof row.scroll_depth === "number") {
        catEntry.scrollDepths.push(row.scroll_depth);
      }
      catEntry.dailyCounts.set(key, (catEntry.dailyCounts.get(key) ?? 0) + 1);
      byCategory.set(category, catEntry);

      const slugSet = categorySlugs.get(category) ?? new Set<string>();
      slugSet.add(slug);
      categorySlugs.set(category, slugSet);
    }
  }

  const posts: PostEngagement[] = [...bySlug.entries()]
    .map(([slug, entry]) => {
      const shares = sharesBySlug.get(slug) ?? 0;
      return {
        slug,
        title: postBySlug.get(slug)?.title ?? slug,
        views: entry.views,
        uniqueReaders: entry.sessions.size,
        avgDurationSeconds: average(entry.durations),
        completionRate: completionRateFromRatios(entry.completionRatios),
        shares,
        shareRate: entry.views > 0 ? (shares / entry.views) * 100 : null,
        avgScrollDepth: average(entry.scrollDepths),
        trend: trendKeys.map((key) => entry.dailyCounts.get(key) ?? 0),
      };
    })
    .sort((a, b) => b.views - a.views);

  const categories: CategoryEngagement[] = CATEGORIES.map((category) => {
    const entry = byCategory.get(category);
    const shares = sharesByCategory.get(category) ?? 0;
    return {
      category,
      postCount: categorySlugs.get(category)?.size ?? 0,
      views: entry?.views ?? 0,
      uniqueReaders: entry?.sessions.size ?? 0,
      avgDurationSeconds: entry ? average(entry.durations) : null,
      completionRate: entry ? completionRateFromRatios(entry.completionRatios) : null,
      shares,
      shareRate: entry && entry.views > 0 ? (shares / entry.views) * 100 : null,
      avgScrollDepth: entry ? average(entry.scrollDepths) : null,
      trend: trendKeys.map((key) => entry?.dailyCounts.get(key) ?? 0),
    };
  }).sort((a, b) => b.views - a.views);

  return {
    totalViews,
    uniqueReaders,
    avgDurationSeconds: average(
      viewRows
        .map((row) => row.duration_seconds)
        .filter((d): d is number => typeof d === "number"),
    ),
    completionRate: completionRateFromRatios(globalCompletionRatios),
    shareRate: totalViews > 0 ? (shareRows.length / totalViews) * 100 : null,
    posts,
    categories,
    windowDays,
    trendDays: TREND_DAYS,
  };
}

// Henter totalt antall sidevisninger per innlegg (all tid). Brukes til å
// sortere kategori-seksjonene på forsiden etter popularitet.
//
// Kalles fra offentlige sider (uten innlogget admin-sesjon), så vanlig
// createClient() ville blitt blokkert av RLS på page_views. Bruker derfor
// service_role-klienten — trygt her siden vi kun bruker tallene til å
// avgjøre sorteringsrekkefølge på innhold som uansett er offentlig.
export async function getPostViewCounts(): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("path")
    .like("path", "/blog/%")
    .limit(50000);

  if (error || !data) {
    console.error("Klarte ikke å hente visningstall:", error?.message);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data) {
    const slug = row.path.replace(/^\/blog\//, "");
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}
