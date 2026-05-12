// Dynamic flow rules — once the wizard becomes conversational, this module
// chooses which question to ask next based on accumulated answers.
//
// Reference: BUSINESS_LOGIC.md §139 ("Le système devra poser des questions
// dynamiques et adapter les questions suivantes selon les réponses").
//
// The flow is intentionally simple: a list of typed rules that emit
// "next-question" hints. The wizard or the conversational assistant can
// evaluate them to decide the next prompt to surface.

import type {
  QuestionnaireBlock,
  QuestionnaireQuestion,
} from "./blocks";
import { QUESTIONNAIRE_BLOCKS } from "./blocks";

export type AnswerMap = Record<string, unknown>;

export type FlowHint = {
  type: "ASK" | "SKIP" | "REFORMULATE" | "DEEP_DIVE";
  questionId: string;
  reason: string;
};

// Detect a "solution-oriented" request — same patterns as the maturity
// engine but applied to the live questionnaire state (before persistence).
const SOLUTION_PHRASES: RegExp[] = [
  /\b(nous|on)\s+(voulons|veut|souhaitons|souhaite)\s+(de\s+l[' ]?)?(ia|intelligence artificielle)\b/i,
  /\bchatbot\b/i,
  /\bagent\s+ia\b/i,
];

export function nextHints(answers: AnswerMap): FlowHint[] {
  const hints: FlowHint[] = [];

  const initial = stringOr(answers["initialRequest"]) || stringOr(answers["reformulatedNeed"]);
  if (initial && SOLUTION_PHRASES.some((re) => re.test(initial))) {
    hints.push({
      type: "REFORMULATE",
      questionId: "reformulatedNeed",
      reason:
        'Formulation orientée solution détectée — reformuler en termes de problème métier.',
    });
  }

  // Personal data → always deep-dive RGPD constraints.
  if (answers["personalData"] === true) {
    hints.push({
      type: "DEEP_DIVE",
      questionId: "rgpdConstraints",
      reason: "Présence de données personnelles : préciser les contraintes RGPD.",
    });
  }

  // No data sources entered yet but ML/LLM relevant → ask about data first.
  const sources = answers["dataSources"];
  const noSources = !sources || (Array.isArray(sources) && sources.length === 0);
  if (noSources && (answers["mlRelevant"] === true || answers["ragRelevant"] === true)) {
    hints.push({
      type: "ASK",
      questionId: "dataSources",
      reason: "Une approche ML ou RAG suppose des sources de données identifiées.",
    });
  }

  // Auto-decision risk high → require supervision.
  const autoRisk = Number(answers["autoDecisionRisk"]) || 0;
  if (autoRisk >= 4 && answers["humanValidation"] !== true) {
    hints.push({
      type: "ASK",
      questionId: "humanValidation",
      reason:
        "Risque de décision automatisée élevé : confirmer une supervision humaine.",
    });
  }

  return hints;
}

export function visibleQuestions(
  block: QuestionnaireBlock,
  answers: AnswerMap,
): QuestionnaireQuestion[] {
  return block.questions.filter((q) => isVisible(q, answers));
}

function isVisible(
  q: QuestionnaireQuestion,
  answers: AnswerMap,
): boolean {
  if (!q.showIf || q.showIf.length === 0) return true;
  return q.showIf.every((c) => answers[c.questionId] === c.equals);
}

export { QUESTIONNAIRE_BLOCKS };

function stringOr(value: unknown): string {
  return typeof value === "string" ? value : "";
}
