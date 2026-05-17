// Atelier 4 — Scoring & maturité projet IA
//
// L'engine fait 3 choses :
//   1. AUTO-SCORE les 11 axes depuis la donnée ateliers 1-3.
//      Les valeurs auto sont des "best guesses" basées sur des
//      règles de complétude / qualité. Le CDP peut surcharger
//      chaque axe avec une note manuelle + justification.
//   2. AGRÈGE en score global /100 + niveau (CRITICAL...EXCELLENT).
//   3. RAISONNE pour proposer une décision (GO_IA / POC / etc.)
//      avec ses raisons explicites — c'est la VALEUR consultant.

import { prisma } from "@/lib/prisma";
import type { Decision } from "@/types";
import {
  ATELIER4_PHASES,
  SCORECARD_AXES,
  allA4Sections,
  levelFromOverallScore,
  type Atelier4PhaseId,
  type Atelier4SectionId,
  type OverallLevel,
  type PriorityLevel,
  type ScorecardAxis,
} from "@/types/atelier4";
import type { ScoreValue } from "@/types/score-levels";
import { deriveMaturity, loadAtelier3Snapshot, type Atelier3Snapshot } from "@/lib/engines/atelier3";

export type Atelier4Snapshot = Atelier3Snapshot & {
  scorecard: Awaited<ReturnType<typeof prisma.projectScorecard.findUnique>>;
  priority: Awaited<ReturnType<typeof prisma.priorityAssessment.findUnique>>;
  a4Synthesis: Awaited<ReturnType<typeof prisma.atelier4Synthesis.findUnique>>;
  a4Gate: Awaited<ReturnType<typeof prisma.atelier4Gate.findUnique>>;
};

export async function loadAtelier4Snapshot(projectId: string): Promise<Atelier4Snapshot | null> {
  const base = await loadAtelier3Snapshot(projectId);
  if (!base) return null;
  const [scorecard, priority, a4Synthesis, a4Gate] = await Promise.all([
    prisma.projectScorecard.findUnique({ where: { projectId } }),
    prisma.priorityAssessment.findUnique({ where: { projectId } }),
    prisma.atelier4Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier4Gate.findUnique({ where: { projectId } }),
  ]);
  return { ...base, scorecard, priority, a4Synthesis, a4Gate };
}

// -------------------------------------------------------------
// AUTO-SCORE — règles déterministes par axe
// -------------------------------------------------------------
export type AxisResult = {
  axis: ScorecardAxis;
  auto: ScoreValue;
  /** Justification courte expliquant POURQUOI ce score auto */
  autoRationale: string;
  /** Effective = override si présent, sinon auto */
  effective: ScoreValue;
  isOverride: boolean;
  manualJustification?: string;
};

export function computeAutoScorecard(snap: Atelier4Snapshot): AxisResult[] {
  const overrides = parseOverrides(snap);
  const autos = SCORECARD_AXES.map((axis) => {
    const { score, why } = autoScoreOne(axis, snap);
    const override = overrides.values[axis];
    const isOverride = override != null;
    return {
      axis,
      auto: score,
      autoRationale: why,
      effective: (isOverride ? (override as ScoreValue) : score) as ScoreValue,
      isOverride,
      manualJustification: overrides.justifications[axis],
    } satisfies AxisResult;
  });
  return autos;
}

type Overrides = {
  values: Partial<Record<ScorecardAxis, number>>;
  justifications: Partial<Record<ScorecardAxis, string>>;
  autoFlags: Partial<Record<ScorecardAxis, boolean>>;
};

function parseOverrides(snap: Atelier4Snapshot): Overrides {
  const sc = snap.scorecard;
  if (!sc) return { values: {}, justifications: {}, autoFlags: {} };
  // autoFlags : true = auto, false = manuel.
  const autoFlags = safeJSON<Record<string, boolean>>(sc.autoFlags, {});
  const justifications = safeJSON<Record<string, string>>(sc.justifications, {});
  const values: Partial<Record<ScorecardAxis, number>> = {};
  for (const axis of SCORECARD_AXES) {
    const raw = (sc as unknown as Record<string, number | null>)[axis];
    // si auto-flag explicitement true → ignorer la valeur stockée,
    // on re-calcule à chaque lecture. Sinon (false ou absent), on
    // garde la valeur stockée comme override manuel.
    if (raw != null && autoFlags[axis] === false) {
      values[axis] = raw;
    }
  }
  return { values, justifications, autoFlags };
}

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function clamp(n: number): ScoreValue {
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return Math.round(n) as ScoreValue;
}

