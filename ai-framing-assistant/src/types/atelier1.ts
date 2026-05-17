// Atelier 1 — enums & labels.
//
// Strings stored as TEXT in Prisma (SQLite doesn't support native enums).
// These constants are the source of truth for allowed values.

export const ACTOR_CATEGORIES = [
  "USER",
  "AGENT",
  "MANAGER",
  "SPONSOR",
  "IT",
  "DATA",
  "GOVERNANCE",
  "EXTERNAL",
] as const;
export type ActorCategory = (typeof ACTOR_CATEGORIES)[number];

export const ACTOR_CATEGORY_LABELS: Record<ActorCategory, string> = {
  USER: "Usager / utilisateur final",
  AGENT: "Agent / opérationnel",
  MANAGER: "Manager / responsable",
  SPONSOR: "Sponsor",
  IT: "DSI / IT",
  DATA: "Data",
  GOVERNANCE: "DPO / Gouvernance",
  EXTERNAL: "Partenaire / externe",
};

export const ACTOR_INVOLVEMENTS = ["PRIMARY", "SECONDARY", "CONSULTED", "INFORMED"] as const;
export type ActorInvolvement = (typeof ACTOR_INVOLVEMENTS)[number];

export const ACTOR_INVOLVEMENT_LABELS: Record<ActorInvolvement, string> = {
  PRIMARY: "Principal",
  SECONDARY: "Secondaire",
  CONSULTED: "Consulté",
  INFORMED: "Informé",
};

export const PROCESS_STEP_MODES = ["MANUAL", "SEMI_AUTOMATED", "AUTOMATED"] as const;
export type ProcessStepMode = (typeof PROCESS_STEP_MODES)[number];

export const PROCESS_STEP_MODE_LABELS: Record<ProcessStepMode, string> = {
  MANUAL: "Manuel",
  SEMI_AUTOMATED: "Semi-auto",
  AUTOMATED: "Automatisé",
};

export const PROCESS_STEP_TYPES = [
  "INPUT",
  "TREATMENT",
  "VALIDATION",
  "DECISION",
  "OUTPUT",
  "TRANSFER",
] as const;
export type ProcessStepType = (typeof PROCESS_STEP_TYPES)[number];

export const PROCESS_STEP_TYPE_LABELS: Record<ProcessStepType, string> = {
  INPUT: "Entrée",
  TREATMENT: "Traitement",
  VALIDATION: "Validation",
  DECISION: "Décision",
  OUTPUT: "Sortie",
  TRANSFER: "Transfert",
};

export const IRRITANT_CATEGORIES = [
  "MANUAL_READ",
  "MANUAL_INPUT",
  "DOUBLE_ENTRY",
  "DOC_SEARCH",
  "CLASSIFICATION_ERROR",
  "TOOL_GAP",
  "LACK_OF_VISIBILITY",
  "LACK_OF_PRIORITY",
  "WORKFLOW_BREAK",
  "DELAY",
  "OTHER",
] as const;
export type IrritantCategory = (typeof IRRITANT_CATEGORIES)[number];

export const IRRITANT_CATEGORY_LABELS: Record<IrritantCategory, string> = {
  MANUAL_READ: "Lecture manuelle",
  MANUAL_INPUT: "Saisie manuelle",
  DOUBLE_ENTRY: "Double saisie",
  DOC_SEARCH: "Recherche documentaire",
  CLASSIFICATION_ERROR: "Erreur de classification",
  TOOL_GAP: "Outil manquant ou cassé",
  LACK_OF_VISIBILITY: "Manque de visibilité",
  LACK_OF_PRIORITY: "Manque de priorisation",
  WORKFLOW_BREAK: "Rupture de workflow",
  DELAY: "Délais excessifs",
  OTHER: "Autre",
};

export const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "BLOCKING"] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Modéré",
  HIGH: "Élevé",
  BLOCKING: "Bloquant",
};

export const IMPACT_AXES = [
  "AGENT",
  "USER",
  "ORGANIZATION",
  "FINANCIAL",
  "REGULATORY",
  "QUALITY",
  "DELAY",
  "COST",
  "SATISFACTION",
] as const;
export type ImpactAxis = (typeof IMPACT_AXES)[number];

export const IMPACT_AXIS_LABELS: Record<ImpactAxis, string> = {
  AGENT: "Agents",
  USER: "Usagers",
  ORGANIZATION: "Organisation",
  FINANCIAL: "Financier",
  REGULATORY: "Réglementaire",
  QUALITY: "Qualité",
  DELAY: "Délais",
  COST: "Coûts",
  SATISFACTION: "Satisfaction",
};

