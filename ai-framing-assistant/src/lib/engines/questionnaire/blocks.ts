// Questionnaire engine — declarative blocks + dynamic flow rules.
//
// Reference: QUESTIONNAIRE_ENGINE.md and BUSINESS_LOGIC.md §619-859.
// The wizard today renders static forms. This declarative model lets us
// (1) generate the static forms from the same source of truth, and
// (2) later evolve into a fully conversational, conditional questionnaire
//     without rewriting the validation / persistence layer.

import type { UserRole } from "@/types";

export type QuestionType =
  | "text"          // single-line text
  | "longtext"      // textarea
  | "lines"         // multi-line list → string[]
  | "boolean"       // checkbox
  | "single-choice" // <select> from a fixed list
  | "scale-1-5";    // 1..5 risk axis

export type QuestionnaireQuestion = {
  id: string;             // unique within block; persisted field name
  prompt: string;         // the question, in user language
  helper?: string;        // short hint, displayed under the field
  type: QuestionType;
  required?: boolean;
  options?: { value: string; label: string }[]; // for single-choice
  // Conditional visibility: question is shown only when all conditions match.
  // Conditions reference question ids from any previously-filled block.
  showIf?: QuestionCondition[];
  // Surface for AI assistance: which capability would help here.
  aiAssist?: "REFORMULATE" | "CHALLENGE" | "SUGGEST_KPIS" | "DETECT_RISKS";
};

export type QuestionCondition = {
  questionId: string;
  equals: string | boolean | number;
};

export type QuestionnaireBlock = {
  id: string;
  title: string;
  intent: string;       // why this block exists, surfaced as a sub-title
  owners: UserRole[];   // which roles typically own the answers
  questions: QuestionnaireQuestion[];
};

// -------------------------------------------------------------
// Block library — keeps the wizard, the cartography and the eventual
// conversational assistant in sync.
// -------------------------------------------------------------

