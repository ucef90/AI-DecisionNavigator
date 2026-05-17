import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, FileOutput, Map, Scale, Target } from "lucide-react";

import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { NextStepBanner } from "@/components/onboarding/next-step-banner";
import { WelcomeTour } from "@/components/onboarding/welcome-tour";
import { deleteProject } from "@/lib/actions/projects";
import { computeNextStep } from "@/lib/engines/next-step";

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

  // Smart "next step" detection (engine that scans all 7 ateliers' gates)
  const nextStep = await computeNextStep(snapshot.id);

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
        <div className="flex items-center gap-2">
          <StatusBadge status={(await getStatus(id)) ?? "DRAFT"} />
          <DecisionBadge decision={await getFinalDecision(id)} />
          <WelcomeTour projectId={snapshot.id} projectName={snapshot.name} />
        </div>
      </div>

      {/* Bannière "prochaine étape" — guide l'utilisateur où aller */}
      <NextStepBanner step={nextStep} />

      <div className="rounded-xl border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpenCheck className="h-3.5 w-3.5" />
          Mode atelier consultant — 7 étapes
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/projects/${snapshot.id}/atelier/1`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 1 sur 7
              </div>
              <div className="text-sm font-semibold">Comprendre le vrai problème métier</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cartographie, irritants, gate.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/2`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 2 sur 7
              </div>
              <div className="text-sm font-semibold">IA ou automatisation ?</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Matrice, profil pressenti, archi cible.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/3`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 3 sur 7
              </div>
              <div className="text-sm font-semibold">Questionnaire de cadrage IA</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Consolidation, maturité dérivée, points critiques.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/4`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 4 sur 7
              </div>
              <div className="text-sm font-semibold">Scoring et maturité projet IA</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                11 axes auto, radar, décision recommandée.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/5`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 5 sur 7
              </div>
              <div className="text-sm font-semibold">Cartographie IA complète</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                6 couches consolidées, annotations, archi cible.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/6`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:border-foreground/40"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 6 sur 7
              </div>
              <div className="text-sm font-semibold">Gouvernance, risques et conformité IA</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cockpit RACI, heatmap, conformité, monitoring.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
          <Link
            href={`/projects/${snapshot.id}/atelier/7`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-foreground/40 bg-gradient-to-br from-violet-50/40 to-background px-4 py-3 transition hover:border-foreground dark:from-violet-950/30"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atelier 7 sur 7 — Décision finale
              </div>
              <div className="text-sm font-semibold">Architecture cible, roadmap & décision finale IA</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cockpit exécutif, Gantt, dossier exportable.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
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

      {/* Zone de danger */}
      <details className="mt-6 rounded-lg border border-border bg-muted/20 p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Zone de danger
        </summary>
        <div className="mt-3">
          <DeleteProjectButton
            projectId={snapshot.id}
            projectName={snapshot.name}
            onConfirm={async (formData) => {
              "use server";
              await deleteProject(snapshot.id, formData);
            }}
          />
        </div>
      </details>
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
