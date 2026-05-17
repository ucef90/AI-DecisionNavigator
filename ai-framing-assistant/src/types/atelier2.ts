// Atelier 2 — enums, labels, phases.
//
// 16 sections du livrable, regroupées en 5 phases UX (A → E).
// Le but est de qualifier ce qui relève de l'automatisation, de
// l'IA, ou de l'humain — sans tomber dans le piège "mettons de
// l'IA partout".

export const TASK_NATURES = [
  "RECEIVE",
  "READ",
  "CLASSIFY",
  "EXTRACT",
  "SEARCH",
  "DECIDE",
  "GENERATE",
  "VALIDATE",
  "TRANSFER",
  "ARCHIVE",
  "NOTIFY",
  "OTHER",
] as const;
export type TaskNature = (typeof TASK_NATURES)[number];

export const TASK_NATURE_LABELS: Record<TaskNature, string> = {
  RECEIVE: "Réception",
  READ: "Lecture",
  CLASSIFY: "Classification",
  EXTRACT: "Extraction",
  SEARCH: "Recherche",
  DECIDE: "Décision",
  GENERATE: "Génération",
  VALIDATE: "Validation",
  TRANSFER: "Transfert",
  ARCHIVE: "Archivage",
  NOTIFY: "Notification",
  OTHER: "Autre",
};

export const TASK_VERDICTS = ["AUTOMATION", "AI", "HUMAN", "HYBRID"] as const;
export type TaskVerdict = (typeof TASK_VERDICTS)[number];

export const TASK_VERDICT_LABELS: Record<TaskVerdict, string> = {
  AUTOMATION: "Automatisation",
  AI: "IA",
  HUMAN: "Humain",
  HYBRID: "Hybride (IA + humain)",
};

export const TASK_VERDICT_COLORS: Record<TaskVerdict, string> = {
  AUTOMATION: "bg-sky-500/15 text-sky-900 border-sky-500/40 dark:text-sky-100",
  AI: "bg-violet-500/15 text-violet-900 border-violet-500/40 dark:text-violet-100",
  HUMAN: "bg-amber-500/15 text-amber-900 border-amber-500/40 dark:text-amber-100",
  HYBRID: "bg-emerald-500/15 text-emerald-900 border-emerald-500/40 dark:text-emerald-100",
};

export const INTELLIGENCE_TYPES = [
  "TEXT_UNDERSTANDING",
  "CLASSIFICATION",
  "DOC_SEARCH",
  "CONTENT_GENERATION",
  "REASONING",
  "INTERPRETATION",
  "PREDICTION",
  "EXTRACTION",
] as const;
export type IntelligenceType = (typeof INTELLIGENCE_TYPES)[number];

export const INTELLIGENCE_TYPE_LABELS: Record<IntelligenceType, string> = {
  TEXT_UNDERSTANDING: "Compréhension de texte",
  CLASSIFICATION: "Classification",
  DOC_SEARCH: "Recherche documentaire",
  CONTENT_GENERATION: "Génération de contenu",
  REASONING: "Raisonnement contextuel",
  INTERPRETATION: "Interprétation métier",
  PREDICTION: "Prédiction",
  EXTRACTION: "Extraction structurée",
};

export const INTELLIGENCE_NECESSITIES = ["REQUIRED", "OPTIONAL", "NOT_NEEDED"] as const;
export type IntelligenceNecessity = (typeof INTELLIGENCE_NECESSITIES)[number];

export const INTELLIGENCE_NECESSITY_LABELS: Record<IntelligenceNecessity, string> = {
  REQUIRED: "Nécessaire",
  OPTIONAL: "Optionnel",
  NOT_NEEDED: "Non nécessaire",
};

// Catalogue des technos
export const TECH_CODES = [
  "OCR",
  "NLP",
  "ML",
  "LLM",
  "RAG",
  "BPM",
  "RPA",
  "API",
  "AGENT",
  "RULE_ENGINE",
  "OTHER",
] as const;
export type TechCode = (typeof TECH_CODES)[number];

export const TECH_LABELS: Record<TechCode, string> = {
  OCR: "OCR (lecture documentaire)",
  NLP: "NLP (traitement langage)",
  ML: "Machine Learning",
  LLM: "LLM",
  RAG: "RAG (recherche augmentée)",
  BPM: "BPM (workflow)",
  RPA: "RPA (automatisation robotique)",
  API: "APIs",
  AGENT: "Agent IA",
  RULE_ENGINE: "Moteur de règles",
  OTHER: "Autre",
};

