import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { CockpitEditor, type CockpitAxisRow } from "@/components/atelier4/cockpit-editor";
import { RadarChart } from "@/components/scoring/radar-chart";
import { Badge } from "@/components/ui/badge";
import { DECISION_LABELS } from "@/types";
import {
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  SCORECARD_AXES,
  SCORECARD_AXIS_SHORT,
  type ScorecardAxis,
} from "@/types/atelier4";
import { acceptAllAutoScores, patchScorecard } from "@/lib/actions/atelier4/scorecard";
import {
  aggregateScore,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
} from "@/lib/engines/atelier4";
import type { ScoreValue } from "@/types/score-levels";

// LA section pivot de l'atelier 4 — le cockpit scoring.
// Affiche les 11 axes auto-calculés avec leur rationale,
// permet l'override par le CDP, et montre en direct l'impact
// sur le score global, le radar et la décision recommandée.

export default async function CockpitSectionPage(
  props: PageProps<"/projects/[id]/atelier/4/cockpit">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const results = computeAutoScorecard(snap);
  const { overallScore, overallLevel } = aggregateScore(results);
  const decision = recommendDecision(snap, results);

  const rows: CockpitAxisRow[] = results.map((r) => ({
    axis: r.axis,
    auto: r.auto,
    autoRationale: r.autoRationale,
    effective: r.effective,
    isOverride: r.isOverride,
    manualJustification: r.manualJustification,
  }));

  const radarAxes = SCORECARD_AXES.map((a) => ({
    key: a,
    label: a,
    short: SCORECARD_AXIS_SHORT[a],
  }));
  const radarSeries = [
    {
      label: "Effectif",
      values: results.map((r) => r.effective),
      color: "#0ea5e9",
      fillOpacity: 0.22,
    },
  ];
  // Si overrides existent, on superpose la série auto pour montrer l'écart
  const hasOverrides = results.some((r) => r.isOverride);
  if (hasOverrides) {
    radarSeries.push({
      label: "Auto",
      values: results.map((r) => r.auto),
      color: "#94a3b8",
      fillOpacity: 0.08,
    });
  }

  async function patch(
    axis: ScorecardAxis,
    payload: { value: ScoreValue | null; isAuto?: boolean; justification?: string | null },
  ): Promise<void> {
    "use server";
    await patchScorecard(id, { axis, ...payload });
  }
  async function acceptAll(): Promise<void> {
    "use server";
    const values: Partial<Record<ScorecardAxis, ScoreValue>> = {};
    for (const r of results) values[r.axis] = r.auto;
    await acceptAllAutoScores(id, values);
  }

  return (
    <SectionShell
      phaseLabel="Phase A — Cockpit scoring"
      title="Cockpit · 11 axes notés (1-5)"
      livrableRef="§1 et §2 du livrable atelier 4"
      intent="Vue d'ensemble du scoring projet, auto-calculé depuis les ateliers 1 à 3 — overrides possibles avec justification."
      pourquoi={[
        "Le scoring objective la décision IA — sans lui, on raisonne au feeling.",
        "11 axes couvrent toutes les dimensions critiques (besoin, data, workflow, gouvernance, risques, complexité, faisabilité, réglo, SI, IA).",
        "Les valeurs auto évitent la re-saisie : le moteur lit ce qui a été collecté avant et applique les règles consulting.",
      ]}
      cherche={[
        "Les axes ≤ 2 (en rouge) — ce sont les points à adresser AVANT toute décision GO.",
        "Les axes 3 (orange) — zones grises, à challenger.",
        "Les axes ≥ 4 (vert) — points d'appui pour la décision.",
        "Les écarts auto vs override : où ton expérience diverge des règles ? Justifie chaque override.",
      ]}
      pieges={[
        "Surcharger sans justification : le COPIL ne pourra pas défendre la note.",
        "Tout passer en 5 : le scoring perd toute valeur — sois lucide sur les faiblesses.",
        "Ignorer un axe rouge : c'est précisément ce qu'il faut creuser, pas masquer.",
      ]}
      aside={
        <div className="space-y-3">
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Score global
            </div>
            <div className="text-3xl font-semibold tabular-nums">{overallScore}</div>
            <div className="text-[10px] text-muted-foreground">/ 100</div>
            <div
              className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${OVERALL_LEVEL_COLORS[overallLevel]}`}
            >
              {OVERALL_LEVEL_LABELS[overallLevel]}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3 text-foreground">
            <RadarChart axes={radarAxes} series={radarSeries} size={220} />
            {hasOverrides ? (
              <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Effectif
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Auto
                </span>
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Décision pressentie
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {DECISION_LABELS[decision.decision]}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              {decision.rationale}
            </p>
          </div>
        </div>
      }
    >
      <CockpitEditor projectId={id} rows={rows} patch={patch} acceptAllAuto={acceptAll} />
    </SectionShell>
  );
}
