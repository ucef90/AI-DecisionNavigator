import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ScrollText,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DecisionForm } from "@/components/decision/decision-form";
import { finaliseDecision } from "@/lib/actions/decision";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";
import type { DecisionRationaleItem } from "@/lib/engines/decision";
import type { ActionStep } from "@/lib/engines/decision/action-plan";
import { cn } from "@/lib/utils";
import {
  AI_APPROACH_LABELS,
  DECISION_LABELS,
  USER_ROLE_LABELS,
  type Decision,
} from "@/types";

// Semantic palette.
const DECISION_STYLES: Record<Decision, string> = {
  GO_IA: "bg-success text-success-foreground",
  POC_IA: "bg-primary text-primary-foreground",
  AUTOMATION: "bg-warning text-warning-foreground",
  STUDY: "bg-secondary text-muted-foreground border border-border",
  NO_GO: "bg-destructive text-white",
};

const RATIONALE_ICONS = {
  STRENGTH: CheckCircle2,
  WEAKNESS: AlertTriangle,
  BLOCKER: ShieldAlert,
  RULE: ScrollText,
} as const;

// Semantic palette : positive = success green, weakness = warning amber,
// blocker = destructive red, rule = primary blue.
const RATIONALE_STYLES = {
  STRENGTH: "text-success",
  WEAKNESS: "text-warning",
  BLOCKER: "text-destructive",
  RULE: "text-primary",
} as const;

const HORIZON_LABELS: Record<ActionStep["horizon"], string> = {
  IMMEDIATE: "< 2 sem.",
  SHORT: "< 2 mois",
  MEDIUM: "> 2 mois",
};

const CATEGORY_LABELS: Record<ActionStep["category"], string> = {
  BUSINESS: "Métier",
  DATA: "Data",
  TECH: "Tech",
  GOVERNANCE: "Gouvernance",
  PILOT: "Pilotage",
};

export default async function DecisionPage(
  props: PageProps<"/projects/[id]/decision">,
) {
  const { id } = await props.params;
  const snapshot = await buildProjectSnapshot(id);
  if (!snapshot) notFound();

  const { decision, actionPlan, scoring } = computeEngineReport(snapshot);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projets
          </Link>
          <span>/</span>
          <Link href={`/projects/${snapshot.id}`} className="hover:underline">
            {snapshot.name}
          </Link>
          <span>/</span>
          <span>Décision</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Décision finale
        </h2>
        <p className="text-sm text-muted-foreground">
          Synthèse du moteur de décision : règles, justification structurée et plan d&apos;action.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-sm">Recommandation moteur</CardTitle>
            <p className="text-sm text-muted-foreground">{decision.headline}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn("border-0 text-base", DECISION_STYLES[decision.decision])}>
              {DECISION_LABELS[decision.decision]}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {scoring.total}/18
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {decision.overridden ? (
            <div className="flex items-start gap-2 border-l-[3px] border-destructive bg-secondary p-3 text-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold">
                  Décision contrainte par les règles métier
                </p>
                <p className="text-xs">
                  Score brut : {DECISION_LABELS[decision.decisionFromTotal]}.
                  Les règles de gouvernance abaissent la décision à {" "}
                  <strong>{DECISION_LABELS[decision.decision]}</strong>.
                </p>
              </div>
            </div>
          ) : null}

          {decision.recommendedApproach ? (
            <div className="text-xs text-muted-foreground">
              Approche technologique pressentie :{" "}
              <span className="font-medium text-foreground">
                {AI_APPROACH_LABELS[decision.recommendedApproach]}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {decision.blockers.length > 0 ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-4" />
              Bloquants à lever
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {decision.blockers.map((b) => (
              <div
                key={b.id}
                className="rounded-md border border-destructive/30 bg-destructive/5 p-2"
              >
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Justification structurée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decision.rationale.map((item, idx) => (
            <RationaleRow key={idx} item={item} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Plan d&apos;action recommandé</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {actionPlan.steps.map((step) => (
              <li
                key={step.id}
                className="flex items-start gap-3 rounded-md border border-border bg-background p-2 text-sm"
              >
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs text-background tabular-nums">
                  {step.order}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-medium">{step.title}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORY_LABELS[step.category]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {HORIZON_LABELS[step.horizon]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Pilote : {USER_ROLE_LABELS[step.owner]}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Finaliser la décision</CardTitle>
        </CardHeader>
        <CardContent>
          <DecisionForm
            projectId={snapshot.id}
            defaultDecision={decision.decision}
            action={finaliseDecision.bind(null, snapshot.id)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between border-t border-border pt-4">
        <Link
          href={`/projects/${snapshot.id}/scoring`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Scoring
        </Link>
        <Link
          href={`/projects/${snapshot.id}/cartography`}
          className={buttonVariants({ variant: "ghost" })}
        >
          Voir la cartographie →
        </Link>
      </div>
    </div>
  );
}

function RationaleRow({ item }: { item: DecisionRationaleItem }) {
  const Icon = RATIONALE_ICONS[item.kind];
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background p-2 text-sm">
      <Icon className={cn("mt-0.5 size-4 shrink-0", RATIONALE_STYLES[item.kind])} />
      <div className="space-y-0.5">
        <p className="font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </div>
    </div>
  );
}
