// Atelier 3 — enums, labels, phases.
//
// 21 sections livrable consolidées dans une UX 5 phases.
// Beaucoup de sections (re)pointent vers atelier 1 / 2 — c'est
// volontaire (vue de couverture) pour éviter la re-saisie. Les
// modèles Prisma spécifiques ne couvrent que les analyses VRAIMENT
// nouvelles (documentaire, réglementaire, maturité, faisabilité).

export const DOC_STRUCTURE_LEVELS = [
  "STRUCTURED",
  "SEMI_STRUCTURED",
  "UNSTRUCTURED",
  "MIXED",
] as const;
export type DocStructureLevel = (typeof DOC_STRUCTURE_LEVELS)[number];

export const DOC_STRUCTURE_LABELS: Record<DocStructureLevel, string> = {
  STRUCTURED: "Structurés (XML, CSV, JSON…)",
  SEMI_STRUCTURED: "Semi-structurés (formulaires, mail)",
  UNSTRUCTURED: "Non structurés (PDF, images, libre)",
  MIXED: "Mixte",
};

export const DOC_EXPLOITABILITIES = ["EASY", "MODERATE", "DIFFICULT", "UNUSABLE"] as const;
export type DocExploitability = (typeof DOC_EXPLOITABILITIES)[number];

export const DOC_EXPLOITABILITY_LABELS: Record<DocExploitability, string> = {
  EASY: "Facile",
  MODERATE: "Modérée",
  DIFFICULT: "Difficile",
  UNUSABLE: "Inutilisable en l'état",
};

export const DOC_COMPLEXITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
export type DocComplexityLevel = (typeof DOC_COMPLEXITY_LEVELS)[number];

export const DOC_COMPLEXITY_LABELS: Record<DocComplexityLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
  VERY_HIGH: "Très élevée",
};

export const EU_AI_ACT_TIERS = ["NONE", "MINIMAL", "LIMITED", "HIGH", "UNACCEPTABLE"] as const;
export type EuAiActTier = (typeof EU_AI_ACT_TIERS)[number];

export const EU_AI_ACT_TIER_LABELS: Record<EuAiActTier, string> = {
  NONE: "Hors AI Act",
  MINIMAL: "Risque minimal",
  LIMITED: "Risque limité",
  HIGH: "Risque élevé",
  UNACCEPTABLE: "Risque inacceptable (interdit)",
};

export const A3_OVERALL_FEASIBILITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type A3OverallFeasibility = (typeof A3_OVERALL_FEASIBILITIES)[number];

export const A3_OVERALL_FEASIBILITY_LABELS: Record<A3OverallFeasibility, string> = {
  LOW: "Faible — projet à risque",
  MEDIUM: "Moyenne — POC recommandé",
  HIGH: "Forte — projet réaliste",
};

export const A3_MATURITY_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type A3MaturityLevel = (typeof A3_MATURITY_LEVELS)[number];

export const A3_MATURITY_LABELS: Record<A3MaturityLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
};

// -------------------------------------------------------------
// 5 phases UX (14 sections — les 21 du livrable sont mappées
// soit à une section de l'atelier 3, soit à un récap depuis
// atelier 1 / 2).
// -------------------------------------------------------------
export type Atelier3PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier3SectionId =
  // Phase A — Lecture du dossier consolidé
  | "qualification"
  | "coverage"
  // Phase B — Compléments d'analyse
  | "document-analysis"
  | "regulatory"
  | "si-dependencies"
  // Phase C — Maturité & faisabilité
  | "complexity"
  | "maturity"
  | "feasibility"
  // Phase D — Synthèses & opportunités
  | "critical-points"
  | "opportunities"
  | "recommendations"
  // Phase E — Préparation suite + Synthèse finale + Gate
  | "scoring-preparation"
  | "cartography-preparation"
  | "synthesis"
  | "gate";

export type Atelier3Phase = {
  id: Atelier3PhaseId;
  title: string;
  intent: string;
  sections: {
    id: Atelier3SectionId;
    title: string;
    livrableSection: number;
    // CoverageOrigin = d'où viennent les données affichées :
    //   "OWN" = section atelier 3 (nouveau)
    //   "ATELIER_1" | "ATELIER_2" = vue consolidée
    //   "MIXED" = un peu des deux
    coverageOrigin: "OWN" | "ATELIER_1" | "ATELIER_2" | "MIXED" | "DERIVED";
  }[];
};

export const ATELIER3_PHASES: Atelier3Phase[] = [
  {
    id: "A",
    title: "Lecture du dossier",
    intent: "Récapituler ce que les ateliers 1 et 2 ont collecté, et repérer les manques.",
    sections: [
      { id: "qualification", title: "Qualification du projet", livrableSection: 1, coverageOrigin: "ATELIER_1" },
      { id: "coverage", title: "Vue de couverture", livrableSection: 0, coverageOrigin: "DERIVED" },
    ],
  },
  {
    id: "B",
    title: "Compléments d'analyse",
    intent: "Documents, réglementaire, dépendances SI — ce qui n'a pas été traité avant.",
    sections: [
      { id: "document-analysis", title: "Analyse documentaire", livrableSection: 6, coverageOrigin: "OWN" },
      { id: "regulatory", title: "Analyse réglementaire", livrableSection: 11, coverageOrigin: "OWN" },
      { id: "si-dependencies", title: "Dépendances SI", livrableSection: 10, coverageOrigin: "ATELIER_2" },
    ],
  },
  {
    id: "C",
    title: "Maturité & faisabilité",
    intent: "Auto-évaluation maturité par axe + faisabilité technique, organisationnelle, RH.",
    sections: [
      { id: "complexity", title: "Niveaux de complexité", livrableSection: 13, coverageOrigin: "ATELIER_2" },
      { id: "maturity", title: "Maturité projet", livrableSection: 14, coverageOrigin: "MIXED" },
      { id: "feasibility", title: "Faisabilité globale", livrableSection: 15, coverageOrigin: "OWN" },
    ],
  },
  {
    id: "D",
    title: "Synthèses & opportunités",
    intent: "Points critiques détectés, opportunités identifiées, recommandations.",
    sections: [
      { id: "critical-points", title: "Points critiques", livrableSection: 16, coverageOrigin: "DERIVED" },
      { id: "opportunities", title: "Opportunités", livrableSection: 17, coverageOrigin: "ATELIER_1" },
      { id: "recommendations", title: "Recommandations", livrableSection: 18, coverageOrigin: "DERIVED" },
    ],
  },
  {
    id: "E",
    title: "Préparation scoring + Synthèse + Gate",
    intent: "Préparer scoring (atelier 4) et cartographie (atelier 5), synthèse finale, gate.",
    sections: [
      { id: "scoring-preparation", title: "Préparation scoring", livrableSection: 19, coverageOrigin: "OWN" },
      { id: "cartography-preparation", title: "Préparation cartographie", livrableSection: 20, coverageOrigin: "OWN" },
      { id: "synthesis", title: "Synthèse finale", livrableSection: 21, coverageOrigin: "OWN" },
      { id: "gate", title: "Gate atelier 4", livrableSection: 0, coverageOrigin: "OWN" },
    ],
  },
];

export function findA3Section(id: Atelier3SectionId):
  | { phase: Atelier3Phase; section: Atelier3Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER3_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA3Sections(): Atelier3Phase["sections"] {
  return ATELIER3_PHASES.flatMap((p) => p.sections);
}
