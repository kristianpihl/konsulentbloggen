import type { TrendPoint } from "@/lib/newsletter";

// Trendgraf over aktive abonnenter. Ren SVG, rendres på serveren.
export function SubscriberChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-black/50">Ingen abonnenter ennå.</p>;
  }

  const W = 640;
  const H = 220;
  const pad = { l: 36, r: 12, t: 12, b: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxValue = Math.max(1, ...data.map((p) => p.active));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i: number) => pad.l + (data.length > 1 ? i * stepX : innerW / 2);
  const y = (v: number) => pad.t + innerH - (v / maxValue) * innerH;

  const line = data.map((p, i) => `${x(i).toFixed(1)},${y(p.active).toFixed(1)}`).join(" ");
  const area = `${x(0).toFixed(1)},${y(0).toFixed(1)} ${line} ${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)}`;
  const ticks = Array.from(new Set([0, Math.round(maxValue / 2), maxValue]));
  const last = data[data.length - 1];

  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-black" role="img"
        aria-label={`Antall aktive abonnenter over tid, nå ${last.active}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.08} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.5}>
              {t}
            </text>
          </g>
        ))}
        <polygon points={area} fill="currentColor" fillOpacity={0.07} />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(data.length - 1)} cy={y(last.active)} r={4} fill="currentColor" />
      </svg>
      <div className="mt-1 flex justify-between pl-9 text-xs text-black/50">
        <span>{fmt(data[0].date)}</span>
        {data.length > 2 && <span>{fmt(data[Math.floor(data.length / 2)].date)}</span>}
        <span>{fmt(last.date)}</span>
      </div>
    </div>
  );
}
