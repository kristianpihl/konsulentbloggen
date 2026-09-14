// Enkel, avhengighetsfri trendlinje for å vise sidevisninger per dag.
// Rendres direkte i en Server Component (ren SVG, ingen interaktivitet).
export function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 0);

  if (data.length === 0 || max === 0) {
    return <span className="text-xs text-black/30">Ingen visninger ennå</span>;
  }

  const width = 100;
  const height = 28;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="text-black/50"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
