import { createClient } from "@/lib/supabase/server";
import { getAllPostsForAdmin } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";
import type { Post } from "@/types/post";

const TREND_DAYS = 14;

export interface PostEngagement {
  slug: string;
  title: string;
  views: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  trend: number[]; // sidevisninger per dag, siste TREND_DAYS dager (eldst → nyest)
}

export interface CategoryEngagement {
  category: string;
  postCount: number;
  views: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
}

export interface PostEngagementSummary {
  totalViews: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  posts: PostEngagement[];
  categories: CategoryEngagement[];
  windowDays: number;
  trendDays: number;
}

const EMPTY_SUMMARY = (windowDays: number): PostEngagementSummary => ({
  totalViews: 0,
  uniqueReaders: 0,
  avgDurationSeconds: null,
  posts: [],
  categories: [],
  windowDays,
  trendDays: TREND_DAYS,
});

function average(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
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

// Henter engasjementstall for de siste `windowDays` dagene, kun for
// blogginnlegg (/blog/[slug]) — ikke forsiden, kategorisider eller andre
// sider. Kjøres som admin (RLS gir kun admin lesetilgang til page_views).
export async function getPostEngagementStats(
  windowDays = 30,
): Promise<PostEngagementSummary> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [{ data: viewRows, error }, allPosts] = await Promise.all([
    supabase
      .from("page_views")
      .select("path, session_id, duration_seconds, created_at")
      .gte("created_at", since)
      .like("path", "/blog/%")
      .limit(20000),
    getAllPostsForAdmin(),
  ]);

  if (error || !viewRows) {
    console.error("Klarte ikke å hente besøksstatistikk:", error?.message);
    return EMPTY_SUMMARY(windowDays);
  }

  const postBySlug = new Map(allPosts.map((post) => [post.slug, post]));
  const trendKeys = lastNDayKeys(TREND_DAYS);

  const totalViews = viewRows.length;
  const uniqueReaders = new Set(viewRows.map((row) => row.session_id)).size;
  const avgDurationSeconds = average(
    viewRows
      .map((row) => row.duration_seconds)
      .filter((d): d is number => typeof d === "number"),
  );

  const bySlug = new Map<
    string,
    {
      views: number;
      sessions: Set<string>;
      durations: number[];
      dailyCounts: Map<string, number>;
    }
  >();
  const byCategory = new Map<
    string,
    { views: number; sessions: Set<string>; durations: number[]; slugs: Set<string> }
  >();

  for (const row of viewRows) {
    const slug = row.path.replace(/^\/blog\//, "");

    const postEntry = bySlug.get(slug) ?? {
      views: 0,
      sessions: new Set<string>(),
      durations: [],
      dailyCounts: new Map<string, number>(),
    };
    postEntry.views += 1;
    postEntry.sessions.add(row.session_id);
    if (typeof row.duration_seconds === "number") {
      postEntry.durations.push(row.duration_seconds);
    }
    const key = dayKey(row.created_at);
    postEntry.dailyCounts.set(key, (postEntry.dailyCounts.get(key) ?? 0) + 1);
    bySlug.set(slug, postEntry);

    const post = postBySlug.get(slug);
    if (!post) continue;
    for (const category of categoriesForPost(post)) {
      const catEntry = byCategory.get(category) ?? {
        views: 0,
        sessions: new Set<string>(),
        durations: [],
        slugs: new Set<string>(),
      };
      catEntry.views += 1;
      catEntry.sessions.add(row.session_id);
      if (typeof row.duration_seconds === "number") {
        catEntry.durations.push(row.duration_seconds);
      }
      catEntry.slugs.add(slug);
      byCategory.set(category, catEntry);
    }
  }

  const posts: PostEngagement[] = [...bySlug.entries()]
    .map(([slug, entry]) => ({
      slug,
      title: postBySlug.get(slug)?.title ?? slug,
      views: entry.views,
      uniqueReaders: entry.sessions.size,
      avgDurationSeconds: average(entry.durations),
      trend: trendKeys.map((key) => entry.dailyCounts.get(key) ?? 0),
    }))
    .sort((a, b) => b.views - a.views);

  const categories: CategoryEngagement[] = CATEGORIES.map((category) => {
    const entry = byCategory.get(category);
    return {
      category,
      postCount: entry?.slugs.size ?? 0,
      views: entry?.views ?? 0,
      uniqueReaders: entry?.sessions.size ?? 0,
      avgDurationSeconds: entry ? average(entry.durations) : null,
    };
  }).sort((a, b) => b.views - a.views);

  return {
    totalViews,
    uniqueReaders,
    avgDurationSeconds,
    posts,
    categories,
    windowDays,
    trendDays: TREND_DAYS,
  };
}
