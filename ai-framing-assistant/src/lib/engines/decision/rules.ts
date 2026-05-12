// Decision engine — rules-driven, not just a total threshold.
//
// SPEC.MD §183-191 and DECISION_ENGINE.md describe five terminal states:
//   GO_IA | POC_IA | AUTOMATION | STUDY | NO_GO
//
// The naive total-based mapping (decisionFromTotal) is the *fallback* — the
// real engine applies hard rules first (e.g. critical RGPD risk + sensitive
// data caps the decision at NO_GO, regardless of total) and then falls back
// to the total reading.

import type { ScoringResult, ScoringAxisId } from "@/lib/engines/scoring";
import type { ProjectSnapshot, Signal } from "@/lib/engines/types";
import {
  DECISION_LABELS,
  type AIApproach,
  type Decision,
} from "@/types";

export type DecisionRationaleItem = {
  // Anchor used by the UI to render an icon / colour.
  kind: "STRENGTH" | "WEAKNESS" | "BLOCKER" | "RULE";
  label: string;
  detail: string;
};

export type DecisionResult = {
  decision: Decision;
  // The decision the raw total would have produced — useful to surface when
  // a hard rule overrides the score.
  decisionFromTotal: Decision;
  overridden: boolean;
  // Short headline used in cards and exports.
  headline: string;
  // Structured justification list (replaces a single text blob).
  rationale: DecisionRationaleItem[];
  // The technology approach we recommend pairing with this decision.
  recommendedApproach: AIApproach | null;
  // Blockers prevent moving forward without resolution.
  blockers: Signal[];
};

export function decideFromScoring(
  snapshot: ProjectSnapshot,
  scoring: ScoringResult,
): DecisionResult {
  const rationale: DecisionRationaleItem[] = [];
  const blockers: Signal[] = [];
  let decision: Decision = scoring.recommendation;
  let overridden = false;

  // 1. Hard rules — these can only DOWNGRADE the decision.
  const ruled = applyHardRules(snapshot, scoring, rationale, blockers);
  if (ruled && decisionRank(ruled) < decisionRank(decision)) {
    decision = ruled;
    overridden = true;
  }

  // 2. Strengths & weaknesses derived from the axes.
  collectAxisRationale(scoring, rationale);

  // 3. Recommendation framing (GO_IA → reuse AI approach selected; AUTOMATION
  // → no AI; STUDY → "à approfondir").
  const headline = framingHeadline(decision, scoring);
  const recommendedApproach = chooseApproach(decision, snapshot);

  return {
    decision,
    decisionFromTotal: scoring.recommendation,
    overridden,
    headline,
    rationale,
    recommendedApproach,
    blockers,
  };
}

// -------------------------------------------------------------
// Hard rules
// -------------------------------------------------------------

function applyHardRules(
  snap: ProjectSnapshot,
  scoring: ScoringResult,
  rationale: DecisionRationaleItem[],
  blockers: Signal[],
): Decision | null {
  let cap: Decision | null = null;

  const risk = snap.riskAssessment;
  const data = snap.dataAssessment;

  // Rule R1 — Données sensibles + risque RGPD critique sans plan → NO_GO.
  if (
    data?.sensitivity === "SENSITIVE" &&
    risk?.rgpdRisk != null &&
    risk.rgpdRisk >= 4 &&
    (!risk.mitigationPlan || risk.mitigationPlan.length < 30)
  ) {
    cap = downgrade(cap, "NO_GO");
    const sig: Signal = {
      id: "rule.r1-rgpd-block",
      category: "RISK",
      severity: "CRITICAL",
      title: "Bloquant RGPD",
      detail:
        "Données sensibles + risque RGPD critique sans plan de mitigation : NO GO tant que la conformité n'est pas instruite.",
    };
    blockers.push(sig);
    rationale.push({
      kind: "BLOCKER",
      label: "R1 — Conformité RGPD",
      detail: sig.detail,
    });
  }

  // Rule R2 — overallRisk CRITICAL → max POC_IA.
  if (risk?.overallRisk === "CRITICAL") {
    cap = downgrade(cap, "POC_IA");
    rationale.push({
      kind: "RULE",
      label: "R2 — Niveau de risque global critique",
      detail:
        "Le projet ne peut pas dépasser un POC : sécuriser la gouvernance avant tout déploiement.",
    });
  }

  // Rule R3 — Aucune donnée disponible → STUDY (impossible to POC sans data).
  if (data && data.dataSources.length === 0) {
    cap = downgrade(cap, "STUDY");
    rationale.push({
      kind: "RULE",
      label: "R3 — Sources de données absentes",
      detail:
        "Aucune source de données identifiée : passer en étude complémentaire pour cartographier les données disponibles.",
    });
  }

  // Rule R4 — IA non pertinente détectée → AUTOMATION (downgrade from POC).
  const ai = snap.aiAnalysis;
  if (
    ai &&
    (ai.classicRelevant || ai.automationRelevant || ai.ruleEngineRelevant) &&
    !ai.mlRelevant &&
    !ai.llmRelevant &&
    !ai.ragRelevant &&
    !ai.agentRelevant
  ) {
    cap = downgrade(cap, "AUTOMATION");
    rationale.push({
      kind: "RULE",
      label: "R4 — Pas un projet IA",
      detail:
        "Seules des approches non-IA (règle, automatisation, classique) ont été retenues : recommander une automatisation simple plutôt qu'un projet IA.",
    });
  }

  // Rule R5 — Need clarity = 1 ET data maturity = 1 → STUDY (cap, can't POC).
  const need = scoring.axes.find((a) => a.id === "needClarity")?.value ?? 0;
  const dataM = scoring.axes.find((a) => a.id === "dataMaturity")?.value ?? 0;
  if (need === 1 && dataM === 1) {
    cap = downgrade(cap, "STUDY");
    rationale.push({
      kind: "RULE",
      label: "R5 — Besoin et data immatures",
      detail: "Clarté du besoin et maturité data au plus bas : prioriser le cadrage.",
    });
  }

  // Rule R6 — Données sensibles → cap au POC, jamais GO_IA direct.
  //
  // Même avec un plan de mitigation documenté, un projet manipulant des
  // données sensibles (santé, judiciaire, biométrie) doit prouver sa
  // fiabilité par un POC cadré avant un GO_IA en production. C'est la
  // prudence métier portée par les ateliers de cadrage.
  if (data?.sensitivity === "SENSITIVE") {
    cap = downgrade(cap, "POC_IA");
    rationale.push({
      kind: "RULE",
      label: "R6 — Données sensibles : POC obligatoire",
      detail:
        "Les données manipulées sont qualifiées de sensibles. Un POC avec supervision humaine et métriques de fiabilité est requis avant tout GO en production.",
    });
  }

  return cap;
}