// Règles d'auto-scoring par axe.
// Chaque règle renvoie un score + un "why" affiché au CDP.
function autoScoreOne(
  axis: ScorecardAxis,
  snap: Atelier4Snapshot,
): { score: ScoreValue; why: string } {
  switch (axis) {
    case "businessMaturity": {
      const bn = snap.businessNeed;
      const reformulated = (bn?.reformulatedNeed ?? "").trim();
      const techMentioned = /\b(IA|LLM|RAG|chatbot|agent|GPT|copilot)\b/i.test(reformulated);
      const irritants = snap.irritants.length;
      const measuredKpis = snap.kpis.filter((k) => k.measureStatus === "MEASURED").length;
      const gateReady = snap.atelier1Gate?.verdict === "READY";
      let s = 1;
      const facts: string[] = [];
      if (reformulated.length >= 60 && !techMentioned) { s = 2; facts.push("reformulation propre"); }
      if (s >= 2 && irritants >= 3) { s = 3; facts.push(`${irritants} irritants`); }
      if (s >= 3 && measuredKpis >= 1) { s = 4; facts.push(`${measuredKpis} KPI mesuré`); }
      if (s >= 4 && gateReady) { s = 5; facts.push("gate atelier 1 OK"); }
      return { score: clamp(s), why: facts.join(" · ") || "Besoin peu formalisé." };
    }
    case "dataQuality": {
      const da = snap.dataAssessment;
      let s = 1;
      const facts: string[] = [];
      if (da) { s = 2; facts.push("data assessment démarré"); }
      if (da?.quality) { s = 3; facts.push(`qualité: ${da.quality}`); }
      if (da?.quality && da?.availability) { s = 4; facts.push("dispo renseignée"); }
      if (s === 4 && (da?.history || (snap.kpis.length > 0 && snap.kpis.every((k) => k.measureStatus === "MEASURED")))) {
        s = 5;
        facts.push("historique + KPI mesurés");
      }
      return { score: clamp(s), why: facts.join(" · ") || "Données non qualifiées." };
    }
    case "workflowMaturity": {
      const steps = snap.processSteps.length;
      const qualified = snap.taskQualifications.length;
      let s = 1;
      const facts: string[] = [];
      if (steps >= 1) { s = 2; facts.push(`${steps} étape(s) AS-IS`); }
      if (steps >= 3) s = 3;
      if (steps >= 5) { s = 4; facts.push("workflow détaillé"); }
      if (steps >= 5 && qualified >= 3) { s = 5; facts.push("tâches qualifiées atelier 2"); }
      return { score: clamp(s), why: facts.join(" · ") || "Workflow non cartographié." };
    }
    case "governanceMaturity": {
      const hv = snap.humanValidations.length;
      const reg = snap.regulatoryAnalysis;
      let s = 1;
      const facts: string[] = [];
      if (hv >= 1) { s = 2; facts.push(`${hv} point(s) validation`); }
      if (hv >= 1 && reg?.dpoConsulted) { s = 3; facts.push("DPO consulté"); }
      if (hv >= 2 && reg?.dpoConsulted && reg?.auditRequired) { s = 4; facts.push("audit prévu"); }
      if (s === 4 && snap.atelier2Synthesis?.governanceLevel) { s = 5; facts.push("gouvernance synthétisée"); }
      return { score: clamp(s), why: facts.join(" · ") || "Gouvernance non définie." };
    }
    case "riskControl": {
      const r = snap.riskAssessment;
      let s = 1;
      const facts: string[] = [];
      const scored =
        (r?.rgpdRisk ? 1 : 0) +
        (r?.hallucinationRisk ? 1 : 0) +
        (r?.biasRisk ? 1 : 0) +
        (r?.securityRisk ? 1 : 0) +
        (r?.adoptionRisk ? 1 : 0);
      if (r) { s = 2; facts.push("RiskAssessment ouvert"); }
      if (scored >= 3) { s = 3; facts.push(`${scored} axes risques évalués`); }
      if (scored >= 5 && r?.mitigationPlan?.trim()) { s = 4; facts.push("plan de mitigation"); }
      if (s === 4 && r?.overallRisk && (r.overallRisk === "LOW" || r.overallRisk === "MEDIUM")) {
        s = 5;
        facts.push("risque global maîtrisé");
      }
      return { score: clamp(s), why: facts.join(" · ") || "Risques non évalués." };
    }
    case "complexityScore": {
      // Inversé : 5 = simple, 1 = très complexe
      const c = snap.complexity;
      if (!c) return { score: 3, why: "Complexité non évaluée — score neutre." };
      const avg =
        ((c.workflowComplexity ?? 3) +
          (c.documentComplexity ?? 3) +
          (c.decisionComplexity ?? 3) +
          (c.governanceComplexity ?? 3)) /
        4;
      const simplicity = clamp(6 - avg);
      return {
        score: simplicity,
        why: `Complexité moyenne : ${avg.toFixed(1)}/5 → simplicité ${simplicity}/5`,
      };
    }
    case "technicalFeasibility": {
      const f = snap.feasibility;
      if (f?.technicallyFeasible) {
        return {
          score: clamp(f.technicallyFeasible),
          why: "Auto-évaluation atelier 3 reprise.",
        };
      }
      // Heuristique fallback : peu de dépendances bloquantes + techno candidates
      const blocking = snap.dependencies.filter((d) => d.blocking).length;
      const techs = snap.technologies.length;
      let s = 2;
      if (techs >= 2) s = 3;
      if (techs >= 3 && blocking === 0) s = 4;
      return { score: clamp(s), why: `${techs} techno(s), ${blocking} bloquante(s).` };
    }
    case "organizationalFeasibility": {
      const f = snap.feasibility;
      if (f?.organizationallyFeasible) {
        return { score: clamp(f.organizationallyFeasible), why: "Auto-éval atelier 3." };
      }
      const sponsor = Boolean(snap.qualification?.businessOwner);
      const scopeValidated = Boolean(snap.scope?.scopeValidatedBy);
      let s = sponsor ? 3 : 2;
      if (sponsor && scopeValidated) s = 4;
      return { score: clamp(s), why: sponsor ? "Sponsor identifié." : "Pas de sponsor identifié." };
    }
    case "regulatoryReadiness": {
      const f = snap.feasibility;
      if (f?.regulatorilyFeasible) {
        return { score: clamp(f.regulatorilyFeasible), why: "Auto-éval atelier 3." };
      }
      const r = snap.regulatoryAnalysis;
      let s = 1;
      const facts: string[] = [];
      if (r) { s = 2; facts.push("analyse réglo démarrée"); }
      if (r?.dpoConsulted) { s = 3; facts.push("DPO consulté"); }
      if (r?.dpoConsulted && r?.euAiActTier && r.euAiActTier !== "NONE") { s = 4; facts.push(`AI Act: ${r.euAiActTier}`); }
      return { score: clamp(s), why: facts.join(" · ") || "Pas d'analyse réglementaire." };
    }
    case "siIndependence": {
      // 5 = peu de dépendances ; 1 = beaucoup de dépendances bloquantes
      const total = snap.dependencies.length;
      const blocking = snap.dependencies.filter((d) => d.blocking).length;
      if (total === 0) return { score: 3, why: "Aucune dépendance listée — score neutre." };
      if (blocking >= 2) return { score: 1, why: `${blocking} dépendance(s) bloquante(s).` };
      if (blocking === 1) return { score: 2, why: "1 dépendance bloquante." };
      if (total > 5) return { score: 3, why: `${total} dépendances mais aucune bloquante.` };
      return { score: 4, why: `${total} dépendance(s) sans blocage.` };
    }
    case "aiReadiness": {
      // Heuristique simple : profil atelier 2 + techno candidates
      const profile = snap.atelier2Synthesis?.recommendedProfile;
      const techs = snap.technologies.length;
      const intel = snap.intelligenceNeeds.length;
      let s = 2;
      if (techs >= 2) s = 3;
      if (techs >= 3 && intel >= 3) s = 4;
      if (s === 4 && (profile === "AI_HYBRID" || profile === "AI_CENTRIC")) s = 5;
      return { score: clamp(s), why: `${techs} techno(s), ${intel} besoin(s), profil ${profile ?? "—"}.` };
    }
  }
}

