// Atelier 6 — Gouvernance, risques et conformité IA
//
// 8 modules métier consolidés en 5 phases UX :
//   A. Cockpit gouvernance (vue d'ensemble dashboards)
//   B. Gouvernance & validations (RACI + workflows validation)
//   C. Risques & sécurité (matrice/heatmap risques + RBAC)
//   D. Conformité & audit (RGPD checklist + traçabilité)
//   E. Monitoring + incidents + synthèse + gate

// ----- Module 1 — RACI -----
export const RACI_TYPES = ["R", "A", "C", "I"] as const;
export type RaciType = (typeof RACI_TYPES)[number];

export const RACI_LABELS: Record<RaciType, string> = {
  R: "Responsable",
  A: "Autorité (Accountable)",
  C: "Consulté",
  I: "Informé",
};

export const RACI_COLORS: Record<RaciType, string> = {
  R: "bg-sky-500 text-white",
  A: "bg-violet-600 text-white",
  C: "bg-amber-500 text-white",
  I: "bg-foreground/30 text-foreground",
};

// Liste des scopes de gouvernance proposés par défaut
export const DEFAULT_GOVERNANCE_SCOPES = [
  "Pilotage projet IA",
  "Validation réponses IA",
  "Supervision IA",
  "Sécurité données",
  "Conformité RGPD",
  "Architecture & SI",
  "Qualité métier",
  "Gestion incidents IA",
] as const;

// ----- Module 4 — Security -----
export const SECURITY_DOMAINS = [
  "AUTH",
  "RBAC",
  "ENCRYPTION",
  "LOGS",
  "SEGMENTATION",
  "MONITORING",
  "BACKUP",
  "OTHER",
] as const;
export type SecurityDomain = (typeof SECURITY_DOMAINS)[number];

export const SECURITY_DOMAIN_LABELS: Record<SecurityDomain, string> = {
  AUTH: "Authentification (SSO / MFA)",
  RBAC: "Gestion des rôles & permissions",
  ENCRYPTION: "Chiffrement données",
  LOGS: "Journalisation",
  SEGMENTATION: "Segmentation environnements",
  MONITORING: "Monitoring sécurité",
  BACKUP: "Sauvegardes / restauration",
  OTHER: "Autre",
};

export const SECURITY_STATUSES = ["PLANNED", "IN_PLACE", "TESTED", "NOT_APPLICABLE"] as const;
export type SecurityStatus = (typeof SECURITY_STATUSES)[number];

export const SECURITY_STATUS_LABELS: Record<SecurityStatus, string> = {
  PLANNED: "Planifié",
  IN_PLACE: "En place",
  TESTED: "Testé",
  NOT_APPLICABLE: "N/A",
};

export const SECURITY_STATUS_COLORS: Record<SecurityStatus, string> = {
  PLANNED: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  IN_PLACE: "border-lime-500/40 bg-lime-50 text-lime-900 dark:bg-lime-950/40 dark:text-lime-100",
  TESTED: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  NOT_APPLICABLE: "border-border bg-muted text-muted-foreground",
};

// ----- Module 5 — Conformité -----
export const COMPLIANCE_FRAMEWORKS = [
  "RGPD",
  "EU_AI_ACT",
  "CNIL",
  "INTERNAL",
  "ISO27001",
  "OTHER",
] as const;
export type ComplianceFramework = (typeof COMPLIANCE_FRAMEWORKS)[number];

export const COMPLIANCE_FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  RGPD: "RGPD",
  EU_AI_ACT: "EU AI Act",
  CNIL: "CNIL",
  INTERNAL: "Politique interne",
  ISO27001: "ISO 27001",
  OTHER: "Autre",
};

export const COMPLIANCE_STATUSES = ["COMPLIANT", "PARTIAL", "NON_COMPLIANT", "NOT_APPLICABLE"] as const;
export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  COMPLIANT: "Conforme",
  PARTIAL: "Partiel",
  NON_COMPLIANT: "Non conforme",
  NOT_APPLICABLE: "N/A",
};

export const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  COMPLIANT: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  PARTIAL: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NON_COMPLIANT: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  NOT_APPLICABLE: "border-border bg-muted text-muted-foreground",
};

// ----- Module 7 — Monitoring -----
export const KPI_CATEGORIES = [
  "PERFORMANCE",
  "QUALITY",
  "DRIFT",
  "SECURITY",
  "INCIDENT",
  "USAGE",
] as const;
export type KpiCategory = (typeof KPI_CATEGORIES)[number];

export const KPI_CATEGORY_LABELS: Record<KpiCategory, string> = {
  PERFORMANCE: "Performance",
  QUALITY: "Qualité IA",
  DRIFT: "Dérive modèle",
  SECURITY: "Sécurité",
  INCIDENT: "Incidents",
  USAGE: "Usage",
};

