import { getPageViewStats } from "@/lib/analytics";

export const revalidate = 0;

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)} sek`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} min ${rest} sek`;
}

export default async function AnalyticsPage() {
  const stats = await getPageViewStats(30);

  return (
    <div>
      <h1 className="text-xl font-semibold">Statistikk</h1>
      <p className="mt-1 text-sm text-black/60">
        Siste {stats.windowDays} dager. Anonym: ingen cookies eller
        personopplysninger, kun side, tilfeldig sesjon og varighet.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Sidevisninger</p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalViews}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Unike besøkende</p>
          <p className="mt-1 text-2xl font-semibold">{stats.uniqueSessions}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/50">Snitt tid på side</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatDuration(stats.avgDurationSeconds)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Per side</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-3 font-medium">Side</th>
              <th className="px-4 py-3 font-medium">Visninger</th>
              <th className="px-4 py-3 font-medium">Unike besøkende</th>
              <th className="px-4 py-3 font-medium">Snitt tid</th>
            </tr>
          </thead>
          <tbody>
            {stats.byPath.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-black/50">
                  Ingen besøksdata registrert ennå.
                </td>
              </tr>
            )}
            {stats.byPath.map((row) => (
              <tr
                key={row.path}
                className="border-b border-black/5 last:border-b-0"
              >
                <td className="px-4 py-3 font-mono">{row.path}</td>
                <td className="px-4 py-3">{row.views}</td>
                <td className="px-4 py-3">{row.uniqueSessions}</td>
                <td className="px-4 py-3">
                  {formatDuration(row.avgDurationSeconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