export const QUESTIONNAIRE_BLOCKS: QuestionnaireBlock[] = [
  {
    id: "business-need",
    title: "Besoin métier",
    intent:
      "Reformuler la demande en problème métier réel, identifier irritants et valeur.",
    owners: ["BUSINESS", "PROJECT_MANAGER"],
    questions: [
      {
        id: "reformulatedNeed",
        prompt: "Quel est le vrai problème métier à résoudre ?",
        helper:
          "Reformulez sans technologie. Évitez 'nous voulons de l'IA', décrivez l'irritant.",
        type: "longtext",
        required: true,
        aiAssist: "REFORMULATE",
      },
      {
        id: "painPoints",
        prompt: "Quels sont les irritants observés aujourd'hui ?",
        helper: "Une ligne par irritant.",
        type: "lines",
        aiAssist: "CHALLENGE",
      },
      {
        id: "expectedValue",
        prompt: "Quelle valeur métier est attendue ?",
        type: "longtext",
      },
      {
        id: "usersImpacted",
        prompt: "Qui sont les utilisateurs concernés ?",
        type: "text",
      },
      {
        id: "currentKpis",
        prompt: "Quels KPIs sont aujourd'hui impactés ?",
        helper: "Format libre, une ligne par KPI (ex. : 'Temps moyen de traitement : 12min').",
        type: "lines",
        aiAssist: "SUGGEST_KPIS",
      },
      {
        id: "expectedOutcome",
        prompt: "Quel résultat est attendu in fine ?",
        type: "longtext",
      },
    ],
  },
  {
    id: "ai-analysis",
    title: "IA ou pas IA",
    intent:
      "Distinguer automatisation, règle, ML, LLM, RAG, agent ou solution classique.",
    owners: ["PROJECT_MANAGER", "IT", "DATA"],
    questions: [
      {
        id: "automationRelevant",
        prompt: "Le besoin peut-il être traité par une automatisation simple ?",
        type: "boolean",
      },
      {
        id: "ruleEngineRelevant",
        prompt: "Les règles sont-elles connues et stables (moteur de règles) ?",
        type: "boolean",
      },
      {
        id: "mlRelevant",
        prompt: "Y a-t-il un besoin de classification / prédiction (ML) ?",
        type: "boolean",
      },
      {
        id: "llmRelevant",
        prompt: "Le besoin nécessite-t-il de comprendre / générer du langage (LLM) ?",
        type: "boolean",
      },
      {
        id: "ragRelevant",
        prompt: "Les réponses doivent-elles s'appuyer sur des documents internes (RAG) ?",
        type: "boolean",
      },
      {
        id: "agentRelevant",
        prompt: "Le besoin nécessite-t-il plusieurs actions enchaînées (agent IA) ?",
        type: "boolean",
      },
      {
        id: "hybridRelevant",
        prompt: "Un workflow hybride (humain + IA) est-il envisagé ?",
        type: "boolean",
      },
      {
        id: "classicRelevant",
        prompt: "Une solution classique sans IA suffirait-elle ?",
        type: "boolean",
      },
      {
        id: "recommendedApproach",
        prompt: "Approche recommandée à ce stade ?",
        type: "single-choice",
        options: [
          { value: "AUTOMATION", label: "Automatisation simple" },
          { value: "RULE", label: "Règle métier" },
          { value: "ML", label: "Machine Learning" },
          { value: "LLM", label: "LLM" },
          { value: "RAG", label: "RAG" },
          { value: "AGENT", label: "Agent IA" },
          { value: "HYBRID", label: "Workflow hybride" },
          { value: "CLASSIC", label: "Solution classique non IA" },
        ],
      },
      {
        id: "justification",
        prompt: "Justifier le choix d'approche.",
        type: "longtext",
      },
    ],
  },
  {
    id: "data",
    title: "Analyse data",
    intent: "Cartographier sources, qualité, accessibilité et sensibilité.",
    owners: ["DATA", "IT", "GOVERNANCE"],
    questions: [
      {
        id: "dataSources",
        prompt: "Quelles sources de données sont nécessaires ?",
        helper: "Une ligne par source.",
        type: "lines",
      },
      { id: "structured", prompt: "Données structurées ?", type: "boolean" },
      { id: "unstructured", prompt: "Données non structurées ?", type: "boolean" },
      { id: "history", prompt: "Historique disponible ?", type: "text" },
      { id: "quality", prompt: "Qualité des données ?", type: "text" },
      { id: "availability", prompt: "Accessibilité et fréquence ?", type: "text" },
      { id: "silos", prompt: "Silos / fragmentation ?", type: "text" },
      { id: "personalData", prompt: "Données personnelles ?", type: "boolean" },
      {
        id: "sensitivity",
        prompt: "Niveau de sensibilité",
        type: "single-choice",
        options: [
          { value: "NONE", label: "Aucune" },
          { value: "INTERNAL", label: "Interne" },
          { value: "CONFIDENTIAL", label: "Confidentielle" },
          { value: "SENSITIVE", label: "Sensible" },
        ],
      },
      {
        id: "rgpdConstraints",
        prompt: "Contraintes RGPD identifiées",
        type: "longtext",
        showIf: [{ questionId: "personalData", equals: true }],
        aiAssist: "DETECT_RISKS",
      },
    ],
  },
  {
    id: "architecture",
    title: "Architecture & workflow",
    intent: "Applications, APIs, workflow cible, intégration SI, supervision.",
    owners: ["IT"],
    questions: [
      { id: "applications", prompt: "Applications concernées", type: "lines" },
      { id: "apis", prompt: "APIs disponibles", type: "lines" },
      { id: "workflowCurrent", prompt: "Workflow actuel", type: "longtext" },
      { id: "workflowTarget", prompt: "Workflow cible", type: "longtext" },
      { id: "siIntegration", prompt: "Intégration SI prévue", type: "text" },
      {
        id: "humanValidation",
        prompt: "Une validation humaine est-elle prévue ?",
        type: "boolean",
      },
      { id: "traceability", prompt: "Traçabilité / audit", type: "text" },
      { id: "existingTools", prompt: "Outils existants à réutiliser", type: "lines" },
    ],
  },
  {
    id: "risks",
    title: "Risques & gouvernance",
    intent: "Évaluer RGPD, biais, hallucinations, sécurité, adoption.",
    owners: ["GOVERNANCE", "DATA", "IT"],
    questions: [
      { id: "rgpdRisk", prompt: "Risque RGPD (1-5)", type: "scale-1-5" },
      { id: "sensitiveDataRisk", prompt: "Risque données sensibles", type: "scale-1-5" },
      { id: "hallucinationRisk", prompt: "Risque d'hallucinations", type: "scale-1-5" },
      { id: "biasRisk", prompt: "Risque de biais", type: "scale-1-5" },
      { id: "classificationRisk", prompt: "Risque d'erreur de classification", type: "scale-1-5" },
      { id: "autoDecisionRisk", prompt: "Risque de décision automatisée", type: "scale-1-5" },
      { id: "securityRisk", prompt: "Risque sécurité", type: "scale-1-5" },
      { id: "vendorLockRisk", prompt: "Risque dépendance fournisseur", type: "scale-1-5" },
      { id: "adoptionRisk", prompt: "Risque d'adoption", type: "scale-1-5" },
      { id: "supervisionRisk", prompt: "Risque de supervision insuffisante", type: "scale-1-5" },
      {
        id: "overallRisk",
        prompt: "Niveau de risque global",
        type: "single-choice",
        options: [
          { value: "LOW", label: "Faible" },
          { value: "MEDIUM", label: "Modéré" },
          { value: "HIGH", label: "Élevé" },
          { value: "CRITICAL", label: "Critique" },
        ],
      },
      { id: "mitigationPlan", prompt: "Plan de mitigation", type: "longtext" },
    ],
  },
];

export function getBlock(id: string): QuestionnaireBlock | undefined {
  return QUESTIONNAIRE_BLOCKS.find((b) => b.id === id);
}
