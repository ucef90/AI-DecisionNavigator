// Atelier 7 — Architecture cible, roadmap et décision finale IA
//
// SOMMET du framework. 8 modules consolidés en 5 phases UX.
// Sortie : décision finale + dossier stratégique IA exportable.

export const ROADMAP_PHASES = [
  "PHASE_0_POC",
  "PHASE_1_MVP",
  "PHASE_2_PILOT",
  "PHASE_3_ROLLOUT",
  "PHASE_4_RUN",
] as const;
export type RoadmapPhase = (typeof ROADMAP_PHASES)[number];

export const ROADMAP_PHASE_LABELS: Record<RoadmapPhase, string> = {
  PHASE_0_POC: "Phase 0 — POC",
  PHASE_1_MVP: "Phase 1 — MVP",
  PHASE_2_PILOT: "Phase 2 — Pilote",
  PHASE_3_ROLLOUT: "Phase 3 — Déploiement",
  PHASE_4_RUN: "Phase 4 — Run / exploitation",
};

export const ROADMAP_PHASE_COLORS: Record<RoadmapPhase, string> = {
  PHASE_0_POC: "bg-sky-500",
  PHASE_1_MVP: "bg-violet-500",
  PHASE_2_PILOT: "bg-amber-500",
  PHASE_3_ROLLOUT: "bg-emerald-500",
  PHASE_4_RUN: "bg-foreground/70",
};

export const ROADMAP_ITEM_TYPES = ["QUICK_WIN", "STRATEGIC", "DEPENDENCY", "RUN"] as const;
export type RoadmapItemType = (typeof ROADMAP_ITEM_TYPES)[number];

export const ROADMAP_ITEM_TYPE_LABELS: Record<RoadmapItemType, string> = {
  QUICK_WIN: "Quick win",
  STRATEGIC: "Stratégique",
  DEPENDENCY: "Dépendance",
  RUN: "Exploitation",
};

export const ROADMAP_STATUSES = ["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const INDUSTRIALIZATION_STAGES = ["POC", "MVP", "PILOT", "ROLLOUT", "RUN"] as const;
export type IndustrializationStage = (typeof INDUSTRIALIZATION_STAGES)[number];

export const INDUSTRIALIZATION_STAGE_LABELS: Record<IndustrializationStage, string> = {
  POC: "POC (preuve de concept)",
  MVP: "MVP (produit minimum viable)",
  PILOT: "Pilote (échelle réduite)",
  ROLLOUT: "Déploiement (full scale)",
  RUN: "Run (exploitation)",
};

export const INDUSTRIALIZATION_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;
export type IndustrializationStatus = (typeof INDUSTRIALIZATION_STATUSES)[number];

export const SPONSOR_DECISIONS = ["OK", "KO", "IN_REVIEW"] as const;
export type SponsorDecision = (typeof SPONSOR_DECISIONS)[number];

export const SPONSOR_DECISION_LABELS: Record<SponsorDecision, string> = {
  OK: "Validé",
  KO: "Rejeté",
  IN_REVIEW: "En revue",
};

// -------------------------------------------------------------
// 5 phases UX
// -------------------------------------------------------------
export type Atelier7PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier7SectionId =
  | "executive-cockpit"
  | "vision"
  | "architecture"
  | "prioritization"
  | "roadmap"
  | "industrialization"
  | "governance-consolidation"
  | "pilotage"
  | "final-decision"
  | "deliverable"
  | "gate";

export type Atelier7Phase = {
  id: Atelier7PhaseId;
  title: string;
  intent: string;
  sections: { id: Atelier7SectionId; title: string }[];
};

export const ATELIER7_PHASES: Atelier7Phase[] = [
  {
    id: "A",
    title: "Cockpit exécutif",
    intent: "Vue dashboard consolidée des 7 ateliers — décision finale en un écran.",
    sections: [{ id: "executive-cockpit", title: "Cockpit exécutif final" }],
  },
  {
    id: "B",
    title: "Vision & architecture cible",
    intent: "Vision stratégique, valeur business, architecture cible (reprise atelier 2).",
    sections: [
      { id: "vision", title: "Vision stratégique" },
      { id: "architecture", title: "Architecture cible" },
    ],
  },
  {
    id: "C",
    title: "Priorisation & roadmap",
    intent: "Matrice impact/complexité + roadmap par phases (POC → Run).",
    sections: [
      { id: "prioritization", title: "Priorisation (matrice impact/complexité)" },
      { id: "roadmap", title: "Roadmap transformation" },
    ],
  },
  {
    id: "D",
    title: "Industrialisation & gouvernance",
    intent: "Plan industrialisation par stage + consolidation gouvernance + pilotage.",
    sections: [
      { id: "industrialization", title: "Stratégie industrialisation" },
      { id: "governance-consolidation", title: "Gouvernance consolidée" },
      { id: "pilotage", title: "Pilotage stratégique" },
    ],
  },
  {
    id: "E",
    title: "Décision finale + livrable",
    intent: "Décision finale IA argumentée, livrable consolidé, signature sponsor, gate.",
    sections: [
      { id: "final-decision", title: "Décision finale IA" },
      { id: "deliverable", title: "Dossier stratégique final (export)" },
      { id: "gate", title: "Clôture du framework" },
    ],
  },
];

export function findA7Section(id: Atelier7SectionId):
  | { phase: Atelier7Phase; section: Atelier7Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER7_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA7Sections(): Atelier7Phase["sections"] {
  return ATELIER7_PHASES.flatMap((p) => p.sections);
}

// Quadrants de la matrice impact/complexité
export type PriorityQuadrant = "QUICK_WIN" | "MAJOR_PROJECT" | "FILL_IN" | "AVOID";

export const PRIORITY_QUADRANT_LABELS: Record<PriorityQuadrant, string> = {
  QUICK_WIN: "Quick wins (impact↑ / complexité↓)",
  MAJOR_PROJECT: "Projets stratégiques (impact↑ / complexité↑)",
  FILL_IN: "Remplissage (impact↓ / complexité↓)",
  AVOID: "À éviter (impact↓ / complexité↑)",
};

export const PRIORITY_QUADRANT_COLORS: Record<PriorityQuadrant, string> = {
  QUICK_WIN: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/30",
  MAJOR_PROJECT: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/30",
  FILL_IN: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/30",
  AVOID: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/30",
};

export function classifyQuadrant(impact: number, complexity: number): PriorityQuadrant {
  const highImpact = impact >= 4;
  const highComplexity = complexity >= 4;
  if (highImpact && !highComplexity) return "QUICK_WIN";
  if (highImpact && highComplexity) return "MAJOR_PROJECT";
  if (!highImpact && highComplexity) return "AVOID";
  return "FILL_IN";
}