// Famille techno (pour la cartographie)
export const TECH_FAMILY: Record<TechCode, "AUTOMATION" | "AI" | "INFRA"> = {
  OCR: "AI",
  NLP: "AI",
  ML: "AI",
  LLM: "AI",
  RAG: "AI",
  AGENT: "AI",
  BPM: "AUTOMATION",
  RPA: "AUTOMATION",
  RULE_ENGINE: "AUTOMATION",
  API: "INFRA",
  OTHER: "INFRA",
};

export const TECH_MATURITIES = ["MATURE", "EMERGING", "EXPERIMENTAL"] as const;
export type TechMaturity = (typeof TECH_MATURITIES)[number];

export const TECH_MATURITY_LABELS: Record<TechMaturity, string> = {
  MATURE: "Mature",
  EMERGING: "Émergente",
  EXPERIMENTAL: "Expérimentale",
};

export const HV_REASON_TYPES = [
  "REGULATORY",
  "SENSITIVE_DATA",
  "HIGH_IMPACT",
  "AMBIGUOUS_CASE",
  "LEGAL_DECISION",
  "OTHER",
] as const;
export type HumanValidationReasonType = (typeof HV_REASON_TYPES)[number];

export const HV_REASON_TYPE_LABELS: Record<HumanValidationReasonType, string> = {
  REGULATORY: "Réglementaire",
  SENSITIVE_DATA: "Données sensibles",
  HIGH_IMPACT: "Impact élevé",
  AMBIGUOUS_CASE: "Cas ambigu",
  LEGAL_DECISION: "Décision juridique",
  OTHER: "Autre",
};

export const HV_MODES = ["BLOCKING", "ADVISORY"] as const;
export type HumanValidationMode = (typeof HV_MODES)[number];

export const HV_MODE_LABELS: Record<HumanValidationMode, string> = {
  BLOCKING: "Bloquante",
  ADVISORY: "Consultative",
};

export const EXCEPTION_HANDLINGS = ["AI", "AUTOMATION", "HUMAN", "NEEDS_DESIGN"] as const;
export type ExceptionHandling = (typeof EXCEPTION_HANDLINGS)[number];

export const EXCEPTION_HANDLING_LABELS: Record<ExceptionHandling, string> = {
  AI: "IA",
  AUTOMATION: "Automatisation",
  HUMAN: "Humain",
  NEEDS_DESIGN: "À concevoir",
};

export const DEPENDENCY_TYPES = [
  "SI_APP",
  "API",
  "DATA_SOURCE",
  "DOCUMENT_BASE",
  "TEAM",
  "OTHER",
] as const;
export type DependencyType = (typeof DEPENDENCY_TYPES)[number];

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  SI_APP: "Application SI",
  API: "API",
  DATA_SOURCE: "Source de données",
  DOCUMENT_BASE: "Base documentaire",
  TEAM: "Équipe",
  OTHER: "Autre",
};

export const DEPENDENCY_STATUSES = ["AVAILABLE", "TO_BUILD", "TO_NEGOTIATE", "UNKNOWN"] as const;
export type DependencyStatus = (typeof DEPENDENCY_STATUSES)[number];

export const DEPENDENCY_STATUS_LABELS: Record<DependencyStatus, string> = {
  AVAILABLE: "Disponible",
  TO_BUILD: "À construire",
  TO_NEGOTIATE: "À négocier",
  UNKNOWN: "Inconnu",
};

export const RECOMMENDATION_LAYERS = [
  "ORCHESTRATION",
  "INGESTION",
  "INTELLIGENCE",
  "UI",
  "GOVERNANCE",
  "STORAGE",
] as const;
export type RecommendationLayer = (typeof RECOMMENDATION_LAYERS)[number];

export const RECOMMENDATION_LAYER_LABELS: Record<RecommendationLayer, string> = {
  ORCHESTRATION: "Orchestration / workflow",
  INGESTION: "Ingestion / acquisition",
  INTELLIGENCE: "Intelligence (IA)",
  UI: "Interface utilisateur",
  GOVERNANCE: "Gouvernance / supervision",
  STORAGE: "Stockage / traçabilité",
};

export const RECOMMENDATION_PRIORITIES = ["CORE", "RECOMMENDED", "OPTIONAL"] as const;
export type RecommendationPriority = (typeof RECOMMENDATION_PRIORITIES)[number];

export const NODE_TYPES = [
  "INPUT",
  "PROCESS",
  "AI_COMPONENT",
  "AUTO_COMPONENT",
  "HUMAN_VALIDATION",
  "DATA_STORE",
  "OUTPUT",
] as const;
export type ArchNodeType = (typeof NODE_TYPES)[number];

export const NODE_TYPE_LABELS: Record<ArchNodeType, string> = {
  INPUT: "Entrée",
  PROCESS: "Traitement",
  AI_COMPONENT: "Composant IA",
  AUTO_COMPONENT: "Composant automatisé",
  HUMAN_VALIDATION: "Validation humaine",
  DATA_STORE: "Stockage",
  OUTPUT: "Sortie",
};

