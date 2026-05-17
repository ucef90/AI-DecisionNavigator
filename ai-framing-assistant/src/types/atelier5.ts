// Atelier 5 — Cartographie IA complète
//
// L'atelier 5 fait le pont entre les données collectées
// (ateliers 1-4) et la vision systémique du projet IA. On
// réutilise le moteur cartography existant qui génère 6 vues
// (BUSINESS, WORKFLOW, DATA, TECHNOLOGY, RISK, GOVERNANCE).
// Cet atelier ajoute :
//   - Annotations contextuelles sur nœuds
//   - Synthèse globale cartographique
//   - Gate de passage à l'atelier 6 (gouvernance)

import type { CartographyLayerId } from "@/lib/engines/cartography";

export const ANNOTATION_KINDS = ["NOTE", "WARNING", "DECISION", "QUESTION"] as const;
export type AnnotationKind = (typeof ANNOTATION_KINDS)[number];

export const ANNOTATION_KIND_LABELS: Record<AnnotationKind, string> = {
  NOTE: "Note",
  WARNING: "Alerte",
  DECISION: "Décision",
  QUESTION: "Question ouverte",
};

export const ANNOTATION_KIND_COLORS: Record<AnnotationKind, string> = {
  NOTE: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  WARNING: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  DECISION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  QUESTION: "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
};

export const ANNOTATION_CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type AnnotationCriticality = (typeof ANNOTATION_CRITICALITIES)[number];

export const ANNOTATION_CRITICALITY_LABELS: Record<AnnotationCriticality, string> = {
  LOW: "Faible",
  MEDIUM: "Modéré",
  HIGH: "Élevé",
  CRITICAL: "Critique",
};

// Mapping layer cartography → section atelier 5
export const LAYER_TO_SECTION: Record<CartographyLayerId, Atelier5SectionId> = {
  BUSINESS: "business-map",
  WORKFLOW: "workflow-map",
  DATA: "data-map",
  TECHNOLOGY: "ai-map",
  RISK: "risk-map",
  GOVERNANCE: "governance-map",
};

// -------------------------------------------------------------
// 5 phases UX
// -------------------------------------------------------------
export type Atelier5PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier5SectionId =
  | "overview"
  | "business-map"
  | "workflow-map"
  | "data-map"
  | "ai-map"
  | "risk-map"
  | "governance-map"
  | "target-architecture"
  | "synthesis"
  | "gate";

export type Atelier5Phase = {
  id: Atelier5PhaseId;
  title: string;
  intent: string;
  sections: { id: Atelier5SectionId; title: string }[];
};

export const ATELIER5_PHASES: Atelier5Phase[] = [
  {
    id: "A",
    title: "Vue d'ensemble",
    intent: "Consolider en un coup d'œil les 6 cartographies du projet IA.",
    sections: [{ id: "overview", title: "Vue d'ensemble (6 couches)" }],
  },
  {
    id: "B",
    title: "Métier & opérationnel",
    intent: "Cartographie métier et workflow détaillés, avec annotations.",
    sections: [
      { id: "business-map", title: "Cartographie métier" },
      { id: "workflow-map", title: "Cartographie workflow" },
    ],
  },
  {
    id: "C",
    title: "Data & IA",
    intent: "Sources, flux et composants IA, avec criticité par nœud.",
    sections: [
      { id: "data-map", title: "Cartographie data" },
      { id: "ai-map", title: "Cartographie IA / technos" },
    ],
  },
  {
    id: "D",
    title: "Risques, gouvernance & architecture cible",
    intent: "Risques cartographiés, gouvernance, et archi cible reprise de l'atelier 2.",
    sections: [
      { id: "risk-map", title: "Cartographie risques" },
      { id: "governance-map", title: "Cartographie gouvernance" },
      { id: "target-architecture", title: "Architecture cible (depuis atelier 2)" },
    ],
  },
  {
    id: "E",
    title: "Synthèse + gate atelier 6",
    intent: "Synthèse cartographique et gate vers gouvernance IA.",
    sections: [
      { id: "synthesis", title: "Synthèse cartographique" },
      { id: "gate", title: "Gate atelier 6" },
    ],
  },
];

export function findA5Section(id: Atelier5SectionId):
  | { phase: Atelier5Phase; section: Atelier5Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER5_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA5Sections(): Atelier5Phase["sections"] {
  return ATELIER5_PHASES.flatMap((p) => p.sections);
}
