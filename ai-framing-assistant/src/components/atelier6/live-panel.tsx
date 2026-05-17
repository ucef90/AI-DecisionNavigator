import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GOVERNANCE_LEVEL_COLORS,
  GOVERNANCE_LEVEL_LABELS,
} from "@/types/atelier6";
import type {
  A6GateCriterion,
  DimensionScore,
  GovernanceReasoning,
} from "@/lib/engines/atelier6";
import { governanceLevelFromScore } from "@/types/atelier6";

type Props = {
  projectId: string;
  dims: DimensionScore[];
  overallScore: number;
  reasoning: GovernanceReasoning;
  gate: A6GateCriterion[];
  gateVerdict: "NOT_READY" | "READY" | "OVERRIDE" | null;
};

export function Atelier6LivePanel({
  projectId,
  dims,
  overallScore,
  reasoning,
  gate,
  gateVerdict,
}: Props) {
  const metCount = gate.filter((c) => c.met).length;
  const level = governanceLevelFromScore(overallScore);

  return (
    <aside className="space-y-5 text-sm">
      {/* Score gouvernance */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Score gouvernance
          </h3>
        </header>
        <div className="rounded-md border border-foreground/15 bg-muted/30 px-3 py-3 text-center">
          <div className="text-3xl font-semibold tabular-nums">{overallScore}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
          <div
            className={cn(
              "mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              GOVERNANCE_LEVEL_COLORS[level],
            )}
          >
            {GOVERNANCE_LEVEL_LABELS[level]}
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {reasoning.industrializationReadiness
              ? "✓ Industrialisation possible"
              : "⚠ Industrialisation pas encore validée"}
          </div>
        </div>
      </section>

      {/* Mini dashboard 6 dimensions */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            6 dimensions
          </h3>
        </header>
        <div className="space-y-1">
          {dims.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px]"
            >
              <span className="flex-1 truncate">{d.label}</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full",
                    d.score >= 70
                      ? "bg-emerald-500"
                      : d.score >= 40
                        ? "bg-amber-500"
                        : "bg-rose-500",
                  )}
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <span className="w-8 text-right tabular-nums">{d.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gate atelier 7 */}
      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate atelier 7
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
                <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>{c.label}</div>
                {!c.met && c.why ? (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{c.why}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href={`/projects/${projectId}/atelier/6/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Évaluer le gate →
        </Link>
      </section>
    </aside>
  );
}