// Rank from worst to best — used to compute "the minimum downgrade".
const DECISION_RANK: Record<Decision, number> = {
  NO_GO: 0,
  STUDY: 1,
  AUTOMATION: 2,
  POC_IA: 3,
  GO_IA: 4,
};
function decisionRank(d: Decision): number {
  return DECISION_RANK[d];
}
function downgrade(current: Decision | null, candidate: Decision): Decision {
  if (current == null) return candidate;
  return decisionRank(candidate) < decisionRank(current) ? candidate : current;
}

// -------------------------------------------------------------
// Axis rationale collection
// -------------------------------------------------------------

const AXIS_THRESHOLDS: Record<ScoringAxisId, { strong: 3; weak: 1 }> = {
  needClarity: { strong: 3, weak: 1 },
  aiRelevance: { strong: 3, weak: 1 },
  dataMaturity: { strong: 3, weak: 1 },
  businessValue: { strong: 3, weak: 1 },
  riskControl: { strong: 3, weak: 1 },
  feasibility: { strong: 3, weak: 1 },
};

function collectAxisRationale(
  scoring: ScoringResult,
  out: DecisionRationaleItem[],
) {
  for (const axis of scoring.axes) {
    const t = AXIS_THRESHOLDS[axis.id];
    if (axis.value === t.strong) {
      out.push({
        kind: "STRENGTH",
        label: axisLabel(axis.id) + " : maîtrisé",
        detail: axis.rationale,
      });
    } else if (axis.value === t.weak) {
      out.push({
        kind: "WEAKNESS",
        label: axisLabel(axis.id) + " : faiblesse",
        detail: axis.rationale,
      });
    }
  }
}

function axisLabel(id: ScoringAxisId): string {
  switch (id) {
    case "needClarity":
      return "Clarté du besoin";
    case "aiRelevance":
      return "Pertinence IA";
    case "dataMaturity":
      return "Maturité data";
    case "businessValue":
      return "Valeur métier";
    case "riskControl":
      return "Maîtrise des risques";
    case "feasibility":
      return "Faisabilité technique";
  }
}

// -------------------------------------------------------------
// Framing
// -------------------------------------------------------------

function framingHeadline(decision: Decision, scoring: ScoringResult): string {
  const score = `${scoring.total}/18`;
  const label = DECISION_LABELS[decision];
  switch (decision) {
    case "GO_IA":
      return `${label} — score ${score}, projet prêt à être engagé.`;
    case "POC_IA":
      return `${label} — score ${score}, valider la faisabilité par un POC cadré.`;
    case "AUTOMATION":
      return `${label} — score ${score}, l'IA n'apporte pas de valeur additionnelle ici.`;
    case "STUDY":
      return `${label} — score ${score}, approfondir besoin/data avant de décider.`;
    case "NO_GO":
      return `${label} — score ${score}, conditions non réunies (risque ou conformité).`;
  }
}

function chooseApproach(
  decision: Decision,
  snap: ProjectSnapshot,
): AIApproach | null {
  if (decision === "NO_GO" || decision === "STUDY") return null;
  if (decision === "AUTOMATION") {
    if (snap.aiAnalysis?.ruleEngineRelevant) return "RULE";
    return "AUTOMATION";
  }
  // GO_IA / POC_IA → use explicit recommendation or fall back to best fit.
  if (snap.aiAnalysis?.recommendedApproach) return snap.aiAnalysis.recommendedApproach;
  const ai = snap.aiAnalysis;
  if (!ai) return null;
  if (ai.ragRelevant) return "RAG";
  if (ai.llmRelevant) return "LLM";
  if (ai.mlRelevant) return "ML";
  if (ai.agentRelevant) return "AGENT";
  if (ai.hybridRelevant) return "HYBRID";
  return null;
}