// -------------------------------------------------------------
// Score global agrégé + niveau qualitatif
// -------------------------------------------------------------
export function aggregateScore(results: AxisResult[]): {
  total: number;
  overallScore: number;
  overallLevel: OverallLevel;
} {
  const total = results.reduce((sum, r) => sum + r.effective, 0);
  const overallScore = Math.round((total / (results.length * 5)) * 100);
  return { total, overallScore, overallLevel: levelFromOverallScore(overallScore) };
}

// -------------------------------------------------------------
// REASONER — recommandation de décision IA
// -------------------------------------------------------------
export type DecisionReasoning = {
  decision: Decision;
  rationale: string;
  strongPoints: string[];
  weakPoints: string[];
  topRecommendations: string[];
};

export function recommendDecision(snap: Atelier4Snapshot, results: AxisResult[]): DecisionReasoning {
  const byAxis = Object.fromEntries(results.map((r) => [r.axis, r.effective])) as Record<
    ScorecardAxis,
    ScoreValue
  >;
  const { overallScore, overallLevel } = aggregateScore(results);
  const profile = snap.atelier2Synthesis?.recommendedProfile;

  // Critères clés
  const lowAxes = results.filter((r) => r.effective <= 2).map((r) => r.axis);
  const blockingReg = snap.regulatoryAnalysis?.euAiActTier === "UNACCEPTABLE";
  const blockingData = byAxis.dataQuality <= 2;
  const blockingGov = byAxis.governanceMaturity <= 2;
  const blockingFeas = byAxis.technicalFeasibility <= 2 || byAxis.organizationalFeasibility <= 2;

  const strongPoints = results
    .filter((r) => r.effective >= 4)
    .slice(0, 4)
    .map((r) => `${labelOf(r.axis)} (${r.effective}/5)`);

  const weakPoints = results
    .filter((r) => r.effective <= 2)
    .map((r) => `${labelOf(r.axis)} (${r.effective}/5)`);

  // Décision logique
  let decision: Decision = "STUDY";
  let rationale = "";

  if (blockingReg) {
    decision = "NO_GO";
    rationale = "EU AI Act marque ce projet comme inacceptable — interdiction d'usage IA.";
  } else if (overallLevel === "IMMATURE" || lowAxes.length >= 5) {
    decision = "NO_GO";
    rationale = `Projet immature (${overallScore}/100) ou ${lowAxes.length} axes faibles — cadrage à reprendre avant tout investissement.`;
  } else if (profile === "AUTOMATION_ONLY") {
    decision = "AUTOMATION";
    rationale = "Profil atelier 2 = automatisation classique. Pas de valeur IA démontrée — BPM/RPA + APIs.";
  } else if (blockingData || blockingGov || lowAxes.length >= 3) {
    decision = "STUDY";
    rationale = `Conditions préalables non réunies (${blockingData ? "data faible · " : ""}${blockingGov ? "gouvernance faible · " : ""}${lowAxes.length} axe(s) ≤ 2) — étude complémentaire requise avant POC.`;
  } else if (overallLevel === "VERY_MATURE" && !blockingFeas) {
    decision = "GO_IA";
    rationale = `Projet très mature (${overallScore}/100), tous axes solides — industrialisable directement.`;
  } else if (overallLevel === "MATURE" || (overallLevel === "INTERMEDIATE" && byAxis.aiReadiness >= 3)) {
    decision = "POC_IA";
    rationale = `Projet ${overallLevel === "MATURE" ? "mature" : "intermédiaire"} (${overallScore}/100), conditions raisonnables — POC ciblé pour valider sur un périmètre restreint.`;
  } else {
    decision = "STUDY";
    rationale = `Score ${overallScore}/100 — étude complémentaire pour renforcer ${lowAxes.length} axe(s) faible(s) avant POC.`;
  }

  // Top recommandations
  const topRecommendations: string[] = [];
  if (blockingData) topRecommendations.push("Renforcer la qualité data — pré-requis IA.");
  if (blockingGov) topRecommendations.push("Mettre en place la gouvernance (DPO, validations humaines).");
  if (blockingFeas) topRecommendations.push("Lever les dépendances SI / clarifier la faisabilité technique.");
  if (byAxis.businessMaturity <= 2) topRecommendations.push("Re-cadrer le besoin métier (atelier 1).");
  if (byAxis.workflowMaturity <= 2) topRecommendations.push("Cartographier le workflow AS-IS.");
  if (byAxis.regulatoryReadiness <= 2 && snap.dataAssessment?.personalData) {
    topRecommendations.push("Consulter le DPO en urgence (données personnelles).");
  }
  if (decision === "POC_IA") topRecommendations.push("Cadrer un POC sur 1 cas d'usage à fort impact / faible risque.");
  if (decision === "GO_IA") topRecommendations.push("Lancer le projet ; prévoir un comité de pilotage IA mensuel.");

  return {
    decision,
    rationale,
    strongPoints,
    weakPoints,
    topRecommendations: topRecommendations.slice(0, 5),
  };
}

