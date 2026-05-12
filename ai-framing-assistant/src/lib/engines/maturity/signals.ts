// Maturity engine — detects weak / medium / strong signals from a
// project snapshot.
//
// Mirrors BUSINESS_LOGIC.md §340-380: a project's maturity is not a free-text
// field but a derived view across all wizard answers. This engine scans the
// snapshot for known patterns and emits Signal records the cartography and
// the decision engine consume.

import type { ProjectSnapshot, Signal } from "@/lib/engines/types";
import type { Maturity } from "@/types";

// Phrasings that mark a request as "solution-oriented" rather than
// "problem-oriented" — see BUSINESS_LOGIC.md §487-500.
const SOLUTION_ORIENTED_PATTERNS: RegExp[] = [
  /\b(nous|on)\s+(voulons|veut|souhaitons|souhaite)\s+(de\s+l[' ]?)?(ia|intelligence artificielle)\b/i,
  /\bnous voulons un (chatbot|agent ia|llm|assistant)\b/i,
  /\b(automatiser|déployer|mettre en place)\s+(un|une|de l[' ]?)\s*(ia|llm|chatbot|agent)\b/i,
  /\bfaire\s+(de\s+l[' ]?)?(ia|ml|machine learning)\b/i,
];

const QUALITY_NEGATIVE = /\b(faible|insuffisant|mauvaise|fragmenté|incoherent|inconnu)\b/i;
const QUALITY_POSITIVE = /\b(bonne|forte|excellente|élevée|maîtrisée|fiable)\b/i;

export type MaturityReport = {
  level: Maturity; // Derived maturity (LOW / MEDIUM / HIGH)
  signals: Signal[];
  // Sub-scores used by the scoring engine. Each is in [0, 1].
  scores: {
    business: number;
    data: number;
    aiFit: number;
    governance: number;
  };
};

export function analyseMaturity(snapshot: ProjectSnapshot): MaturityReport {
  const signals: Signal[] = [];

  const business = scoreBusiness(snapshot, signals);
  const data = scoreData(snapshot, signals);
  const aiFit = scoreAIFit(snapshot, signals);
  const governance = scoreGovernance(snapshot, signals);

  const aggregate = (business + data + aiFit + governance) / 4;
  const level: Maturity =
    aggregate >= 0.7 ? "HIGH" : aggregate >= 0.4 ? "MEDIUM" : "LOW";

  return {
    level,
    signals,
    scores: { business, data, aiFit, governance },
  };
}

// -------------------------------------------------------------
// Business need maturity
// -------------------------------------------------------------
function scoreBusiness(snap: ProjectSnapshot, out: Signal[]): number {
  const need = snap.businessNeed;
  if (!need) {
    out.push({
      id: "biz.missing",
      category: "MATURITY",
      severity: "WARNING",
      title: "Besoin métier non renseigné",
      detail: "L'étape de reformulation et d'analyse du problème n'a pas encore été remplie.",
      sourceField: "businessNeed",
    });
    return 0;
  }

  let score = 0;
  let max = 0;

  const sources = [
    need.reformulatedNeed,
    need.expectedValue,
    need.usersImpacted,
    need.expectedOutcome,
  ];
  for (const s of sources) {
    max += 1;
    if (s && s.length >= 20) score += 1;
    else if (s && s.length > 0) score += 0.5;
  }

  max += 1;
  if (need.painPoints.length >= 3) score += 1;
  else if (need.painPoints.length > 0) score += 0.5;

  max += 1;
  if (need.currentKpis.length > 0) score += 1;
  else {
    out.push({
      id: "biz.no-kpi",
      category: "MATURITY",
      severity: "WARNING",
      title: "Aucun KPI actuel renseigné",
      detail: "Sans KPI, la valeur du projet ne pourra pas être mesurée objectivement.",
      sourceField: "businessNeed.currentKpis",
    });
  }

  // Solution-oriented phrasing detection: the request is already a solution,
  // not a problem. Triggers reformulation per BUSINESS_LOGIC.md §487-500.
  const initial = need.initialRequest || need.reformulatedNeed || "";
  if (initial && SOLUTION_ORIENTED_PATTERNS.some((re) => re.test(initial))) {
    out.push({
      id: "biz.solution-oriented",
      category: "BUSINESS",
      severity: "WARNING",
      title: "Formulation orientée solution",
      detail:
        'La demande désigne directement une technologie ("IA", "chatbot", "agent"). Reformuler en termes de problème métier et de valeur attendue.',
      sourceField: "businessNeed.initialRequest",
    });
  }

  // Confusion AI / automation: if the user listed both ML and "règles
  // simples connues" it usually means the need is misclassified.
  if (snap.aiAnalysis?.mlRelevant && snap.aiAnalysis?.ruleEngineRelevant) {
    out.push({
      id: "biz.confusion-ai-auto",
      category: "AI_FIT",
      severity: "INFO",
      title: "Confusion IA / automatisation possible",
      detail:
        "ML et moteur de règles ont été cochés tous les deux : challenger la nécessité réelle du ML.",
      sourceField: "aiAnalysis",
    });
  }

  return max === 0 ? 0 : score / max;
}

// -------------------------------------------------------------
// Data maturity
// -------------------------------------------------------------
function scoreData(snap: ProjectSnapshot, out: Signal[]): number {
  const da = snap.dataAssessment;
  if (!da) {
    out.push({
      id: "data.missing",
      category: "DATA",
      severity: "WARNING",
      title: "Analyse data non réalisée",
      detail: "Sans cartographie des données, la faisabilité ne peut pas être qualifiée.",
      sourceField: "dataAssessment",
    });
    return 0;
  }

  let score = 0;
  let max = 0;

  max += 1;
  if (da.dataSources.length >= 3) score += 1;
  else if (da.dataSources.length > 0) score += 0.5;
  else
    out.push({
      id: "data.no-sources",
      category: "DATA",
      severity: "CRITICAL",
      title: "Aucune source de données identifiée",
      detail: "Identifier les sources est un prérequis à toute approche IA.",
      sourceField: "dataAssessment.dataSources",
    });

  max += 1;
  if (matchPositive(da.quality)) score += 1;
  else if (da.quality && !matchNegative(da.quality)) score += 0.5;
  else if (matchNegative(da.quality))
    out.push({
      id: "data.poor-quality",
      category: "DATA",
      severity: "WARNING",
      title: "Qualité data décrite comme faible",
      detail: "La qualité des données limite directement la fiabilité du modèle.",
      sourceField: "dataAssessment.quality",
    });

  max += 1;
  if (da.availability && da.availability.trim().length > 0) score += 1;

  max += 1;
  if (da.history && da.history.trim().length > 0) score += 1;

  // Personal data without RGPD clarification is a critical maturity gap.
  if (da.personalData && (!da.rgpdConstraints || da.rgpdConstraints.length < 10)) {
    out.push({
      id: "data.rgpd-gap",
      category: "GOVERNANCE",
      severity: "CRITICAL",
      title: "Données personnelles sans cadre RGPD documenté",
      detail:
        "Le projet manipule des données personnelles mais aucune contrainte RGPD n'est documentée. Validation DPO obligatoire avant POC.",
      sourceField: "dataAssessment.rgpdConstraints",
    });
  }

  if (da.sensitivity === "SENSITIVE") {
    out.push({
      id: "data.sensitive",
      category: "RISK",
      severity: "CRITICAL",
      title: "Données sensibles manipulées",
      detail:
        "Les données sont qualifiées de sensibles : prévoir chiffrement, supervision humaine et traçabilité renforcée.",
      sourceField: "dataAssessment.sensitivity",
    });
  }

  return max === 0 ? 0 : score / max;
}

// -------------------------------------------------------------
// AI fit / pertinence
// -------------------------------------------------------------
function scoreAIFit(snap: ProjectSnapshot, out: Signal[]): number {
  const ai = snap.aiAnalysis;
  if (!ai) return 0;

  // If NO approach is selected, the AI fit is undecided.
  const selected = countTrue([
    ai.automationRelevant,
    ai.ruleEngineRelevant,
    ai.mlRelevant,
    ai.llmRelevant,
    ai.ragRelevant,
    ai.agentRelevant,
    ai.hybridRelevant,
    ai.classicRelevant,
  ]);

  if (selected === 0) {
    out.push({
      id: "ai.no-approach",
      category: "AI_FIT",
      severity: "WARNING",
      title: "Aucune approche technologique sélectionnée",
      detail: "Qualifier au moins une approche envisageable (automatisation, ML, LLM, RAG, agent...).",
      sourceField: "aiAnalysis",
    });
    return 0;
  }

  // If only "classic" or "automation" are selected, AI is not the right answer.
  if (
    selected === 1 &&
    (ai.classicRelevant || ai.automationRelevant) &&
    !ai.mlRelevant &&
    !ai.llmRelevant &&
    !ai.ragRelevant &&
    !ai.agentRelevant
  ) {
    out.push({
      id: "ai.not-ai",
      category: "AI_FIT",
      severity: "INFO",
      title: "Le besoin ne semble pas nécessiter d'IA",
      detail:
        "Seule une approche classique ou d'automatisation a été retenue. Privilégier un workflow / moteur de règles.",
      sourceField: "aiAnalysis.recommendedApproach",
    });
    return 0.4; // Not "wrong" — the project is just not an IA project.
  }

  let score = 0.4 + Math.min(0.4, selected * 0.1);
  if (ai.recommendedApproach) score += 0.1;
  if (ai.justification && ai.justification.trim().length > 30) score += 0.1;
  return Math.min(1, score);
}

// -------------------------------------------------------------
// Governance maturity
// -------------------------------------------------------------
function scoreGovernance(snap: ProjectSnapshot, out: Signal[]): number {
  const arch = snap.architecture;
  const risk = snap.riskAssessment;
  let score = 0;
  let max = 0;

  if (arch) {
    max += 2;
    if (arch.humanValidation) score += 1;
    else
      out.push({
        id: "gov.no-human-validation",
        category: "GOVERNANCE",
        severity: "WARNING",
        title: "Pas de validation humaine prévue",
        detail:
          "L'absence de supervision humaine est un risque majeur pour les décisions automatisées.",
        sourceField: "architecture.humanValidation",
      });
    if (arch.traceability && arch.traceability.trim().length > 0) score += 1;
    else
      out.push({
        id: "gov.no-traceability",
        category: "GOVERNANCE",
        severity: "WARNING",
        title: "Aucune traçabilité documentée",
        detail: "Définir comment chaque décision IA sera auditable.",
        sourceField: "architecture.traceability",
      });
  } else {
    out.push({
      id: "gov.no-arch",
      category: "GOVERNANCE",
      severity: "INFO",
      title: "Volet architecture non rempli",
      detail: "L'analyse SI / workflow conditionne la faisabilité opérationnelle.",
      sourceField: "architecture",
    });
  }

  if (risk) {
    max += 1;
    if (risk.mitigationPlan && risk.mitigationPlan.trim().length > 30) score += 1;
  }

  return max === 0 ? 0 : score / max;
}

// -------------------------------------------------------------
// helpers
// -------------------------------------------------------------
function countTrue(values: boolean[]): number {
  return values.reduce((acc, v) => acc + (v ? 1 : 0), 0);
}

function matchPositive(value: string | null): boolean {
  return !!value && QUALITY_POSITIVE.test(value);
}

function matchNegative(value: string | null): boolean {
  return !!value && QUALITY_NEGATIVE.test(value);
}
