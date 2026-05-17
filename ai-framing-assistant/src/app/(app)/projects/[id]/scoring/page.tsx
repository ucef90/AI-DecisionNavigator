import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoringForm } from "@/components/scoring/scoring-form";
import { saveScoring } from "@/lib/actions/scoring";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { DECISION_LABELS, type Decision } from "@/types";

// Semantic palette.
const DECISION_STYLES: Record<Decision, string> = {
  GO_IA: "bg-success text-success-foreground",
  POC_IA: "bg-primary text-primary-foreground",
  AUTOMATION: "bg-warning text-warning-foreground",
  STUDY: "bg-secondary text-muted-foreground border border-border",
  NO_GO: "bg-destructive text-white",
};

export default async function ScoringPage(
  props: PageProps<"/projects/[id]/scoring">,
) {
  const { id } = await props.params;
  const snapshot = await buildProjectSnapshot(id);
  if (!snapshot) notFound();

  const report = computeEngineReport(snapshot);
  const persisted = await prisma.scoring.findUnique({ where: { projectId: id } });

  // Default values: persisted scoring (user has saved) → use those.
  // Otherwise → use the engine-computed scoring as defaults.
  const computedDefaults = report.scoring.axes.map((a) => ({ ...a }));
  if (persisted) {
    const map = {
      needClarity: persisted.needClarity,
      aiRelevance: persisted.aiRelevance,
      dataMaturity: persisted.dataMaturity,
      businessValue: persisted.businessValue,
      riskControl: persisted.riskControl,
      feasibility: persisted.feasibility,
    } as const;
    for (const axis of computedDefaults) {
      axis.value = clamp(map[axis.id]) as 1 | 2 | 3;
    }
  }

  const total = computedDefaults.reduce((s, a) => s + a.value, 0);
  const recommendation = (persisted?.recommendation as Decision | undefined) ?? report.scoring.recommendation;
  const justification = persisted?.justification ?? "";

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
          <span>Scoring</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Moteur de scoring
        </h2>
        <p className="text-sm text-muted-foreground">
          6 axes notés de 1 à 3 — total /18, lecture selon SPEC §177.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Synthèse moteur</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {total}/18
            </Badge>
            <Badge
              className={cn(
                "border-0",
                DECISION_STYLES[recommendation],
              )}
            >
              {DECISION_LABELS[recommendation]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{report.scoring.reading}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric
              label="Maturité dérivée"
              value={MATURITY_LABEL[report.maturity.level]}
            />
            <Metric
              label="Confiance globale"
              value={report.scoring.confidence.toLowerCase()}
            />
            <Metric
              label="Signaux détectés"
              value={String(report.maturity.signals.length)}
            />
            <Metric
              label="Bloquants"
              value={String(report.decision.blockers.length)}
            />
          </div>
        </CardContent>
      </Card>

      {report.maturity.signals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Signaux détectés par le moteur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.maturity.signals.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 rounded-md border border-border bg-background p-2 text-sm"
              >
                <span
                  className={cn(
                    "mt-1.5 inline-block size-2 shrink-0 rounded-full",
                    s.severity === "CRITICAL"
                      ? "bg-destructive"
                      : s.severity === "WARNING"
                        ? "bg-warning"
                        : "bg-muted-foreground/50",
                  )}
                />
                <div className="space-y-0.5">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notes (override possible)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoringForm
            projectId={snapshot.id}
            action={saveScoring.bind(null, snapshot.id)}
            defaults={{
              axes: computedDefaults,
              recommendation,
              justification,
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between border-t border-border pt-4">
        <Link
          href={`/projects/${snapshot.id}/wizard/risks`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Retour au wizard
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

const MATURITY_LABEL: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
};

function clamp(n: number): 1 | 2 | 3 {
  if (n <= 1) return 1;
  if (n >= 3) return 3;
  return 2;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
