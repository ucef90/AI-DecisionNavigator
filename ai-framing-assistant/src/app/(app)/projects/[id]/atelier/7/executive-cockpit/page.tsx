import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  ListChecks,
  Shield,
  Target,
  Trophy,
} from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { GanttChart, type GanttItem } from "@/components/visualizations/gantt-chart";
import { PriorityMatrix } from "@/components/visualizations/priority-matrix";
import { RadarChart } from "@/components/scoring/radar-chart";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DECISION_LABELS, type Decision } from "@/types";
import {
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  SCORECARD_AXES,
  SCORECARD_AXIS_SHORT,
} from "@/types/atelier4";
import { aggregateScore, computeAutoScorecard } from "@/lib/engines/atelier4";
import { aggregateGovernanceScore, computeDimensionScores } from "@/lib/engines/atelier6";
import {
  computeFinalDecision,
  computeGlobalProjectScore,
  computeIndustrializationReadiness,
  computePriorityMatrix,
  loadAtelier7Snapshot,
} from "@/lib/engines/atelier7";
import {
  INDUSTRIALIZATION_STAGE_LABELS,
  type IndustrializationStage,
  type RoadmapStatus,
} from "@/types/atelier7";

const DECISION_COLOR: Record<Decision, string> = {
  GO_IA: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  POC_IA: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  AUTOMATION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  STUDY: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NO_GO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

export default async function ExecutiveCockpitPage(
  props: PageProps<"/projects/[id]/atelier/7/executive-cockpit">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const globalScore = computeGlobalProjectScore(snap);
  const decision = computeFinalDecision(snap);
  const readiness = computeIndustrializationReadiness(snap);
  const priorityItems = computePriorityMatrix(snap);

  // Radar consolidé : 4 dimensions
  const radarAxes = [
    { key: "scoring", label: "Scoring (A4)", short: "Scoring" },
    { key: "governance", label: "Gouvernance (A6)", short: "Gouv" },
    { key: "vision", label: "Vision (A7)", short: "Vision" },
    { key: "readiness", label: "Readiness", short: "Ready" },
  ];
  const radarSeries = [
    {
      label: "Score",
      values: [
        globalScore.scoringScore / 20,
        globalScore.governanceScore / 20,
        globalScore.visionScore / 20,
        globalScore.readinessScore / 20,
      ],
      color: "#8b5cf6",
      fillOpacity: 0.22,
    },
  ];

  // Radar scoring 11 axes
  const a4Results = computeAutoScorecard(snap.a4);
  const { overallLevel: a4Level } = aggregateScore(a4Results);
  const a4RadarAxes = SCORECARD_AXES.map((a) => ({
    key: a,
    label: a,
    short: SCORECARD_AXIS_SHORT[a],
  }));
  const a4RadarSeries = [
    {
      label: "Scoring",
      values: a4Results.map((r) => r.effective),
      color: "#0ea5e9",
      fillOpacity: 0.22,
    },
  ];

  // Gouvernance 6 dims
  const a6Dims = computeDimensionScores(snap.a6);
  const { overall: govScore } = aggregateGovernanceScore(a6Dims);

  // Roadmap → Gantt
  const ganttItems: GanttItem[] = snap.roadmapItems.map((i) => ({
    id: i.id,
    title: i.title,
    phase: i.phase as GanttItem["phase"],
    effortMonths: i.effortMonths ?? 1,
    status: i.status as RoadmapStatus,
    impact: i.impact,
    complexity: i.complexity,
  }));

  return (
    <SectionShell
      phaseLabel="Phase A — Cockpit exécutif"
      title="Cockpit exécutif final"
      livrableRef="Consolidation des 7 ateliers — vue COPIL / sponsor"
      intent="Tableau de bord exécutif final : score, décision, roadmap, industrialisation — en un écran."
      pourquoi={[
        "C'est l'écran présenté au sponsor / direction pour la décision finale.",
        "Il agrège TOUT : scoring (A4), gouvernance (A6), vision (A7), readiness industrialisation.",
        "La décision finale est calculée par croisement de toutes les analyses précédentes.",
      ]}
      cherche={[
        "Le score global ≥ 60 → POC possible. ≥ 75 → industrialisation envisageable.",
        "La répartition de la matrice priorisation (où sont les quick wins ?).",
        "Le readiness industrialisation par stage : à partir de quel stage on bloque ?",
        "L'alignement décision moteur vs décision sponsor : doit converger.",
      ]}
      pieges={[
        "Présenter le cockpit avant que la matrice impact/complexité soit remplie : le COPIL ne voit pas la priorisation.",
        "Lancer le GO IA sans avoir validé le sponsor : tu prends un risque politique.",
        "Industrialiser sur un score < 60 : risque d'échec élevé en production.",
      ]}
    >
      {/* HERO : score global + décision finale */}
      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_2fr_1fr]">
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3 w-3" />
            Score global projet
          </div>
          <div className="mt-2 text-5xl font-semibold tabular-nums">{globalScore.overall}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          <div className={cn("mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider", OVERALL_LEVEL_COLORS[a4Level])}>
            {OVERALL_LEVEL_LABELS[a4Level]}
          </div>
        </article>

        <article className={cn("rounded-xl border p-6", DECISION_COLOR[decision.decision])}>
          <div className="flex items-start gap-3">
            <Target className="mt-1 h-6 w-6" />
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Décision finale IA
              </div>
              <div className="mt-1 text-3xl font-bold">{DECISION_LABELS[decision.decision]}</div>
              <p className="mt-2 text-sm leading-relaxed">{decision.rationale}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                {decision.sponsorReadyToSign ? (
                  <Badge className="border-foreground/30">✓ Sponsor peut signer</Badge>
                ) : (
                  <Badge variant="outline">⚠ Conditions sponsor non réunies</Badge>
                )}
                {snap.synthesis?.sponsorDecision === "OK" ? (
                  <Badge>Sponsor validé</Badge>
                ) : snap.synthesis?.sponsorDecision === "KO" ? (
                  <Badge variant="outline">Sponsor rejeté</Badge>
                ) : null}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-violet-50/40 to-background p-5 text-center dark:from-violet-950/30">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vision business
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{globalScore.visionScore}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          {snap.vision?.businessValueScore ? (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Valeur business : {snap.vision.businessValueScore}/5 · Transformation :{" "}
              {snap.vision.transformationScore ?? 0}/5
            </div>
          ) : (
            <Link
              href={`/projects/${id}/atelier/7/vision`}
              className="mt-2 inline-block text-[11px] underline underline-offset-2"
            >
              Définir la vision →
            </Link>
          )}
        </article>
      </div>

      {/* KPI strip — les 4 scores composants */}
      <div className="mb-6 grid gap-2 sm:grid-cols-4">
        <KpiCard label="Scoring (A4)" value={globalScore.scoringScore} unit="/100" helper="11 axes scorecard" tone={globalScore.scoringScore >= 60 ? "good" : globalScore.scoringScore >= 40 ? "warn" : "bad"} />
        <KpiCard label="Gouvernance (A6)" value={globalScore.governanceScore} unit="/100" helper="6 dimensions" tone={globalScore.governanceScore >= 60 ? "good" : globalScore.governanceScore >= 40 ? "warn" : "bad"} />
        <KpiCard label="Vision (A7)" value={globalScore.visionScore} unit="/100" helper="valeur business + transfo" tone={globalScore.visionScore >= 60 ? "good" : globalScore.visionScore >= 40 ? "warn" : "bad"} />
        <KpiCard label="Readiness" value={globalScore.readinessScore} unit="/100" helper="industrialisation" tone={globalScore.readinessScore >= 60 ? "good" : globalScore.readinessScore >= 40 ? "warn" : "bad"} />
      </div>

      {/* Industrialization readiness — 5 stages */}
      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" />
            Readiness industrialisation
          </h3>
          <Link
            href={`/projects/${id}/atelier/7/industrialization`}
            className="text-[10px] underline underline-offset-2"
          >
            Planifier →
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
          {readiness.map((r) => (
            <div
              key={r.stage}
              className={cn(
                "rounded-md border px-3 py-2 text-xs",
                r.ready
                  ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {INDUSTRIALIZATION_STAGE_LABELS[r.stage as IndustrializationStage]}
              </div>
              <div className="mt-0.5 text-sm font-semibold">
                {r.ready ? "Prêt" : "À sécuriser"}
              </div>
              {r.why ? <p className="mt-1 text-[10px] text-muted-foreground">{r.why}</p> : null}
            </div>
          ))}
        </div>
      </section>

      {/* Radars : 4 dimensions consolidées + scoring 11 axes */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4 text-foreground">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Score global consolidé (4 dimensions)
            </h3>
          </div>
          <div className="flex items-center justify-center">
            <RadarChart axes={radarAxes} series={radarSeries} size={280} max={5} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 text-foreground">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scoring détaillé (11 axes A4)
            </h3>
            <Link href={`/projects/${id}/atelier/4/cockpit`} className="text-[10px] underline underline-offset-2">
              Détail A4 →
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <RadarChart axes={a4RadarAxes} series={a4RadarSeries} size={280} />
          </div>
        </div>
      </section>

      {/* Priorisation + Roadmap Gantt */}
      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            Matrice priorisation (impact × complexité)
          </h3>
          <Link
            href={`/projects/${id}/atelier/7/prioritization`}
            className="text-[10px] underline underline-offset-2"
          >
            Éditer →
          </Link>
        </div>
        <PriorityMatrix items={priorityItems} />
      </section>

      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Roadmap transformation
          </h3>
          <Link
            href={`/projects/${id}/atelier/7/roadmap`}
            className="text-[10px] underline underline-offset-2"
          >
            Éditer →
          </Link>
        </div>
        <GanttChart items={ganttItems} />
      </section>

      {/* Forces / faiblesses / risques */}
      <section className="mb-6 grid gap-3 lg:grid-cols-3">
        <Block icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="emerald" title="Points forts" items={decision.strongPoints} empty="Pas encore de points forts." />
        <Block icon={<AlertTriangle className="h-3.5 w-3.5" />} tone="rose" title="Points faibles" items={decision.weakPoints} empty="Tous les axes ≥ 3." />
        <Block icon={<Shield className="h-3.5 w-3.5" />} tone="amber" title="Risques principaux" items={decision.mainRisks} empty="Pas de risque ≥ 4/5." />
      </section>

      {/* CTA — export livrable */}
      <section className="rounded-lg border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dossier stratégique final
            </div>
            <div className="mt-1 font-semibold">
              Générer le dossier consolidé des 7 ateliers (markdown exportable)
            </div>
            <p className="text-xs text-muted-foreground">
              Tout ce qui a été collecté en 7 ateliers, formaté en un dossier de cadrage
              IA professionnel, prêt à présenter en COPIL.
            </p>
          </div>
          <Link
            href={`/projects/${id}/atelier/7/deliverable`}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            <Download className="h-4 w-4" />
            Générer le dossier
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Suppress unused warning */}
      <div className="hidden" data-score={govScore} />
    </SectionShell>
  );
}

const TONE = {
  emerald: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
  rose: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  amber: "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20",
} as const;

function Block({
  icon,
  tone,
  title,
  items,
  empty,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className={cn("rounded-md border p-3", TONE[tone])}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {items.map((it, i) => (
            <li key={i} className="flex gap-1.5">
              <span>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
