import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RadarChart } from "@/components/scoring/radar-chart";
import { DECISION_LABELS } from "@/types";
import {
  ATELIER4_PHASES,
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  SCORECARD_AXES,
  SCORECARD_AXIS_SHORT,
} from "@/types/atelier4";
import {
  a4OverallProgress,
  a4PhaseProgress,
  aggregateScore,
  computeA4Progress,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
} from "@/lib/engines/atelier4";

export default async function Atelier4LandingPage(
  props: PageProps<"/projects/[id]/atelier/4">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA4Progress(snap);
  const overall = a4OverallProgress(snap);
  const results = computeAutoScorecard(snap);
  const { overallScore, overallLevel } = aggregateScore(results);
  const decision = recommendDecision(snap, results);

  const allSec = ATELIER4_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  const radarAxes = SCORECARD_AXES.map((a) => ({ key: a, label: a, short: SCORECARD_AXIS_SHORT[a] }));
  const radarSeries = [
    {
      label: "Effectif",
      values: results.map((r) => r.effective),
      color: "#0ea5e9",
      fillOpacity: 0.22,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 4 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Scoring et maturité projet IA</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              11 axes notés <strong>automatiquement</strong> à partir des données collectées
              dans les ateliers 1 à 3. Tu peux surcharger n&apos;importe quel axe avec une note
              manuelle justifiée. Le moteur agrège un score /100, recommande un niveau global,
              et propose une décision argumentée (GO IA / POC / Automatisation / Étude / NO GO).
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/4/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Ouvrir le cockpit" : "Reprendre"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Hero : score + radar + décision */}
      <section className="grid gap-4 lg:grid-cols-[1fr_minmax(0,1.2fr)_1fr]">
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-6 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Score global
          </div>
          <div className="mt-2 text-5xl font-semibold tabular-nums">{overallScore}</div>
          <div className="text-xs text-muted-foreground">sur 100</div>
          <div
            className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${OVERALL_LEVEL_COLORS[overallLevel]}`}
          >
            {OVERALL_LEVEL_LABELS[overallLevel]}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Calculé sur 11 axes (1-5 chacun). Les axes &le; 2 tirent le score vers le bas.
          </p>
        </article>

        <article className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Radar maturité
            </h3>
          </div>
          <div className="flex items-center justify-center text-foreground">
            <RadarChart axes={radarAxes} series={radarSeries} size={280} />
          </div>
        </article>

        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-violet-50/40 via-background to-sky-50/40 p-6 dark:from-violet-950/30 dark:to-sky-950/30">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 text-foreground/70" />
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Décision recommandée
              </div>
              <div className="text-lg font-semibold">{DECISION_LABELS[decision.decision]}</div>
              <p className="text-xs text-muted-foreground">{decision.rationale}</p>
              {decision.topRecommendations.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                  {decision.topRecommendations.slice(0, 3).map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parcours en 5 phases
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER4_PHASES.map((phase, idx) => {
            const ratio = a4PhaseProgress(snap, phase.id);
            const sections = phase.sections;
            const done = sections.filter((s) => sectionProgress[s.id].status === "COMPLETE").length;
            return (
              <article key={phase.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Phase {phase.id}
                      {idx < ATELIER4_PHASES.length - 1 ? " →" : ""}
                    </div>
                    <div className="mt-0.5 font-semibold leading-tight">{phase.title}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {done}/{sections.length}
                  </Badge>
                </header>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{phase.intent}</p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-foreground/80 transition-all" style={{ width: `${ratio}%` }} />
                </div>
                <ul className="mt-3 space-y-0.5 text-[11px] text-muted-foreground">
                  {sections.map((s) => (
                    <li key={s.id} className="flex items-center gap-1.5">
                      <span
                        className={
                          sectionProgress[s.id].status === "COMPLETE"
                            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                            : sectionProgress[s.id].status === "STARTED"
                              ? "h-1.5 w-1.5 rounded-full bg-amber-400"
                              : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                        }
                      />
                      <Link
                        href={`/projects/${snap.projectId}/atelier/4/${s.id}`}
                        className="truncate hover:underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
