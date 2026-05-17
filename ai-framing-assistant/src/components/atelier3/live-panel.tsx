import Link from "next/link";
import { AlertTriangle, Info, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  A3GateCriterion,
  CriticalPoint,
  DerivedMaturity,
} from "@/lib/engines/atelier3";

type Props = {
  projectId: string;
  criticalPoints: CriticalPoint[];
  gate: A3GateCriterion[];
  gateVerdict: "NOT_READY" | "READY" | "OVERRIDE" | null;
  derivedMaturity: DerivedMaturity;
  coverageAvg: number;
};

const SEV_ICON = { LOW: Info, MEDIUM: Info, HIGH: AlertTriangle, CRITICAL: ShieldAlert } as const;

const SEV_BG = {
  LOW: "border-sky-500/30 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  MEDIUM: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  HIGH: "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
  CRITICAL: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
} as const;

const MATURITY_COLOR = {
  LOW: "text-rose-700 dark:text-rose-300",
  MEDIUM: "text-amber-700 dark:text-amber-300",
  HIGH: "text-emerald-700 dark:text-emerald-300",
} as const;

export function Atelier3LivePanel({
  projectId,
  criticalPoints,
  gate,
  gateVerdict,
  derivedMaturity,
  coverageAvg,
}: Props) {
  const metCount = gate.filter((c) => c.met).length;

  return (
    <aside className="space-y-5 text-sm">
      {/* Maturité dérivée — la VRAIE valeur de l'atelier 3 */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Maturité dérivée
          </h3>
        </header>
        <div className="rounded-md border border-foreground/15 bg-muted/30 px-3 py-3">
          <div className={`text-lg font-semibold ${MATURITY_COLOR[derivedMaturity.overall]}`}>
            {derivedMaturity.overall === "LOW"
              ? "Faible"
              : derivedMaturity.overall === "MEDIUM"
                ? "Moyenne"
                : "Élevée"}
          </div>
          <div className="mt-2 space-y-1">
            <MaturityBar label="Clarté besoin" v={derivedMaturity.needClarity} />
            <MaturityBar label="Workflow" v={derivedMaturity.workflowKnowledge} />
            <MaturityBar label="Data" v={derivedMaturity.dataMaturity} />
            <MaturityBar label="Gouvernance" v={derivedMaturity.governanceMaturity} />
            <MaturityBar label="Alignement" v={derivedMaturity.stakeholderAlignment} />
            <MaturityBar label="Réalisme" v={derivedMaturity.realismLevel} />
          </div>
        </div>
      </section>

      {/* Couverture moyenne */}
      <section className="space-y-2">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Couverture moyenne
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {coverageAvg}%
          </Badge>
        </header>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-foreground" style={{ width: `${coverageAvg}%` }} />
        </div>
        <Link
          href={`/projects/${projectId}/atelier/3/coverage`}
          className="block text-[11px] underline underline-offset-2"
        >
          Voir la vue de couverture détaillée →
        </Link>
      </section>

      {/* Points critiques */}
      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Points critiques
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {criticalPoints.length}
          </Badge>
        </header>
        {criticalPoints.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Aucun point critique détecté pour l&apos;instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {criticalPoints.slice(0, 4).map((p) => {
              const Icon = SEV_ICON[p.severity];
              return (
                <li
                  key={p.id}
                  className={cn("rounded-md border px-3 py-2 text-xs leading-snug", SEV_BG[p.severity])}
                >
                  <div className="flex items-start gap-1.5">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="font-semibold">{p.title}</div>
                      <p className="opacity-90">{p.detail}</p>
                      {p.fixHint ? (
                        <p className="text-[10px] italic opacity-80">{p.fixHint}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Gate atelier 4 */}
      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate atelier 4
          </h3>
          <Badge
            variant={
              gateVerdict === "READY" || gateVerdict === "OVERRIDE" || metCount === gate.length
                ? "default"
                : "outline"
            }
          >
            {metCount}/{gate.length}
          </Badge>
        </header>
        <ul className="space-y-1">
          {gate.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  c.met ? "bg-emerald-500" : "bg-muted",
                )}
              />
              <div className="flex-1">
                <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>
                  {c.label}
                </div>
                {!c.met && c.why ? (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{c.why}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href={`/projects/${projectId}/atelier/3/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Évaluer le gate →
        </Link>
      </section>
    </aside>
  );
}

function MaturityBar({ label, v }: { label: string; v: number }) {
  const pct = (v / 5) * 100;
  const color = v < 2.5 ? "bg-rose-500" : v < 4 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-[10px] text-muted-foreground">{label}</div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-5 text-right text-[10px] tabular-nums">{v}/5</div>
    </div>
  );
}
