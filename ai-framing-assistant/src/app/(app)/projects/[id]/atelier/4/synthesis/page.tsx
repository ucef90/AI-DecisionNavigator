import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { SynthesisEditor, type SynthesisDraft } from "@/components/atelier4/synthesis-editor";
import { type Decision } from "@/types";
import { type OverallLevel } from "@/types/atelier4";
import { saveSynthesis, type SynthesisPatch } from "@/lib/actions/atelier4/synthesis";
import {
  aggregateScore,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
} from "@/lib/engines/atelier4";

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

// §15 Synthèse scoring projet — édition + auto-suggest.
export default async function SynthesisSectionPage(
  props: PageProps<"/projects/[id]/atelier/4/synthesis">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const results = computeAutoScorecard(snap);
  const { overallLevel } = aggregateScore(results);
  const reco = recommendDecision(snap, results);

  // Auto-derive feasibility / risk levels from the snapshot
  const f = snap.feasibility;
  const fAxes = [
    f?.technicallyFeasible,
    f?.organizationallyFeasible,
    f?.regulatorilyFeasible,
    f?.resourcesAvailable,
    f?.dataAvailable,
  ].filter((v): v is number => typeof v === "number");
  const fAvg = fAxes.length ? fAxes.reduce((s, v) => s + v, 0) / fAxes.length : 0;
  const suggestedFeas: SynthesisDraft["globalFeasibility"] =
    fAvg >= 4 ? "HIGH" : fAvg >= 2.5 ? "MEDIUM" : fAvg > 0 ? "LOW" : "";

  const r = snap.riskAssessment;
  const suggestedRisk: SynthesisDraft["globalRisk"] = (() => {
    if (!r?.overallRisk) return "";
    const v = r.overallRisk;
    if (v === "LOW" || v === "MEDIUM" || v === "HIGH" || v === "CRITICAL") return v;
    return "";
  })();

  const existing = snap.a4Synthesis;
  const initial: SynthesisDraft = {
    globalMaturity: ((existing?.globalMaturity as OverallLevel | null) ?? "") as OverallLevel | "",
    globalFeasibility:
      ((existing?.globalFeasibility as SynthesisDraft["globalFeasibility"] | null) ?? "") as SynthesisDraft["globalFeasibility"],
    globalRisk:
      ((existing?.globalRisk as SynthesisDraft["globalRisk"] | null) ?? "") as SynthesisDraft["globalRisk"],
    recommendedDecision: ((existing?.recommendedDecision as Decision | null) ?? "") as Decision | "",
    decisionRationale: existing?.decisionRationale ?? "",
    strongPoints: safeJSON<string[]>(existing?.strongPoints, []),
    weakPoints: safeJSON<string[]>(existing?.weakPoints, []),
    topRecommendations: safeJSON<string[]>(existing?.topRecommendations, []),
  };

  const suggested: SynthesisDraft = {
    globalMaturity: overallLevel,
    globalFeasibility: suggestedFeas,
    globalRisk: suggestedRisk,
    recommendedDecision: reco.decision,
    decisionRationale: reco.rationale,
    strongPoints: reco.strongPoints,
    weakPoints: reco.weakPoints,
    topRecommendations: reco.topRecommendations,
  };

  async function save(draft: SynthesisDraft) {
    "use server";
    const patch: SynthesisPatch = {
      globalMaturity: draft.globalMaturity,
      globalFeasibility: draft.globalFeasibility,
      globalRisk: draft.globalRisk,
      recommendedDecision: draft.recommendedDecision,
      decisionRationale: draft.decisionRationale,
      strongPoints: draft.strongPoints,
      weakPoints: draft.weakPoints,
      topRecommendations: draft.topRecommendations,
    };
    await saveSynthesis(id, patch);
  }

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse + gate atelier 5"
      title="Synthèse scoring projet"
      livrableRef="§15 du livrable atelier 4"
      intent="Rédige la synthèse à présenter en COPIL — le moteur propose un premier jet, à toi de l'affiner."
      pourquoi={[
        "C'est le document qui sera lu hors atelier (sponsor, direction) — la qualité du rationnel est ce qui fait passer ou rejeter le projet.",
        "Le moteur produit un brouillon basé sur les données ; ton rôle est d'ajuster ton, nuances, contexte spécifique.",
        "La synthèse est aussi la SOURCE du livrable markdown final.",
      ]}
      cherche={[
        "Une décision claire et défendable (GO IA / POC / Auto / Étude / NO GO).",
        "3-5 points forts factuels (axes ≥ 4 du scoring).",
        "3-5 points faibles avec actions correctives implicites.",
        "3-5 recommandations prioritaires actionnables (qui / quoi / quand).",
      ]}
      pieges={[
        "Reprendre le rationnel auto sans le contextualiser : le COPIL le verra.",
        "Lister 10 recommandations : on ne sait plus laquelle est prioritaire. Garde-en 5 max.",
        "Synthèse trop optimiste alors que des axes sont rouges : tu perds en crédibilité.",
      ]}
    >
      <SynthesisEditor initial={initial} suggested={suggested} onSave={save} />
    </SectionShell>
  );
}
