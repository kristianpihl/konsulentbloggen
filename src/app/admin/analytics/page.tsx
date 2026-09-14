import Link from "next/link";
import { Sparkline } from "@/components/admin/sparkline";
import { getPostEngagementStats, MAX_COMPLETION_RATE } from "@/lib/analytics";
import { categorySlug } from "@/lib/categories";

export const revalidate = 0;

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)} sek`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} min ${rest} sek`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value)}%`;
}

// Fullføringsgrad clampes på et tak (se MAX_COMPLETION_RATE) — vis "+"
// når taket er nådd, så det er tydelig at det ikke er et eksakt tall.
function formatCompletionRate(value: number | null): string {
  if (value === null) return "—";
  const suffix = value >= MAX_COMPLETION_RATE ? "+" : "";
  return `${Math.round(value)}%${suffix}`;
}

export default async function AnalyticsPage() {
  const stats = await getPostEngagementStats(30);

  return (
    <div>
      <h1 className="text-xl font-semibold">Statistikk</h1>
      <p className="mt-1 text-sm text-black/60">
        Engasjement på blogginnleggene dine, siste {stats.windowDays} dager.
        Anonymt: ingen cookies eller personopplysninger, kun side, tilfeldig
        sesjon, varighet, scroll-dybde og delinger.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Sidevisninger</p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalViews}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Unike lesere</p>
          <p className="mt-1 text-2xl font-semibold">{stats.uniqueReaders}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Snitt lesetid</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatDuration(stats.avgDurationSeconds)}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Fullføringsgrad</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatCompletionRate(stats.completionRate)}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Delingsrate</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatPercent(stats.shareRate)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Kategorier</h2>
      <p className="mt-1 text-sm text-black/50">
        Samlet engasjement per kategori — sortert på mest engasjerende først.
        Et innlegg kan telle i flere kategorier hvis det har flere tags.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Innlegg</th>
              <th className="px-4 py-3 font-medium">Visninger</th>
              <th className="px-4 py-3 font-medium">Lesere</th>
              <th className="px-4 py-3 font-medium">Lesetid</th>
              <th className="px-4 py-3 font-medium">Fullføring</th>
              <th className="px-4 py-3 font-medium">Delt</th>
              <th className="px-4 py-3 font-medium">Scroll</th>
              <th className="px-4 py-3 font-medium">
                Trend ({stats.trendDays}d)
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.categories.map((category) => (
              <tr
                key={category.category}
                className="border-b border-black/5 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/kategori/${categorySlug(category.category)}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {category.category}
                  </Link>
                </td>
                <td className="px-4 py-3">{category.postCount}</td>
                <td className="px-4 py-3">{category.views}</td>
                <td className="px-4 py-3">{category.uniqueReaders}</td>
                <td className="px-4 py-3">
                  {formatDuration(category.avgDurationSeconds)}
                </td>
                <td className="px-4 py-3">
                  {formatCompletionRate(category.completionRate)}
                </td>
                <td className="px-4 py-3">
                  {category.shares} ({formatPercent(category.shareRate)})
                </td>
                <td className="px-4 py-3">
                  {formatPercent(category.avgScrollDepth)}
                </td>
                <td className="px-4 py-3">
                  <Sparkline data={category.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Innlegg</h2>
      <p className="mt-1 text-sm text-black/50">
        Sortert på flest visninger. <strong>Fullføring</strong> sammenligner
        faktisk lesetid mot estimert lesetid (~200 ord/min) — det sterkeste
        engasjement-signalet. <strong>Trend</strong> viser sidevisninger per
        dag siste {stats.trendDays} dager.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-3 font-medium">Innlegg</th>
              <th className="px-4 py-3 font-medium">Visninger</th>
              <th className="px-4 py-3 font-medium">Lesere</th>
              <th className="px-4 py-3 font-medium">Lesetid</th>
              <th className="px-4 py-3 font-medium">Fullføring</th>
              <th className="px-4 py-3 font-medium">Delt</th>
              <th className="px-4 py-3 font-medium">Scroll</th>
              <th className="px-4 py-3 font-medium">
                Trend ({stats.trendDays}d)
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.posts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-black/50">
                  Ingen besøksdata på innlegg registrert ennå.
                </td>
              </tr>
            )}
            {stats.posts.map((post) => (
              <tr
                key={post.slug}
                className="border-b border-black/5 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{post.views}</td>
                <td className="px-4 py-3">{post.uniqueReaders}</td>
                <td className="px-4 py-3">
                  {formatDuration(post.avgDurationSeconds)}
                </td>
                <td className="px-4 py-3">
                  {formatCompletionRate(post.completionRate)}
                </td>
                <td className="px-4 py-3">
                  {post.shares} ({formatPercent(post.shareRate)})
                </td>
                <td className="px-4 py-3">
                  {formatPercent(post.avgScrollDepth)}
                </td>
                <td className="px-4 py-3">
                  <Sparkline data={post.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
