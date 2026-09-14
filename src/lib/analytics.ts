import { createClient } from "@/lib/supabase/server";
import { getAllPostsForAdmin } from "@/lib/posts";

export interface PostEngagement {
  slug: string;
  title: string;
  views: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
}

export interface PostEngagementSummary {
  totalViews: number;
  uniqueReaders: number;
  avgDurationSeconds: number | null;
  posts: PostEngagement[];
  windowDays: number;
}

const EMPTY_SUMMARY = (windowDays: number): PostEngagementSummary => ({
  totalViews: 0,
  uniqueReaders: 0,
  avgDurationSeconds: null,
  posts: [],
  windowDays,
});

function average(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
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
      .select("path, session_id, duration_seconds")
      .gte("created_at", since)
      .like("path", "/blog/%")
      .limit(20000),
    getAllPostsForAdmin(),
  ]);

  if (error || !viewRows) {
    console.error("Klarte ikke å hente besøksstatistikk:", error?.message);
    return EMPTY_SUMMARY(windowDays);
  }

  const titleBySlug = new Map(allPosts.map((post) => [post.slug, post.title]));

  const totalViews = viewRows.length;
  const uniqueReaders = new Set(viewRows.map((row) => row.session_id)).size;
  const avgDurationSeconds = average(
    viewRows
      .map((row) => row.duration_seconds)
      .filter((d): d is number => typeof d === "number"),
  );

  const bySlug = new Map<
    string,
    { views: number; sessions: Set<string>; durations: number[] }
  >();

  for (const row of viewRows) {
    const slug = row.path.replace(/^\/blog\//, "");
    const entry = bySlug.get(slug) ?? {
      views: 0,
      sessions: new Set<string>(),
      durations: [],
    };
    entry.views += 1;
    entry.sessions.add(row.session_id);
    if (typeof row.duration_seconds === "number") {
      entry.durations.push(row.duration_seconds);
    }
    bySlug.set(slug, entry);
  }

  const posts: PostEngagement[] = [...bySlug.entries()]
    .map(([slug, entry]) => ({
      slug,
      title: titleBySlug.get(slug) ?? slug,
      views: entry.views,
      uniqueReaders: entry.sessions.size,
      avgDurationSeconds: average(entry.durations),
    }))
    .sort((a, b) => b.views - a.views);

  return { totalViews, uniqueReaders, avgDurationSeconds, posts, windowDays };
}
