import Link from "next/link";
import { notFound } from "next/navigation";
import { FileOutput, Map, Scale, Target } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DecisionBadge,
  StatusBadge,
} from "@/components/projects/status-badge";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { MATURITY_LABELS } from "@/types";

const MATURITY_DERIVED_LABEL: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
};

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  const { id } = await props.params;
  const snapshot = await buildProjectSnapshot(id);
  if (!snapshot) notFound();

  // Run the engines on every detail view — the snapshot is small and the
  // engines are pure. If this becomes a hot path later, memoise in DB.
  const report = computeEngineReport(snapshot);

  const declaredMaturity = snapshot.maturity
    ? MATURITY_LABELS[snapshot.maturity]
    : null;
  const derivedMaturity = MATURITY_DERIVED_LABEL[report.maturity.level];
  const need = snapshot.businessNeed;
  const total = report.scoring.total;

  // A "questionnaire complete" flag — does the user have enough data for
  // the engines to be meaningful?
  const questionnaireFilled =
    !!snapshot.businessNeed &&
    !!snapshot.aiAnalysis &&
    !!snapshot.dataAssessment &&
    !!snapshot.architecture &&
    !!snapshot.riskAssessment;

  // Number of persisted deliverables — surfaced on the engine card.
  const deliverablesCount = await prisma.deliverable.count({
    where: { projectId: snapshot.id },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/projects" className="hover:underline">
              Projets
            </Link>
            <span>/</span>
            <span>{snapshot.name}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {snapshot.name}
          </h2>
          {snapshot.description ? (
            <p className="text-sm text-muted-foreground">
              {snapshot.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <StatusBadge status={(await getStatus(id)) ?? "DRAFT"} />
          <DecisionBadge decision={await getFinalDecision(id)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EngineCard
          icon={Scale}
          title="Scoring"
          metric={questionnaireFilled ? `${total}/18` : "—"}
          subtitle={questionnaireFilled ? report.scoring.reading : "Wizard à compléter"}
          href={`/projects/${snapshot.id}/scoring`}
          ready={questionnaireFilled}
        />
        <EngineCard
          icon={Target}
          title="Décision"
          metric={report.decision.decision}
          subtitle={report.decision.headline}
          href={`/projects/${snapshot.id}/decision`}
          ready={questionnaireFilled}
        />
        <EngineCard
          icon={Map}
          title="Cartographie"
          metric={`${Object.values(report.cartography.layers).reduce((s, g) => s + g.nodes.length, 0)} nœuds`}
          subtitle="6 vues systémiques"
          href={`/projects/${snapshot.id}/cartography`}
          ready={questionnaireFilled}
        />
        <EngineCard
          icon={FileOutput}
          title="Livrables"
          metric={`${deliverablesCount}/7`}
          subtitle="Note de cadrage, fiche de décision, plan d'action…"
          href={`/projects/${snapshot.id}/deliverables`}
          ready={questionnaireFilled}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <InfoRow label="Direction" value={snapshot.direction} />
          <InfoRow label="Sponsor" value={snapshot.sponsor} />
          <InfoRow label="Maturité déclarée" value={declaredMaturity} />
          <InfoRow
            label="Maturité dérivée"
            value={questionnaireFilled ? derivedMaturity : "—"}
          />
          <InfoRow label="Confiance moteur" value={report.scoring.confidence.toLowerCase()} />
          <InfoRow label="Signaux détectés" value={String(report.maturity.signals.length)} />
        </CardContent>
      </Card>

      {report.maturity.signals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Signaux détectés par le moteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.maturity.signals.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 rounded-md border border-border bg-background p-2 text-sm"
              >
                <span
                  className={cn(
                    "mt-1.5 inline-block size-1.5 shrink-0",
                    s.severity === "CRITICAL"
                      ? "bg-destructive"
                      : s.severity === "WARNING"
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
                <div className="space-y-0.5">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
            {report.maturity.signals.length > 5 ? (
              <p className="text-xs text-muted-foreground">
                +{report.maturity.signals.length - 5} autres signaux dans la page scoring.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Besoin métier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <Block
            label="Demande initiale"
            value={need?.initialRequest}
            placeholder="Sera collectée à l'étape 2 (reformulation par l'assistant IA)."
          />
          <Block label="Objectif attendu" value={need?.expectedValue} />
          <Block label="Utilisateurs concernés" value={need?.usersImpacted} />
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
          ← Retour aux projets
        </Link>
        <Link
          href={`/projects/${snapshot.id}/wizard`}
          className={buttonVariants()}
        >
          {questionnaireFilled ? "Reprendre le cadrage" : "Continuer le cadrage"} →
        </Link>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

async function getStatus(id: string): Promise<string | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    select: { status: true },
  });
  return row?.status ?? null;
}

async function getFinalDecision(id: string): Promise<string | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    select: { finalDecision: true },
  });
  return row?.finalDecision ?? null;
}

function EngineCard({
  icon: Icon,
  title,
  metric,
  subtitle,
  href,
  ready,
}: {
  icon: LucideIcon;
  title: string;
  metric: string;
  subtitle: string;
  href: string;
  ready: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-2 rounded-md border bg-background p-4 transition-colors",
        ready
          ? "border-border hover:border-foreground/30"
          : "border-dashed border-border/60 opacity-80 hover:opacity-100",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Icon className="size-4" />
          {title}
        </div>
        <span className="text-sm font-semibold tabular-nums">{metric}</span>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
    </Link>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function Block({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <p className={value ? "whitespace-pre-wrap text-foreground" : "text-muted-foreground italic"}>
        {value || placeholder || "—"}
      </p>
    </div>
  );
}
