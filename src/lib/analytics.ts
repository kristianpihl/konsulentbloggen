import { createClient } from "@/lib/supabase/server";

export interface PathStat {
  path: string;
  views: number;
  uniqueSessions: number;
  avgDurationSeconds: number | null;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueSessions: number;
  avgDurationSeconds: number | null;
  byPath: PathStat[];
  windowDays: number;
}

const EMPTY_SUMMARY = (windowDays: number): AnalyticsSummary => ({
  totalViews: 0,
  uniqueSessions: 0,
  avgDurationSeconds: null,
  byPath: [],
  windowDays,
});

// Henter og aggregerer besøksstatistikk for de siste `windowDays` dagene.
// Kjøres som admin (RLS gir kun admin lesetilgang til page_views).
export async function getPageViewStats(
  windowDays = 30,
): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("page_views")
    .select("path, session_id, duration_seconds")
    .gte("created_at", since)
    .limit(20000);

  if (error || !data) {
    console.error("Klarte ikke å hente besøksstatistikk:", error?.message);
    return EMPTY_SUMMARY(windowDays);
  }

  const totalViews = data.length;
  const uniqueSessions = new Set(data.map((row) => row.session_id)).size;

  const allDurations = data
    .map((row) => row.duration_seconds)
    .filter((d): d is number => typeof d === "number");
  const avgDurationSeconds = allDurations.length
    ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
    : null;

  const byPathMap = new Map<
    string,
    { views: number; sessions: Set<string>; durations: number[] }
  >();

  for (const row of data) {
    const entry = byPathMap.get(row.path) ?? {
      views: 0,
      sessions: new Set<string>(),
      durations: [],
    };
    entry.views += 1;
    entry.sessions.add(row.session_id);
    if (typeof row.duration_seconds === "number") {
      entry.durations.push(row.duration_seconds);
    }
    byPathMap.set(row.path, entry);
  }

  const byPath: PathStat[] = [...byPathMap.entries()]
    .map(([path, entry]) => ({
      path,
      views: entry.views,
      uniqueSessions: entry.sessions.size,
      avgDurationSeconds: entry.durations.length
        ? entry.durations.reduce((sum, d) => sum + d, 0) /
          entry.durations.length
        : null,
    }))
    .sort((a, b) => b.views - a.views);

  return { totalViews, uniqueSessions, avgDurationSeconds, byPath, windowDays };
}