function labelOf(axis: ScorecardAxis): string {
  const map: Record<ScorecardAxis, string> = {
    businessMaturity: "Maturité métier",
    dataQuality: "Qualité données",
    workflowMaturity: "Workflow",
    governanceMaturity: "Gouvernance",
    riskControl: "Maîtrise risques",
    complexityScore: "Simplicité",
    technicalFeasibility: "Faisabilité technique",
    organizationalFeasibility: "Faisabilité orga",
    regulatoryReadiness: "Réglementaire",
    siIndependence: "Indépendance SI",
    aiReadiness: "Préparation IA",
  };
  return map[axis];
}

// -------------------------------------------------------------
// Priority auto-recommendation
// -------------------------------------------------------------
export function recommendPriority(snap: Atelier4Snapshot, results: AxisResult[]): {
  level: PriorityLevel;
  rationale: string;
} {
  const { overallLevel, overallScore } = aggregateScore(results);
  const m1Ready = snap.atelier1Gate?.verdict === "READY";
  const profile = snap.atelier2Synthesis?.recommendedProfile;

  if (overallLevel === "IMMATURE") {
    return { level: "DEPRIORITIZED", rationale: `Projet immature (${overallScore}/100) — re-cadrer avant tout investissement.` };
  }
  if (overallLevel === "VERY_MATURE" && (profile === "AI_HYBRID" || profile === "AI_CENTRIC")) {
    return { level: "STRATEGIC", rationale: "Projet très mature, profil IA — candidat industrialisation prioritaire." };
  }
  if (overallLevel === "MATURE" && m1Ready) {
    return { level: "HIGH", rationale: `Projet mature (${overallScore}/100), cadrage atelier 1 validé.` };
  }
  if (overallLevel === "INTERMEDIATE") {
    return { level: "MEDIUM", rationale: `Projet intermédiaire (${overallScore}/100) — POC à cadrer avant priorisation forte.` };
  }
  return { level: "LOW", rationale: `Projet fragile (${overallScore}/100) — étude complémentaire à mener.` };
}