export const IMPACT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ImpactSeverity = (typeof IMPACT_SEVERITIES)[number];

export const IMPACT_SEVERITY_LABELS: Record<ImpactSeverity, string> = {
  LOW: "Faible",
  MEDIUM: "Modéré",
  HIGH: "Élevé",
  CRITICAL: "Critique",
};

export const IMPACT_DIRECTIONS = ["NEGATIVE", "POSITIVE"] as const;
export type ImpactDirection = (typeof IMPACT_DIRECTIONS)[number];

export const OBJECTIVE_CATEGORIES = [
  "TIME",
  "QUALITY",
  "COST",
  "EXPERIENCE",
  "COMPLIANCE",
  "AUTOMATION",
  "PILOTAGE",
  "OTHER",
] as const;
export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number];

export const OBJECTIVE_CATEGORY_LABELS: Record<ObjectiveCategory, string> = {
  TIME: "Gain de temps",
  QUALITY: "Qualité",
  COST: "Coût",
  EXPERIENCE: "Expérience utilisateur",
  COMPLIANCE: "Conformité",
  AUTOMATION: "Automatisation",
  PILOTAGE: "Pilotage",
  OTHER: "Autre",
};

export const KPI_MEASURE_STATUSES = ["NOT_MEASURED", "ESTIMATED", "MEASURED"] as const;
export type KpiMeasureStatus = (typeof KPI_MEASURE_STATUSES)[number];

export const KPI_MEASURE_STATUS_LABELS: Record<KpiMeasureStatus, string> = {
  NOT_MEASURED: "Non mesuré",
  ESTIMATED: "Estimé",
  MEASURED: "Mesuré",
};

export const ASSUMPTION_TYPES = [
  "BUSINESS",
  "DATA",
  "TECHNICAL",
  "ORGANIZATIONAL",
  "REGULATORY",
] as const;
export type AssumptionType = (typeof ASSUMPTION_TYPES)[number];

export const ASSUMPTION_TYPE_LABELS: Record<AssumptionType, string> = {
  BUSINESS: "Métier",
  DATA: "Données",
  TECHNICAL: "Technique",
  ORGANIZATIONAL: "Organisation",
  REGULATORY: "Réglementaire",
};

export const ASSUMPTION_STATUSES = [
  "UNVERIFIED",
  "IN_PROGRESS",
  "VALIDATED",
  "INVALIDATED",
] as const;
export type AssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];

export const ASSUMPTION_STATUS_LABELS: Record<AssumptionStatus, string> = {
  UNVERIFIED: "Non vérifiée",
  IN_PROGRESS: "En investigation",
  VALIDATED: "Validée",
  INVALIDATED: "Invalidée",
};

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Modéré",
  HIGH: "Élevé",
  CRITICAL: "Critique",
};

export const UNCERTAINTY_SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type UncertaintySeverity = (typeof UNCERTAINTY_SEVERITIES)[number];

export const UNCERTAINTY_STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"] as const;
export type UncertaintyStatus = (typeof UNCERTAINTY_STATUSES)[number];

export const UNCERTAINTY_STATUS_LABELS: Record<UncertaintyStatus, string> = {
  OPEN: "Ouverte",
  INVESTIGATING: "En cours",
  RESOLVED: "Résolue",
};

export const CONSTRAINT_TYPES = [
  "REGULATORY",
  "BUDGET",
  "TIMELINE",
  "SECURITY",
  "ORGANIZATIONAL",
  "TECHNICAL",
  "RESOURCES",
  "OTHER",
] as const;
export type ConstraintType = (typeof CONSTRAINT_TYPES)[number];

export const CONSTRAINT_TYPE_LABELS: Record<ConstraintType, string> = {
  REGULATORY: "Réglementaire",
  BUDGET: "Budget",
  TIMELINE: "Calendrier",
  SECURITY: "Sécurité",
  ORGANIZATIONAL: "Organisation",
  TECHNICAL: "SI / technique",
  RESOURCES: "Ressources",
  OTHER: "Autre",
};

export const OPPORTUNITY_CATEGORIES = [
  "EFFICIENCY",
  "QUALITY",
  "COST",
  "RISK_REDUCTION",
  "EXPERIENCE",
  "AUTOMATION",
  "DATA",
  "OTHER",
] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  EFFICIENCY: "Efficacité",
  QUALITY: "Qualité",
  COST: "Coût",
  RISK_REDUCTION: "Réduction de risque",
  EXPERIENCE: "Expérience utilisateur",
  AUTOMATION: "Automatisation",
  DATA: "Données",
  OTHER: "Autre",
};

