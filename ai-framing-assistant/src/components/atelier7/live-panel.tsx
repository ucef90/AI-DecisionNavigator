import Link from "next/link";
import { Target, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DECISION_LABELS } from "@/types";
import type {
  A7GateCriterion,
  FinalDecisionResult,
  GlobalProjectScore,
} from "@/lib/engines/atelier7";

type Props = {
  projectId: string;
  globalScore: GlobalProjectScore;
  decision: FinalDecisionResult;
  gate: A7GateCriterion[];
  gateVerdict: "NOT_READY" | "CLOSED" | "OVERRIDE" | null;
};

const DECISION_COLOR = {
  GO_IA: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  POC_IA: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  AUTOMATION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  STUDY: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NO_GO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

export function Atelier7LivePanel({ projectId, globalScore, decision, gate, gateVerdict }: Props) {
  const metCount = gate.filter((c) => c.met).length;

  return (
    <aside className="space-y-5 text-sm">
      {/* Score global projet */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Score global projet
          </h3>
        </header>
        <div className="rounded-md border border-foreground/15 bg-muted/30 px-3 py-3 text-center">
          <div className="text-3xl font-semibold tabular-nums">{globalScore.overall}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
          <div className="mt-2 space-y-1 text-[10px]">
            <Mini label="Scoring (A4)" value={globalScore.scoringScore} />
            <Mini label="Gouvernance (A6)" value={globalScore.governanceScore} />
            <Mini label="Vision (A7)" value={globalScore.visionScore} />
            <Mini label="Readiness" value={globalScore.readinessScore} />
          </div>
        </div>
      </section>

      {/* Décision finale */}
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Décision finale
          </h3>
        </header>
        <div className={cn("rounded-md border px-3 py-2.5", DECISION_COLOR[decision.decision])}>
          <div className="text-sm font-semibold">{DECISION_LABELS[decision.decision]}</div>
          <p className="mt-1 text-[11px] leading-snug opacity-90">{decision.rationale}</p>
          {decision.sponsorReadyToSign ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider">
              ✓ Sponsor peut signer
            </p>
          ) : (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-70">
              ⚠ Conditions non réunies pour sign-off
            </p>
          )}
        </div>
        <Link
          href={`/projects/${projectId}/atelier/7/final-decision`}
          className="block text-[11px] underline underline-offset-2"
        >
          Voir le détail →
        </Link>
      </section>

      {/* Gate clôture */}
      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Clôture framework
          </h3>
          <Badge
            variant={
              gateVerdict === "CLOSED" || gateVerdict === "OVERRIDE" || metCount === gate.length
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
          href={`/projects/${projectId}/atelier/7/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Clôturer →
        </Link>
      </section>
    </aside>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
