import {
  QUESTIONNAIRE_STEPS,
  WIZARD_STEPS,
  type WizardStepId,
} from "./steps";

// Maps each wizard step to the existence of its DB record.
// A step is "completed" once any related row exists for the project.
// Engine steps (scoring/decision/cartography) are completed when the project
// has a persisted Scoring row / a final decision (cartography is computed
// on-demand, so it follows scoring's progress).
export type WizardProgress = Record<WizardStepId, boolean>;

export function computeProgress(input: {
  businessNeed: boolean;
  aiAnalysis: boolean;
  dataAssessment: boolean;
  architectureAssessment: boolean;
  riskAssessment: boolean;
  scoring?: boolean;
  decision?: boolean;
  deliverables?: boolean;
}): WizardProgress {
  return {
    "business-need": input.businessNeed,
    "ai-analysis": input.aiAnalysis,
    data: input.dataAssessment,
    architecture: input.architectureAssessment,
    risks: input.riskAssessment,
    scoring: !!input.scoring,
    decision: !!input.decision,
    cartography: !!input.scoring, // available as soon as scoring exists
    deliverables: !!input.deliverables,
  };
}

export function progressRatio(progress: WizardProgress): number {
  // Ratio uses the questionnaire steps only, so 100% means "ready for
  // scoring", not "the engine pages have been visited".
  const completed = QUESTIONNAIRE_STEPS.filter((s) => progress[s.id]).length;
  return completed / QUESTIONNAIRE_STEPS.length;
}

// Re-export for callers that want the global step list.
export { WIZARD_STEPS };

// Helpers for JSON-encoded string-array fields stored in SQLite.
export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function linesToJsonArray(raw: string): string {
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return JSON.stringify(items);
}

export function jsonArrayToLines(raw: string | null | undefined): string {
  return parseJsonArray(raw).join("\n");
}
