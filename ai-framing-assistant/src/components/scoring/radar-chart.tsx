// Composant SVG pure — radar chart 1..5 sans librairie externe.
// Affiche les N axes avec leur valeur (0..5), rings de référence
// et polygone effectif rempli. Optionnellement une seconde série
// (ex. score auto vs override) en surimpression.

export type RadarSeries = {
  label: string;
  /** Valeurs alignées sur le tableau axes (longueur identique) */
  values: number[];
  color: string;
  fillOpacity?: number;
};

export type RadarChartProps = {
  axes: { key: string; label: string; short?: string }[];
  series: RadarSeries[];
  /** Taille (px) du svg */
  size?: number;
  /** Valeur max d'un axe (par défaut 5) */
  max?: number;
};

export function RadarChart({ axes, series, size = 320, max = 5 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = axes.length;
  if (n < 3) {
    return (
      <p className="text-xs text-muted-foreground">
        Radar disponible à partir de 3 axes (actuellement {n}).
      </p>
    );
  }

  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

  const pointAt = (i: number, value: number) => {
    const angle = angleFor(i);
    const r = (Math.max(0, Math.min(max, value)) / max) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Rings (1..5)
  const rings = Array.from({ length: max }, (_, i) => i + 1);

  // Axes lines
  const axesEnd = axes.map((_, i) => pointAt(i, max));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Radar de maturité projet"
      className="h-auto w-full max-w-md"
    >
      {/* Rings */}
      {rings.map((v) => {
        const points = axes
          .map((_, i) => pointAt(i, v))
          .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(" ");
        return (
          <polygon
            key={`ring-${v}`}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeOpacity={v === max ? 0.3 : 0.12}
            strokeWidth={1}
          />
        );
      })}

      {/* Axes */}
      {axesEnd.map((p, i) => (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
        />
      ))}

      {/* Series polygons */}
      {series.map((serie, sIdx) => {
        const points = serie.values
          .map((v, i) => pointAt(i, v))
          .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(" ");
        return (
          <g key={`serie-${sIdx}`}>
            <polygon
              points={points}
              fill={serie.color}
              fillOpacity={serie.fillOpacity ?? 0.18}
              stroke={serie.color}
              strokeWidth={1.5}
            />
            {serie.values.map((v, i) => {
              const p = pointAt(i, v);
              return (
                <circle
                  key={`pt-${sIdx}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={serie.color}
                />
              );
            })}
          </g>
        );
      })}

      {/* Labels */}
      {axes.map((ax, i) => {
        const angle = angleFor(i);
        const labelR = radius + 18;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        // Anchor depending on angle
        const anchor =
          Math.abs(Math.cos(angle)) < 0.3 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
        return (
          <text
            key={`label-${ax.key}`}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={10}
            className="fill-foreground/70"
          >
            {ax.short ?? ax.label}
          </text>
        );
      })}
    </svg>
  );
}
