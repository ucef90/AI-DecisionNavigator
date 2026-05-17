// Atelier 4 — Scoring & maturité projet IA
//
// 11 axes notés 1..5, auto-calculés depuis atelier 1+2+3
// (avec possibilité d'override par le CDP) + agrégat global,
// décision recommandée, priorisation.

export type ScorecardAxis =
  | "businessMaturity"
  | "dataQuality"
  | "workflowMaturity"
  | "governanceMaturity"
  | "riskControl"
  | "complexityScore"
  | "technicalFeasibility"
  | "organizationalFeasibility"
  | "regulatoryReadiness"
  | "siIndependence"
  | "aiReadiness";

export const SCORECARD_AXES: ScorecardAxis[] = [
  "businessMaturity",
  "dataQuality",
  "workflowMaturity",
  "governanceMaturity",
  "riskControl",
  "complexityScore",
  "technicalFeasibility",
  "organizationalFeasibility",
  "regulatoryReadiness",
  "siIndependence",
  "aiReadiness",
];

export const SCORECARD_AXIS_LABELS: Record<ScorecardAxis, string> = {
  businessMaturity: "Maturité métier",
  dataQuality: "Qualité données",
  workflowMaturity: "Workflow",
  governanceMaturity: "Gouvernance",
  riskControl: "Maîtrise des risques",
  complexityScore: "Simplicité (vs complexité)",
  technicalFeasibility: "Faisabilité technique",
  organizationalFeasibility: "Faisabilité organisationnelle",
  regulatoryReadiness: "Prêt réglementaire",
  siIndependence: "Indépendance SI",
  aiReadiness: "Préparation IA",
};

export const SCORECARD_AXIS_SHORT: Record<ScorecardAxis, string> = {
  businessMaturity: "Métier",
  dataQuality: "Data",
  workflowMaturity: "Workflow",
  governanceMaturity: "Gouvernance",
  riskControl: "Risques",
  complexityScore: "Simplicité",
  technicalFeasibility: "Faisab. tech",
  organizationalFeasibility: "Faisab. orga",
  regulatoryReadiness: "Réglo",
  siIndependence: "SI indép.",
  aiReadiness: "IA prête",
};

// Niveau global agrégé — aligné sur le doc atelier 4
// (Immature / Fragile / Intermédiaire / Mature / Très mature)
export const OVERALL_LEVELS = ["IMMATURE", "FRAGILE", "INTERMEDIATE", "MATURE", "VERY_MATURE"] as const;
export type OverallLevel = (typeof OVERALL_LEVELS)[number];

export const OVERALL_LEVEL_LABELS: Record<OverallLevel, string> = {
  IMMATURE: "Immature",
  FRAGILE: "Fragile",
  INTERMEDIATE: "Intermédiaire",
  MATURE: "Mature",
  VERY_MATURE: "Très mature",
};

export const OVERALL_LEVEL_RANGES: Record<OverallLevel, string> = {
  IMMATURE: "0-20%",
  FRAGILE: "20-40%",
  INTERMEDIATE: "40-60%",
  MATURE: "60-80%",
  VERY_MATURE: "80-100%",
};

export const OVERALL_LEVEL_COLORS: Record<OverallLevel, string> = {
  IMMATURE: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  FRAGILE: "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
  INTERMEDIATE: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  MATURE: "border-lime-500/40 bg-lime-50 text-lime-900 dark:bg-lime-950/40 dark:text-lime-100",
  VERY_MATURE: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

export const PRIORITY_LEVELS = ["STRATEGIC", "HIGH", "MEDIUM", "LOW", "DEPRIORITIZED"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  STRATEGIC: "Stratégique",
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
  DEPRIORITIZED: "Dé-priorisé",
};

// Réutilise les décisions globales définies dans @/types
// (GO_IA, POC_IA, AUTOMATION, STUDY, NO_GO)

// -------------------------------------------------------------
// 5 phases UX (8 sections au total)
// -------------------------------------------------------------
export type Atelier4PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier4SectionId =
  | "cockpit"
  | "justifications"
  | "radar"
  | "risk-matrix"
  | "feasibility-matrix"
  | "priority"
  | "recommendation"
  | "synthesis"
  | "gate";

export type Atelier4Phase = {
  id: Atelier4PhaseId;
  title: string;
  intent: string;
  sections: { id: Atelier4SectionId; title: string; livrableSection: number }[];
};

export const ATELIER4_PHASES: Atelier4Phase[] = [
  {
    id: "A",
    title: "Cockpit scoring",
    intent: "Vue d'ensemble des 11 axes auto-calculés depuis ateliers 1-3.",
    sections: [
      { id: "cockpit", title: "Cockpit (11 axes)", livrableSection: 1 },
      { id: "justifications", title: "Justifications par axe", livrableSection: 2 },
    ],
  },
  {
    id: "B",
    title: "Visualisations",
    intent: "Radar maturité, matrice risques, matrice faisabilité.",
    sections: [
      { id: "radar", title: "Radar maturité", livrableSection: 12 },
      { id: "risk-matrix", title: "Matrice risques", livrableSection: 13 },
      { id: "feasibility-matrix", title: "Matrice faisabilité", livrableSection: 14 },
    ],
  },
  {
    id: "C",
    title: "Priorisation",
    intent: "Positionner le projet sur l'échelle stratégique → dé-priorisé.",
    sections: [
      { id: "priority", title: "Niveau de priorité", livrableSection: 17 },
    ],
  },
  {
    id: "D",
    title: "Décision recommandée",
    intent: "Recommandation argumentée + actions prioritaires.",
    sections: [
      { id: "recommendation", title: "Décision recommandée", livrableSection: 18 },
    ],
  },
  {
    id: "E",
    title: "Synthèse + gate atelier 5",
    intent: "Synthèse complète scoring + gate de passage à la cartographie.",
    sections: [
      { id: "synthesis", title: "Synthèse scoring projet", livrableSection: 15 },
      { id: "gate", title: "Gate atelier 5", livrableSection: 0 },
    ],
  },
];

export function findA4Section(id: Atelier4SectionId):
  | { phase: Atelier4Phase; section: Atelier4Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER4_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA4Sections(): Atelier4Phase["sections"] {
  return ATELIER4_PHASES.flatMap((p) => p.sections);
}

// -------------------------------------------------------------
// Conversion score global (sur 100) → niveau qualitatif
// Seuils alignés sur le doc atelier 4 :
//   0-20%   → Immature
//   20-40%  → Fragile
//   40-60%  → Intermédiaire
//   60-80%  → Mature
//   80-100% → Très mature
// -------------------------------------------------------------
export function levelFromOverallScore(score: number): OverallLevel {
  if (score >= 80) return "VERY_MATURE";
  if (score >= 60) return "MATURE";
  if (score >= 40) return "INTERMEDIATE";
  if (score >= 20) return "FRAGILE";
  return "IMMATURE";
}
