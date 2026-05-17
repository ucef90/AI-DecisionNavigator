import Link from "next/link";
import { Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DECISION_LABELS, type Decision } from "@/types";
import {
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  type OverallLevel,
} from "@/types/atelier4";
import type { A4GateCriterion, AxisResult, DecisionReasoning } from "@/lib/engines/atelier4";

type Props = {
  projectId: string;
  results: AxisResult[];
  overallScore: number;
  overallLevel: OverallLevel;
  decision: DecisionReasoning;
  gate: A4GateCriterion[];
  gateVerdict: "NOT_READY" | "READY" | "OVERRIDE" | null;
};

const DECISION_COLORS: Record<Decision, string> = {
  GO_IA: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  POC_IA: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  AUTOMATION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  STUDY: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NO_GO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

export function Atelier4LivePanel({
  projectId,
  results,
  overallScore,
  overallLevel,
  decision,
  gate,
  gateVerdict,
}: Props) {
  const metCount = gate.filter((c) => c.met).length;
  const weakAxes = results.filter((r) => r.effective <= 2).length;

  return (
    <aside className="space-y-5 text-sm">
      {/* Score global + niveau */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Score global
          </h3>
        </header>
        <div className="rounded-md border border-foreground/15 bg-muted/30 px-3 py-3 text-center">
          <div className="text-3xl font-semibold tabular-nums">{overallScore}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
          <div
            className={cn(
              "mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              OVERALL_LEVEL_COLORS[overallLevel],
            )}
          >
            {OVERALL_LEVEL_LABELS[overallLevel]}
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {weakAxes > 0 ? `${weakAxes} axe(s) ≤ 2` : "Tous les axes ≥ 3"}
          </div>
        </div>
      </section>

      {/* Décision recommandée */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Décision recommandée
          </h3>
        </header>
        <div className={cn("rounded-md border px-3 py-2.5", DECISION_COLORS[decision.decision])}>
          <div className="text-sm font-semibold">{DECISION_LABELS[decision.decision]}</div>
          <p className="mt-1 text-[11px] leading-snug opacity-90">{decision.rationale}</p>
        </div>
        <Link
          href={`/projects/${projectId}/atelier/4/recommendation`}
          className="block text-[11px] underline underline-offset-2"
        >
          Voir le détail →
        </Link>
      </section>

      {/* Gate atelier 5 */}
      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate atelier 5
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
          href={`/projects/${projectId}/atelier/4/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Évaluer le gate →
        </Link>
      </section>
    </aside>
  );
}
