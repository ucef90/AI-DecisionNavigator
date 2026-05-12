// Scoring engine — six axes graded 1..3.
//
// Reference: SPEC.MD §165-181 and SCORING_ENGINE.md.
//   Axe 1 — Clarté du besoin
//   Axe 2 — Pertinence IA
//   Axe 3 — Maturité data
//   Axe 4 — Valeur métier
//   Axe 5 — Risques maîtrisables  (named "riskControl" — higher is better)
//   Axe 6 — Faisabilité technique et organisationnelle
//
// The engine derives each axis from the snapshot and from the MaturityReport
// produced upstream. It returns scores, a rationale per axis (the "why"),
// the total, the recommendation, and an aggregate confidence.

import { analyseMaturity, type MaturityReport } from "@/lib/engines/maturity";
import type { ProjectSnapshot, Confidence, Signal } from "@/lib/engines/types";
import { decisionFromTotal, type Decision } from "@/types";

export const SCORING_AXES = [
  "needClarity",
  "aiRelevance",
  "dataMaturity",
  "businessValue",
  "riskControl",
  "feasibility",
] as const;

export type ScoringAxisId = (typeof SCORING_AXES)[number];

export const SCORING_AXIS_LABELS: Record<ScoringAxisId, string> = {
  needClarity: "Clarté du besoin",
  aiRelevance: "Pertinence IA",
  dataMaturity: "Maturité data",
  businessValue: "Valeur métier",
  riskControl: "Risques maîtrisables",
  feasibility: "Faisabilité technique",
};

export type AxisScore = {
  id: ScoringAxisId;
  value: 1 | 2 | 3;
  rationale: string;
  confidence: Confidence;
};

export type ScoringResult = {
  axes: AxisScore[];
  total: number; // 6..18
  recommendation: Decision;
  reading: string; // Short human-readable reading of the total, see SPEC §177
  confidence: Confidence;
  signals: Signal[]; // re-exposed maturity signals (used by the decision engine)
  maturity: MaturityReport;
};

// Reading per SPEC §177
export function readingFromTotal(total: number): string {
  if (total >= 15) return "GO IA ou POC rapide envisageable.";
  if (total >= 10) return "POC / étude complémentaire / cadrage data nécessaire.";
  if (total >= 6) return "Projet IA peu mature — renforcer le cadrage.";
  return "NO GO IA / automatisation simple / solution alternative à privilégier.";
}

export function computeScoring(snapshot: ProjectSnapshot): ScoringResult {
  const maturity = analyseMaturity(snapshot);

  const axes: AxisScore[] = [
    scoreNeedClarity(snapshot, maturity),
    scoreAIRelevance(snapshot, maturity),
    scoreDataMaturity(snapshot, maturity),
    scoreBusinessValue(snapshot),
    scoreRiskControl(snapshot),
    scoreFeasibility(snapshot),
  ];

  const total = axes.reduce((sum, a) => sum + a.value, 0);
  const recommendation = decisionFromTotal(total);
  const reading = readingFromTotal(total);
  const confidence = aggregateConfidence(axes);

  return {
    axes,
    total,
    recommendation,
    reading,
    confidence,
    signals: maturity.signals,
    maturity,
  };
}

// -------------------------------------------------------------
// Axis derivations
// -------------------------------------------------------------

function scoreNeedClarity(
  snap: ProjectSnapshot,
  maturity: MaturityReport,
): AxisScore {
  const s = maturity.scores.business;
  const need = snap.businessNeed;
  if (!need) {
    return {
      id: "needClarity",
      value: 1,
      rationale: "Le besoin métier n'a pas encore été renseigné.",
      confidence: "HIGH",
    };
  }
  const value = bucket(s);
  const rationale = describeBusiness(snap, value);
  const confidence: Confidence = need.reformulatedNeed ? "HIGH" : "MEDIUM";
  return { id: "needClarity", value, rationale, confidence };
}