export const KPI_FREQUENCIES = ["REALTIME", "HOURLY", "DAILY", "WEEKLY", "MONTHLY"] as const;
export type KpiFrequency = (typeof KPI_FREQUENCIES)[number];

export const KPI_FREQUENCY_LABELS: Record<KpiFrequency, string> = {
  REALTIME: "Temps réel",
  HOURLY: "Horaire",
  DAILY: "Quotidien",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};

// ----- Module 8 — Incidents -----
export const INCIDENT_TYPES = [
  "AI_HALLUCINATION",
  "DATA_LEAK",
  "CLASSIFICATION_ERROR",
  "DRIFT",
  "OUTAGE",
  "OCR_ERROR",
  "OTHER",
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  AI_HALLUCINATION: "Hallucination IA",
  DATA_LEAK: "Fuite de données",
  CLASSIFICATION_ERROR: "Erreur classification",
  DRIFT: "Dérive modèle",
  OUTAGE: "Panne / indisponibilité",
  OCR_ERROR: "Erreur OCR",
  OTHER: "Autre",
};

// ----- Synthèse — niveau gouvernance -----
export const GOVERNANCE_LEVELS = ["CRITICAL", "LOW", "MEDIUM", "HIGH", "EXCELLENT"] as const;
export type GovernanceLevel = (typeof GOVERNANCE_LEVELS)[number];

export const GOVERNANCE_LEVEL_LABELS: Record<GovernanceLevel, string> = {
  CRITICAL: "Critique",
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Élevé",
  EXCELLENT: "Excellent",
};

export const GOVERNANCE_LEVEL_COLORS: Record<GovernanceLevel, string> = {
  CRITICAL: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  LOW: "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
  MEDIUM: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  HIGH: "border-lime-500/40 bg-lime-50 text-lime-900 dark:bg-lime-950/40 dark:text-lime-100",
  EXCELLENT: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

// -------------------------------------------------------------
// 5 phases UX (10 sections)
// -------------------------------------------------------------
export type Atelier6PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier6SectionId =
  | "cockpit"
  | "governance-roles"
  | "human-validations"
  | "ai-risks"
  | "security"
  | "compliance"
  | "audit-trail"
  | "monitoring"
  | "incidents"
  | "synthesis"
  | "gate";

export type Atelier6Phase = {
  id: Atelier6PhaseId;
  title: string;
  intent: string;
  sections: { id: Atelier6SectionId; title: string }[];
};

export const ATELIER6_PHASES: Atelier6Phase[] = [
  {
    id: "A",
    title: "Cockpit gouvernance",
    intent: "Vue d'ensemble dashboards : score, RACI, heatmap, conformité.",
    sections: [{ id: "cockpit", title: "Cockpit gouvernance IA" }],
  },
  {
    id: "B",
    title: "Rôles & validations",
    intent: "RACI gouvernance + points de validation humaine obligatoires.",
    sections: [
      { id: "governance-roles", title: "Matrice RACI" },
      { id: "human-validations", title: "Validations humaines" },
    ],
  },
  {
    id: "C",
    title: "Risques & sécurité",
    intent: "Cartographie risques IA (heatmap) + contrôles sécurité (RBAC, chiffrement).",
    sections: [
      { id: "ai-risks", title: "Risques IA" },
      { id: "security", title: "Sécurité & accès" },
    ],
  },
  {
    id: "D",
    title: "Conformité & auditabilité",
    intent: "Checklist conformité (RGPD, EU AI Act) + journalisation et traçabilité.",
    sections: [
      { id: "compliance", title: "Conformité" },
      { id: "audit-trail", title: "Auditabilité & traçabilité" },
    ],
  },
  {
    id: "E",
    title: "Monitoring + incidents + synthèse",
    intent: "KPI à monitorer, playbook incidents, synthèse gouvernance, gate atelier 7.",
    sections: [
      { id: "monitoring", title: "Monitoring & supervision" },
      { id: "incidents", title: "Gestion des incidents" },
      { id: "synthesis", title: "Synthèse gouvernance" },
      { id: "gate", title: "Gate atelier 7" },
    ],
  },
];

export function findA6Section(id: Atelier6SectionId):
  | { phase: Atelier6Phase; section: Atelier6Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER6_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA6Sections(): Atelier6Phase["sections"] {
  return ATELIER6_PHASES.flatMap((p) => p.sections);
}

export function governanceLevelFromScore(score: number): GovernanceLevel {
  if (score >= 80) return "EXCELLENT";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 20) return "LOW";
  return "CRITICAL";
}