export const EFFORT_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const VERBATIM_SOURCES = ["INTERVIEW", "SHADOWING", "SURVEY", "COMPLAINT", "OTHER"] as const;
export type VerbatimSource = (typeof VERBATIM_SOURCES)[number];

export const VERBATIM_SENTIMENTS = ["NEGATIVE", "NEUTRAL", "POSITIVE"] as const;
export type VerbatimSentiment = (typeof VERBATIM_SENTIMENTS)[number];

export const ATELIER_GATE_VERDICTS = ["NOT_READY", "READY", "OVERRIDE"] as const;
export type AtelierGateVerdict = (typeof ATELIER_GATE_VERDICTS)[number];

// -------------------------------------------------------------
// 5 phases UX (groupement des 18 sections livrable)
// -------------------------------------------------------------
export type AtelierPhaseId = "A" | "B" | "C" | "D" | "E";

export type AtelierSectionId =
  | "qualification"
  | "reformulation"
  | "actors"
  | "verbatims"
  | "process-as-is"
  | "business-map"
  | "irritants"
  | "impacts"
  | "objectives"
  | "kpis"
  | "value"
  | "scope"
  | "assumptions"
  | "uncertainties"
  | "constraints"
  | "opportunities"
  | "synthesis"
  | "workshop-report"
  | "gate";

export type AtelierPhase = {
  id: AtelierPhaseId;
  title: string;
  intent: string;
  sections: { id: AtelierSectionId; title: string; livrableSection: number }[];
};

// Ordre revu (correction méthodologique) :
// A. Contexte → B. Cartographie → C. Diagnostic → D. Cible & valeur → E. Risques cadrage.
// Chaque section a un numéro qui pointe vers la section du livrable
// d'origine (1..18) pour la traçabilité.
export const ATELIER_PHASES: AtelierPhase[] = [
  {
    id: "A",
    title: "Contexte & reformulation",
    intent: "Poser le décor : qui, pourquoi, et reformuler sans techno.",
    sections: [
      { id: "qualification", title: "Fiche de qualification", livrableSection: 1 },
      { id: "reformulation", title: "Reformulation du besoin", livrableSection: 2 },
    ],
  },
  {
    id: "B",
    title: "Cartographie métier",
    intent: "Acteurs, parole utilisateur, et workflow tel qu'il fonctionne aujourd'hui.",
    sections: [
      { id: "actors", title: "Acteurs & utilisateurs", livrableSection: 6 },
      { id: "verbatims", title: "Voix du terrain (verbatim)", livrableSection: 0 },
      { id: "process-as-is", title: "Workflow actuel (AS-IS)", livrableSection: 13 },
      { id: "business-map", title: "Cartographie métier", livrableSection: 3 },
    ],
  },
  {
    id: "C",
    title: "Diagnostic",
    intent: "Identifier irritants/frictions, impacts mesurés, et opportunités.",
    sections: [
      { id: "irritants", title: "Irritants & points de friction", livrableSection: 4 },
      { id: "impacts", title: "Impacts opérationnels", livrableSection: 5 },
      { id: "opportunities", title: "Opportunités d'amélioration", livrableSection: 16 },
    ],
  },
  {
    id: "D",
    title: "Cible, valeur & périmètre",
    intent: "Objectifs priorisés, KPI mesurés, valeur attendue, et ce qui n'est PAS dans le scope.",
    sections: [
      { id: "objectives", title: "Objectifs métier", livrableSection: 7 },
      { id: "kpis", title: "KPI baseline", livrableSection: 8 },
      { id: "value", title: "Valeur attendue", livrableSection: 12 },
      { id: "scope", title: "Périmètre & hors-scope", livrableSection: 0 },
    ],
  },
  {
    id: "E",
    title: "Risques de cadrage & gate",
    intent: "Hypothèses, zones floues, contraintes, synthèse — et critère go/no-go atelier 2.",
    sections: [
      { id: "assumptions", title: "Hypothèses", livrableSection: 9 },
      { id: "uncertainties", title: "Zones floues", livrableSection: 10 },
      { id: "constraints", title: "Contraintes", livrableSection: 14 },
      { id: "synthesis", title: "Synthèse du besoin réel", livrableSection: 11 },
      { id: "workshop-report", title: "Compte-rendu d'atelier", livrableSection: 17 },
      { id: "gate", title: "Conclusion & gate atelier 2", livrableSection: 18 },
    ],
  },
];

export function findSection(id: AtelierSectionId):
  | { phase: AtelierPhase; section: AtelierPhase["sections"][number] }
  | undefined {
  for (const phase of ATELIER_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allSections(): AtelierPhase["sections"] {
  return ATELIER_PHASES.flatMap((p) => p.sections);
}