export const A2_PROFILES = [
  "AUTOMATION_ONLY",
  "AI_HYBRID",
  "AI_CENTRIC",
  "HUMAN_FIRST",
  "NOT_QUALIFIED",
] as const;
export type Atelier2Profile = (typeof A2_PROFILES)[number];

export const A2_PROFILE_LABELS: Record<Atelier2Profile, string> = {
  AUTOMATION_ONLY: "Automatisation classique",
  AI_HYBRID: "Architecture IA hybride",
  AI_CENTRIC: "IA au cœur du processus",
  HUMAN_FIRST: "Humain en première ligne (IA en support)",
  NOT_QUALIFIED: "Pas encore qualifiable",
};

export const COMPLEXITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

export const COMPLEXITY_LEVEL_LABELS: Record<ComplexityLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Élevé",
  VERY_HIGH: "Très élevé",
};

// -------------------------------------------------------------
// 5 phases UX (groupement des 16 sections livrable)
// -------------------------------------------------------------
export type Atelier2PhaseId = "A" | "B" | "C" | "D" | "E";

export type Atelier2SectionId =
  | "qualification"
  | "tasks"
  | "workflows"
  | "rules"
  | "complexity"
  | "matrix"
  | "intelligence"
  | "treatments-map"
  | "technologies"
  | "target-architecture"
  | "human-validation"
  | "exceptions"
  | "dependencies"
  | "ai-risks"
  | "recommendations"
  | "synthesis"
  | "gate";

export type Atelier2Phase = {
  id: Atelier2PhaseId;
  title: string;
  intent: string;
  sections: { id: Atelier2SectionId; title: string; livrableSection: number }[];
};

export const ATELIER2_PHASES: Atelier2Phase[] = [
  {
    id: "A",
    title: "Cadrage du besoin",
    intent: "Rappeler le vrai problème métier avant de qualifier les technos.",
    sections: [
      { id: "qualification", title: "Qualification du besoin", livrableSection: 1 },
    ],
  },
  {
    id: "B",
    title: "Décomposition opérationnelle",
    intent: "Analyser tâches, workflow, règles métier et niveaux de complexité.",
    sections: [
      { id: "tasks", title: "Analyse des tâches", livrableSection: 2 },
      { id: "workflows", title: "Analyse des workflows", livrableSection: 3 },
      { id: "rules", title: "Analyse des règles métier", livrableSection: 4 },
      { id: "complexity", title: "Niveaux de complexité", livrableSection: 5 },
    ],
  },
  {
    id: "C",
    title: "Qualification IA vs automatisation",
    intent: "La matrice : pour chaque tâche, choisir auto / IA / humain / hybride.",
    sections: [
      { id: "matrix", title: "Matrice IA vs automatisation", livrableSection: 6 },
      { id: "intelligence", title: "Besoins d'intelligence", livrableSection: 7 },
    ],
  },
  {
    id: "D",
    title: "Architecture cible",
    intent: "Cartographier les traitements, choisir les technos, esquisser l'archi.",
    sections: [
      { id: "treatments-map", title: "Cartographie des traitements", livrableSection: 8 },
      { id: "technologies", title: "Technologies candidates", livrableSection: 9 },
      { id: "target-architecture", title: "Architecture logique cible", livrableSection: 15 },
    ],
  },
  {
    id: "E",
    title: "Gouvernance, risques & gate",
    intent: "Validations humaines, exceptions, dépendances, risques, recos, synthèse.",
    sections: [
      { id: "human-validation", title: "Validations humaines", livrableSection: 10 },
      { id: "exceptions", title: "Exceptions", livrableSection: 11 },
      { id: "dependencies", title: "Dépendances", livrableSection: 12 },
      { id: "ai-risks", title: "Risques IA", livrableSection: 13 },
      { id: "recommendations", title: "Recommandations technologiques", livrableSection: 14 },
      { id: "synthesis", title: "Synthèse finale", livrableSection: 16 },
      { id: "gate", title: "Gate atelier 3", livrableSection: 0 },
    ],
  },
];

export function findA2Section(id: Atelier2SectionId):
  | { phase: Atelier2Phase; section: Atelier2Phase["sections"][number] }
  | undefined {
  for (const phase of ATELIER2_PHASES) {
    const section = phase.sections.find((s) => s.id === id);
    if (section) return { phase, section };
  }
  return undefined;
}

export function allA2Sections(): Atelier2Phase["sections"] {
  return ATELIER2_PHASES.flatMap((p) => p.sections);
}
