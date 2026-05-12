import {
  Brain,
  ClipboardList,
  Database,
  FileOutput,
  GitBranch,
  Map,
  Scale,
  ShieldAlert,
  Target,
  type LucideIcon,
} from "lucide-react";

// Two phases:
//   - "questionnaire" : the 5 wizard input steps (drives the save action chain).
//   - "engine"        : the 3 engine views (scoring, decision, cartography),
//                       rendered as separate pages but surfaced in the stepper.

export type QuestionnaireStepId =
  | "business-need"
  | "ai-analysis"
  | "data"
  | "architecture"
  | "risks";

export type EngineStepId = "scoring" | "decision" | "cartography" | "deliverables";

export type WizardStepId = QuestionnaireStepId | EngineStepId;

export type WizardStep = {
  id: WizardStepId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  phase: "questionnaire" | "engine";
};

export const QUESTIONNAIRE_STEPS: WizardStep[] = [
  {
    id: "business-need",
    label: "Besoin métier",
    shortLabel: "Besoin",
    description: "Reformulation, irritants, KPIs actuels et résultat attendu.",
    icon: ClipboardList,
    phase: "questionnaire",
  },
  {
    id: "ai-analysis",
    label: "IA ou pas IA",
    shortLabel: "IA",
    description: "Pertinence des approches : automatisation, ML, LLM, RAG, agent…",
    icon: Brain,
    phase: "questionnaire",
  },
  {
    id: "data",
    label: "Données",
    shortLabel: "Data",
    description: "Sources, qualité, accessibilité, sensibilité, contraintes RGPD.",
    icon: Database,
    phase: "questionnaire",
  },
  {
    id: "architecture",
    label: "Architecture",
    shortLabel: "Archi",
    description: "Applications, APIs, workflow cible, intégration SI, supervision.",
    icon: GitBranch,
    phase: "questionnaire",
  },
  {
    id: "risks",
    label: "Risques",
    shortLabel: "Risques",
    description: "RGPD, biais, hallucinations, sécurité, adoption, dépendance.",
    icon: ShieldAlert,
    phase: "questionnaire",
  },
];

export const ENGINE_STEPS: WizardStep[] = [
  {
    id: "scoring",
    label: "Scoring",
    shortLabel: "Scoring",
    description: "6 axes auto-calculés depuis le questionnaire.",
    icon: Scale,
    phase: "engine",
  },
  {
    id: "decision",
    label: "Décision",
    shortLabel: "Décision",
    description: "Recommandation argumentée, justification structurée, plan d'action.",
    icon: Target,
    phase: "engine",
  },
  {
    id: "cartography",
    label: "Cartographie",
    shortLabel: "Cartog.",
    description: "Six vues systémiques : métier, workflow, data, tech, risques, gouvernance.",
    icon: Map,
    phase: "engine",
  },
  {
    id: "deliverables",
    label: "Livrables",
    shortLabel: "Livrables",
    description: "Note de cadrage, fiche de décision, analyses, recommandation, plan d'action.",
    icon: FileOutput,
    phase: "engine",
  },
];

export const WIZARD_STEPS: WizardStep[] = [
  ...QUESTIONNAIRE_STEPS,
  ...ENGINE_STEPS,
];

export function getStep(id: string): WizardStep | undefined {
  return WIZARD_STEPS.find((s) => s.id === id);
}

// Step traversal is scoped to the questionnaire phase: the save actions in
// the wizard cycle through QUESTIONNAIRE_STEPS only and hand off to the
// engine pages (scoring → decision → cartography) once the last input step
// is saved.
export function getStepIndex(id: WizardStepId): number {
  return QUESTIONNAIRE_STEPS.findIndex((s) => s.id === id);
}

export function getNextStep(id: WizardStepId): WizardStep | undefined {
  const idx = getStepIndex(id);
  return idx >= 0 ? QUESTIONNAIRE_STEPS[idx + 1] : undefined;
}

export function getPrevStep(id: WizardStepId): WizardStep | undefined {
  const idx = getStepIndex(id);
  return idx > 0 ? QUESTIONNAIRE_STEPS[idx - 1] : undefined;
}

// Engine steps live at the project root (e.g. /projects/[id]/scoring), not
// under /wizard, so the URL helper accounts for the phase.
export function wizardStepUrl(projectId: string, stepId: WizardStepId): string {
  const step = getStep(stepId);
  if (step?.phase === "engine") {
    return `/projects/${projectId}/${stepId}`;
  }
  return `/projects/${projectId}/wizard/${stepId}`;
}
