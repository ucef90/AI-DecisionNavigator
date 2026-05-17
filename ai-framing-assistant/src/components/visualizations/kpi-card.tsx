// Carte KPI compacte avec valeur, unité, tendance optionnelle.
// Utilisée dans les dashboards de cockpit.

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  helper?: string;
  tone?: "default" | "good" | "warn" | "bad";
  icon?: React.ReactNode;
};

const TONES = {
  default: "border-border bg-background",
  good: "border-emerald-500/40 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  warn: "border-amber-500/40 bg-amber-50/60 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  bad: "border-rose-500/40 bg-rose-50/60 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100",
} as const;

export function KpiCard({ label, value, unit, helper, tone = "default", icon }: Props) {
  return (
    <div className={cn("rounded-md border px-3 py-2.5", TONES[tone])}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {helper ? <p className="mt-0.5 text-[10px] leading-snug opacity-70">{helper}</p> : null}
    </div>
  );
}