function scoreAIRelevance(
  snap: ProjectSnapshot,
  maturity: MaturityReport,
): AxisScore {
  const ai = snap.aiAnalysis;
  if (!ai) {
    return {
      id: "aiRelevance",
      value: 1,
      rationale: "L'analyse IA / automatisation n'a pas été réalisée.",
      confidence: "HIGH",
    };
  }
  const value = bucket(maturity.scores.aiFit);
  const rationale = describeAI(ai, value);
  const confidence: Confidence = ai.recommendedApproach ? "HIGH" : "MEDIUM";
  return { id: "aiRelevance", value, rationale, confidence };
}

function scoreDataMaturity(
  snap: ProjectSnapshot,
  maturity: MaturityReport,
): AxisScore {
  const da = snap.dataAssessment;
  if (!da) {
    return {
      id: "dataMaturity",
      value: 1,
      rationale: "Aucune analyse data n'a été produite.",
      confidence: "HIGH",
    };
  }
  const value = bucket(maturity.scores.data);
  const rationale = describeData(snap, value);
  const confidence: Confidence = da.dataSources.length > 0 ? "MEDIUM" : "LOW";
  return { id: "dataMaturity", value, rationale, confidence };
}

function scoreBusinessValue(snap: ProjectSnapshot): AxisScore {
  const need = snap.businessNeed;
  if (!need || !need.expectedValue) {
    return {
      id: "businessValue",
      value: 1,
      rationale: "Aucune valeur métier n'a été décrite.",
      confidence: "MEDIUM",
    };
  }
  // Heuristic: value attendue + KPIs documentés + impact utilisateurs
  let pts = 0;
  if (need.expectedValue.length >= 80) pts += 1;
  else if (need.expectedValue.length > 20) pts += 0.5;
  if (need.currentKpis.length >= 1) pts += 1;
  if (need.usersImpacted && need.usersImpacted.length > 0) pts += 0.5;
  if (need.expectedOutcome && need.expectedOutcome.length > 20) pts += 0.5;

  const value: 1 | 2 | 3 = pts >= 2.5 ? 3 : pts >= 1.5 ? 2 : 1;
  return {
    id: "businessValue",
    value,
    rationale:
      value === 3
        ? "Valeur métier explicite : objectifs, KPIs et impact utilisateurs documentés."
        : value === 2
          ? "Valeur métier partielle : à compléter (KPI mesurables, impact chiffré)."
          : "Valeur métier faiblement documentée — clarifier le gain attendu.",
    confidence: need.currentKpis.length > 0 ? "HIGH" : "MEDIUM",
  };
}

function scoreRiskControl(snap: ProjectSnapshot): AxisScore {
  const r = snap.riskAssessment;
  if (!r) {
    return {
      id: "riskControl",
      value: 1,
      rationale: "L'analyse de risques n'a pas été réalisée.",
      confidence: "HIGH",
    };
  }

  // For risk axes, HIGHER raw score = MORE risk = LOWER control.
  // We average the rated axes (skip nulls), then invert.
  const rated: number[] = [
    r.rgpdRisk,
    r.sensitiveDataRisk,
    r.hallucinationRisk,
    r.biasRisk,
    r.classificationRisk,
    r.autoDecisionRisk,
    r.securityRisk,
    r.vendorLockRisk,
    r.adoptionRisk,
    r.supervisionRisk,
  ].filter((v): v is number => v != null);

  if (rated.length === 0) {
    return {
      id: "riskControl",
      value: 1,
      rationale: "Risques non évalués individuellement.",
      confidence: "LOW",
    };
  }

  const avg = rated.reduce((a, b) => a + b, 0) / rated.length;
  // avg ∈ [1..5]. Map: avg<=1.8 → 3, avg<=3 → 2, else 1.
  const value: 1 | 2 | 3 = avg <= 1.8 ? 3 : avg <= 3 ? 2 : 1;

  // If overallRisk is CRITICAL, cap at 1 regardless of average.
  const cappedValue: 1 | 2 | 3 =
    r.overallRisk === "CRITICAL" ? 1 : value;

  // A documented mitigation plan should lift a 2 to a 3, never below 1.
  const hasPlan = !!r.mitigationPlan && r.mitigationPlan.length >= 30;
  const finalValue: 1 | 2 | 3 =
    cappedValue === 2 && hasPlan ? 3 : cappedValue;

  return {
    id: "riskControl",
    value: finalValue,
    rationale:
      finalValue === 3
        ? hasPlan
          ? "Risques modérés et plan de mitigation documenté."
          : "Risques faibles sur l'ensemble des axes évalués."
        : finalValue === 2
          ? "Risques moyens : renforcer le plan de mitigation et la supervision."
          : "Risques élevés ou critiques — gouvernance et conformité à sécuriser.",
    confidence: rated.length >= 5 ? "HIGH" : "MEDIUM",
  };
}

