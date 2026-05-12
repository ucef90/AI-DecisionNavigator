// Application-layer enums.
//
// SQLite doesn't support native enums, so the schema stores these as TEXT.
// These constants are the authoritative list of allowed values — use them
// when writing to the DB and when rendering badges/labels.

export const USER_ROLES = [
  "ADMIN",
  "PROJECT_MANAGER",
  "BUSINESS",
  "IT",
  "DATA",
  "GOVERNANCE",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  PROJECT_MANAGER: "Chef de projet",
  BUSINESS: "Direction métier",
  IT: "DSI / IT",
  DATA: "Data / DDEC",
  GOVERNANCE: "DPO / Gouvernance",
};

export const PROJECT_STATUSES = [
  "DRAFT",
  "IN_PROGRESS",
  "SCORED",
  "DECIDED",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Brouillon",
  IN_PROGRESS: "En cadrage",
  SCORED: "Scoré",
  DECIDED: "Décision prise",
  ARCHIVED: "Archivé",
};

export const MATURITY_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Maturity = (typeof MATURITY_LEVELS)[number];

export const MATURITY_LABELS: Record<Maturity, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
};

export const DECISIONS = [
  "GO_IA",
  "POC_IA",
  "AUTOMATION",
  "STUDY",
  "NO_GO",
] as const;
export type Decision = (typeof DECISIONS)[number];

export const DECISION_LABELS: Record<Decision, string> = {
  GO_IA: "GO IA",
  POC_IA: "POC IA",
  AUTOMATION: "Automatisation simple",
  STUDY: "Étude complémentaire",
  NO_GO: "NO GO IA",
};

export const AI_APPROACHES = [
  "AUTOMATION",
  "RULE",
  "ML",
  "LLM",
  "RAG",
  "AGENT",
  "HYBRID",
  "CLASSIC",
] as const;
export type AIApproach = (typeof AI_APPROACHES)[number];

export const AI_APPROACH_LABELS: Record<AIApproach, string> = {
  AUTOMATION: "Automatisation simple",
  RULE: "Règle métier",
  ML: "Machine Learning",
  LLM: "LLM",
  RAG: "RAG",
  AGENT: "Agent IA",
  HYBRID: "Workflow hybride",
  CLASSIC: "Solution classique non IA",
};

export const SENSITIVITY_LEVELS = [
  "NONE",
  "INTERNAL",
  "CONFIDENTIAL",
  "SENSITIVE",
] as const;
export type Sensitivity = (typeof SENSITIVITY_LEVELS)[number];

export const OVERALL_RISKS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type OverallRisk = (typeof OVERALL_RISKS)[number];

export const OVERALL_RISK_LABELS: Record<OverallRisk, string> = {
  LOW: "Faible",
  MEDIUM: "Modéré",
  HIGH: "Élevé",
  CRITICAL: "Critique",
};

export const DELIVERABLE_TYPES = [
  "FRAMING_NOTE",
  "DECISION_SHEET",
  "CARTOGRAPHY",
  "DATA_ANALYSIS",
  "RISK_ANALYSIS",
  "RECOMMENDATION",
  "ACTION_PLAN",
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, string> = {
  FRAMING_NOTE: "Note de cadrage IA",
  DECISION_SHEET: "Fiche de décision",
  CARTOGRAPHY: "Cartographie",
  DATA_ANALYSIS: "Analyse data",
  RISK_ANALYSIS: "Analyse des risques",
  RECOMMENDATION: "Recommandation finale",
  ACTION_PLAN: "Plan d'action",
};

export const DELIVERABLE_FORMATS = ["markdown", "pdf", "docx"] as const;
export type DeliverableFormat = (typeof DELIVERABLE_FORMATS)[number];

// Scoring thresholds — see SPEC §177
export function decisionFromTotal(total: number): Decision {
  if (total >= 15) return "GO_IA";
  if (total >= 10) return "POC_IA";
  if (total >= 6) return "STUDY";
  return "NO_GO";
}
