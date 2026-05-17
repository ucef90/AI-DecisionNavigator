// Jauge circulaire de conformité (% sur 100), rendu SVG.
// Utilisée pour le cockpit gouvernance (score conformité par framework).

import { cn } from "@/lib/utils";

type Props = {
  /** Score 0..100 */
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
};

export function ComplianceGauge({ value, label, sublabel, size = 120 }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 75 ? "#10b981" : clamped >= 50 ? "#f59e0b" : "#e11d48";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md border border-border bg-background px-3 py-2",
      )}
      style={{ minWidth: size + 16 }}
    >
      <div className="relative inline-flex" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={8}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-semibold tabular-nums">{clamped}</div>
          <div className="text-[10px] text-muted-foreground">/ 100</div>
        </div>
      </div>
      <div className="mt-1 text-center">
        <div className="text-xs font-semibold">{label}</div>
        {sublabel ? <div className="text-[10px] text-muted-foreground">{sublabel}</div> : null}
      </div>
    </div>
  );
}