function scoreFeasibility(snap: ProjectSnapshot): AxisScore {
  const arch = snap.architecture;
  if (!arch) {
    return {
      id: "feasibility",
      value: 1,
      rationale: "L'analyse architecture / workflow n'a pas été réalisée.",
      confidence: "MEDIUM",
    };
  }

  let pts = 0;
  if (arch.applications.length >= 1) pts += 0.5;
  if (arch.apis.length >= 1) pts += 0.5;
  if (arch.workflowCurrent && arch.workflowCurrent.length >= 20) pts += 0.5;
  if (arch.workflowTarget && arch.workflowTarget.length >= 20) pts += 0.5;
  if (arch.siIntegration && arch.siIntegration.length > 0) pts += 0.5;
  if (arch.humanValidation) pts += 0.5;
  if (arch.traceability && arch.traceability.length > 0) pts += 0.5;

  const value: 1 | 2 | 3 = pts >= 2.5 ? 3 : pts >= 1.5 ? 2 : 1;
  return {
    id: "feasibility",
    value,
    rationale:
      value === 3
        ? "Architecture cible documentée, APIs identifiées, supervision et traçabilité prévues."
        : value === 2
          ? "Faisabilité partielle : préciser le workflow cible et les points d'intégration SI."
          : "Faisabilité technique peu instruite — cartographier les applications, APIs et points d'intégration.",
    confidence: arch.workflowTarget ? "HIGH" : "MEDIUM",
  };
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------

function bucket(ratio: number): 1 | 2 | 3 {
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

function aggregateConfidence(axes: AxisScore[]): Confidence {
  const map: Record<Confidence, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
  const avg = axes.reduce((s, a) => s + map[a.confidence], 0) / axes.length;
  if (avg >= 1.5) return "HIGH";
  if (avg >= 0.7) return "MEDIUM";
  return "LOW";
}

function describeBusiness(snap: ProjectSnapshot, value: 1 | 2 | 3): string {
  const need = snap.businessNeed!;
  switch (value) {
    case 3:
      return "Besoin reformulé, irritants identifiés, KPIs et utilisateurs documentés.";
    case 2:
      return need.reformulatedNeed
        ? "Besoin partiellement structuré : compléter irritants, KPIs ou utilisateurs."
        : "Reformulation absente — le besoin n'est pas suffisamment éclairé.";
    case 1:
      return "Besoin métier flou : reformulation, irritants et KPIs à clarifier.";
  }
}

function describeAI(ai: NonNullable<ProjectSnapshot["aiAnalysis"]>, value: 1 | 2 | 3): string {
  switch (value) {
    case 3:
      return `Approche IA pertinente (${ai.recommendedApproach ?? "à confirmer"}), justification documentée.`;
    case 2:
      return "Pertinence IA partielle : challenger l'apport vs. une automatisation simple.";
    case 1:
      return "L'IA n'est pas justifiée à ce stade — privilégier règles/automatisation ou approfondir la qualification.";
  }
}

function describeData(snap: ProjectSnapshot, value: 1 | 2 | 3): string {
  const da = snap.dataAssessment!;
  switch (value) {
    case 3:
      return `Sources identifiées (${da.dataSources.length}), qualité et disponibilité documentées.`;
    case 2:
      return "Maturité data partielle : préciser qualité, accessibilité ou historique.";
    case 1:
      return "Maturité data insuffisante : sources, qualité ou historique manquants.";
  }
}