// -------------------------------------------------------------
// Progress + gate
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";
export type SectionProgress = { id: Atelier4SectionId; status: SectionStatus; note?: string };

export function computeA4Progress(snap: Atelier4Snapshot): Record<Atelier4SectionId, SectionProgress> {
  const out = {} as Record<Atelier4SectionId, SectionProgress>;
  const set = (id: Atelier4SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };

  const results = computeAutoScorecard(snap);
  const overrideCount = results.filter((r) => r.isOverride).length;
  const justifiedCount = results.filter((r) => r.manualJustification && r.manualJustification.length > 5).length;

  // Cockpit = toujours dispo dès qu'on a 1 donnée — on considère "STARTED" par défaut
  set("cockpit", { status: snap.scorecard ? "COMPLETE" : "STARTED" });
  set("justifications", {
    status: justifiedCount === 0 ? "EMPTY" : justifiedCount >= 3 ? "COMPLETE" : "STARTED",
    note: `${justifiedCount}/11 justifié(s)`,
  });
  set("radar", { status: "COMPLETE" }); // toujours visible
  set("risk-matrix", { status: snap.riskAssessment ? "COMPLETE" : "EMPTY" });
  set("feasibility-matrix", { status: snap.feasibility ? "COMPLETE" : "EMPTY" });

  const p = snap.priority;
  set("priority", { status: p?.level ? "COMPLETE" : "EMPTY" });

  const a4s = snap.a4Synthesis;
  set("recommendation", { status: a4s?.recommendedDecision ? "COMPLETE" : "EMPTY" });
  const synthFilled =
    (a4s?.globalMaturity ? 1 : 0) +
    (a4s?.recommendedDecision ? 1 : 0) +
    (a4s?.decisionRationale ? 1 : 0);
  set("synthesis", { status: synthFilled === 0 ? "EMPTY" : synthFilled >= 2 ? "COMPLETE" : "STARTED" });

  const g = snap.a4Gate;
  set("gate", { status: g?.verdict === "READY" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY" });

  // Note d'usage : la valeur "STARTED" du cockpit est plus indicative
  // que sémantique ; on l'utilise pour pousser le CDP à vérifier les
  // justifications.
  void overrideCount;

  return out;
}

export function a4OverallProgress(snap: Atelier4Snapshot): number {
  const sections = allA4Sections();
  const prog = computeA4Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a4PhaseProgress(snap: Atelier4Snapshot, phaseId: Atelier4PhaseId): number {
  const phase = ATELIER4_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA4Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

export type A4GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier4Snapshot["a4Gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA4Gate(snap: Atelier4Snapshot): A4GateCriterion[] {
  const results = computeAutoScorecard(snap);
  const { overallScore } = aggregateScore(results);
  const weakAxes = results.filter((r) => r.effective <= 2).length;
  const reco = recommendDecision(snap, results);

  return [
    {
      id: "scoringComplete",
      label: "Scorecard auto + revue (≥ 1 justification manuelle)",
      met: Boolean(snap.scorecard) && overallScore > 0,
      why: !snap.scorecard ? "Scorecard non sauvegardée." : undefined,
    },
    {
      id: "weakPointsAddressed",
      label: "Points faibles identifiés et adressés (justifications)",
      met: weakAxes === 0 || results.filter((r) => r.effective <= 2 && r.manualJustification).length === weakAxes,
      why:
        weakAxes > 0
          ? `${weakAxes} axe(s) faible(s) sans justification.`
          : undefined,
    },
    {
      id: "priorityDefined",
      label: "Priorité projet définie",
      met: Boolean(snap.priority?.level),
      why: !snap.priority?.level ? "Priorité non renseignée." : undefined,
    },
    {
      id: "decisionRecommended",
      label: "Décision recommandée saisie",
      met: Boolean(snap.a4Synthesis?.recommendedDecision),
      why: !snap.a4Synthesis?.recommendedDecision ? `Auto-suggérée : ${reco.decision}.` : undefined,
    },
    {
      id: "synthesisWritten",
      label: "Synthèse scoring rédigée",
      met: Boolean(snap.a4Synthesis?.decisionRationale),
      why: !snap.a4Synthesis?.decisionRationale ? "Pas de rationnel décision." : undefined,
    },
  ];
}

export function isA4GateReady(snap: Atelier4Snapshot): boolean {
  return computeA4Gate(snap).every((c) => c.met);
}

// Helpers ré-exposés pour l'UI
export { deriveMaturity };
