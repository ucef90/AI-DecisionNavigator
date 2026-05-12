// Cartography insights — typed sections, one shape per layer.
//
// The generic Graph (Node/Edge) model from types.ts powers the raw engine
// reasoning. For UI rendering we need *layout-specific* shapes that mirror
// each cartography's semantic structure — the way the reference visuals do
// (hub-and-spoke for actors, layered architecture for tech, two-lane
// pipeline for workflow, etc).
//
// Each insights builder is pure and reads from a ProjectSnapshot + the
// existing scoring/decision results so the templates can render decision
// badges in-line (e.g. recommended approach in the technology layer).

import type {
  AIApproach,
  Decision,
  OverallRisk,
  Sensitivity,
} from "@/types";
import type { DecisionResult } from "@/lib/engines/decision";
import type { ScoringResult } from "@/lib/engines/scoring";
import type { ProjectSnapshot, Signal } from "@/lib/engines/types";

// =============================================================
// 1. BUSINESS — vision globale du besoin
// =============================================================
export type BusinessInsights = {
  reformulatedNeed: string | null;
  initialRequest: string | null;
  solutionOriented: boolean; // detected by maturity engine
  objectives: string[]; // bullets describing what the project achieves
  expectedValue: string[]; // bullets describing the value
  kpis: string[]; // current KPIs (one bullet each)
  impactedUsers: string[]; // user groups
  painPoints: string[];
};

// =============================================================
// 2. WORKFLOW — actuel vs cible
// =============================================================
export type WorkflowStepKind = "MANUAL" | "AI" | "HUMAN_VALIDATION" | "AUTO";
export type WorkflowStep = {
  id: string;
  label: string;
  kind: WorkflowStepKind;
};
export type WorkflowInsights = {
  current: WorkflowStep[];
  target: WorkflowStep[];
  hasFriction: boolean; // current has manual steps
  hasHumanValidation: boolean;
  hasRag: boolean;
  approach: AIApproach | null;
};

// =============================================================
// 3. DATA — sources → hub → usages
// =============================================================
export type DataSourceKind = "EMAIL" | "DOC" | "CRM" | "DB" | "FILE" | "OTHER";
export type DataInsights = {
  sources: { label: string; kind: DataSourceKind; sensitivity: Sensitivity | null }[];
  usages: string[]; // what the platform produces
  types: { structured: boolean; semiStructured: boolean; unstructured: boolean };
  sensitivity: Sensitivity | null;
  personalData: boolean;
  rgpdConstraints: string | null;
  quality: string | null;
  availability: string | null;
  history: string | null;
};

// =============================================================
// 4. ACTORS — hub IA + rôles autour
//
// Surfaces "qui fait quoi" around the platform — mirrors the SPEC role list
// (BUSINESS / IT / DATA / GOVERNANCE / PROJECT_MANAGER) plus the end user.
// =============================================================
export type ActorTone = "USER" | "AGENT" | "MANAGER" | "GOVERNANCE" | "IT" | "SUPERVISOR";
export type Actor = {
  id: string;
  label: string;
  description: string;
  tone: ActorTone;
  responsibilities: string[];
};
export type ActorsInsights = {
  hubLabel: string; // typically the project name
  actors: Actor[];
};

// =============================================================
// 5. TECHNOLOGY — architecture cible en couches
// =============================================================
export type TechLayerKind = "INTERFACE" | "AI" | "INTEGRATION" | "EXTERNAL";
export type TechBlock = {
  id: string;
  label: string;
  detail?: string;
  active?: boolean; // emphasise blocks that match the recommended approach
};
export type TechnologyInsights = {
  interfaces: TechBlock[];
  aiBricks: TechBlock[]; // OCR / NLP / LLM / RAG / Agent…
  integration: TechBlock[]; // API Gateway, connecteurs SI, workflow engine…
  external: TechBlock[]; // Outlook, CRM, GED, ERP…
  governance: TechBlock[]; // IAM, chiffrement, logs, audit, monitoring
  recommendedApproach: AIApproach | null;
};

// =============================================================
// 6. RISK — catégories + stratégies de maîtrise
// =============================================================
export type RiskCategoryId =
  | "DATA"
  | "AI"
  | "REGULATORY"
  | "SECURITY"
  | "BUSINESS"
  | "OPERATIONAL";

export type RiskItem = {
  label: string;
  score: number | null; // 1..5 when known, null otherwise
};

export type RiskCategory = {
  id: RiskCategoryId;
  title: string;
  items: RiskItem[];
};

export type RiskInsights = {
  overall: OverallRisk | null;
  decision: Decision; // surfaced as a badge in the risk header
  categories: RiskCategory[];
  mitigations: string[]; // parsed from mitigationPlan
  signals: Signal[]; // pulled from the maturity engine
};

// -------------------------------------------------------------
// Aggregate insights — what the cartography page consumes.
// -------------------------------------------------------------
export type CartographyInsights = {
  business: BusinessInsights;
  workflow: WorkflowInsights;
  data: DataInsights;
  actors: ActorsInsights;
  technology: TechnologyInsights;
  risk: RiskInsights;
};

// =============================================================
// Builders
// =============================================================

export function buildInsights(
  snap: ProjectSnapshot,
  scoring: ScoringResult,
  decision: DecisionResult,
): CartographyInsights {
  return {
    business: buildBusinessInsights(snap, scoring),
    workflow: buildWorkflowInsights(snap, decision),
    data: buildDataInsights(snap),
    actors: buildActorsInsights(snap),
    technology: buildTechnologyInsights(snap, decision),
    risk: buildRiskInsights(snap, scoring, decision),
  };
}

// -------------------------------------------------------------
function buildBusinessInsights(
  snap: ProjectSnapshot,
  scoring: ScoringResult,
): BusinessInsights {
  const need = snap.businessNeed;
  const solutionOriented = scoring.signals.some(
    (s) => s.id === "biz.solution-oriented",
  );
  return {
    reformulatedNeed: need?.reformulatedNeed ?? null,
    initialRequest: need?.initialRequest ?? null,
    solutionOriented,
    objectives: deriveObjectives(snap),
    expectedValue: splitBullets(need?.expectedValue ?? "", 4),
    kpis: need?.currentKpis ?? [],
    impactedUsers: splitInline(need?.usersImpacted ?? ""),
    painPoints: need?.painPoints ?? [],
  };
}

function deriveObjectives(snap: ProjectSnapshot): string[] {
  const out: string[] = [];
  const need = snap.businessNeed;
  if (!need) return out;
  // Heuristic — try to surface the most actionable phrases from the value
  // and the expected outcome.
  if (need.expectedValue) {
    out.push(...splitBullets(need.expectedValue, 3));
  }
  if (need.expectedOutcome && out.length < 3) {
    out.push(...splitBullets(need.expectedOutcome, 3 - out.length));
  }
  return out.slice(0, 4);
}

// -------------------------------------------------------------
function buildWorkflowInsights(
  snap: ProjectSnapshot,
  decision: DecisionResult,
): WorkflowInsights {
  const arch = snap.architecture;
  const current = splitSteps(arch?.workflowCurrent ?? null).map((label, i) => ({
    id: `cur-${i}`,
    label,
    kind: "MANUAL" as WorkflowStepKind,
  }));

  const target: WorkflowStep[] = splitSteps(arch?.workflowTarget ?? null).map(
    (label, i) => {
      const kind = classifyTargetStep(label);
      return { id: `tgt-${i}`, label, kind };
    },
  );

  return {
    current,
    target,
    hasFriction: current.length > 0,
    hasHumanValidation: !!arch?.humanValidation,
    hasRag: !!snap.aiAnalysis?.ragRelevant,
    approach: decision.recommendedApproach,
  };
}

function classifyTargetStep(label: string): WorkflowStepKind {
  const l = label.toLowerCase();
  if (/(ia|ml|llm|rag|ocr|nlp|classification|extraction|gener|analyse).*/.test(l))
    return "AI";
  if (/(validation|valide|supervis|contrôle|controle|humain)/.test(l))
    return "HUMAN_VALIDATION";
  if (/(envoi|publication|dépôt|depot|enregistrement|notification)/.test(l))
    return "AUTO";
  return "MANUAL";
}

// -------------------------------------------------------------
function buildDataInsights(snap: ProjectSnapshot): DataInsights {
  const da = snap.dataAssessment;
  if (!da) {
    return {
      sources: [],
      usages: [],
      types: { structured: false, semiStructured: false, unstructured: false },
      sensitivity: null,
      personalData: false,
      rgpdConstraints: null,
      quality: null,
      availability: null,
      history: null,
    };
  }
  const sources = da.dataSources.map((label, i) => ({
    label,
    kind: classifySource(label),
    sensitivity: da.sensitivity,
    // keep i to deduplicate ids if needed in the future
    _idx: i,
  }));
  // The "usages" produced by the platform are derived from the AI bricks
  // selected — surfaced as outputs in the cartography.
  const usages = deriveDataUsages(snap);

  return {
    sources: sources.map(({ label, kind, sensitivity }) => ({
      label,
      kind,
      sensitivity,
    })),
    usages,
    types: {
      structured: da.structured,
      // We don't ship a semi-structured flag yet; infer from presence of
      // both structured & unstructured to keep UI honest.
      semiStructured: da.structured && da.unstructured,
      unstructured: da.unstructured,
    },
    sensitivity: da.sensitivity,
    personalData: da.personalData,
    rgpdConstraints: da.rgpdConstraints,
    quality: da.quality,
    availability: da.availability,
    history: da.history,
  };
}

function classifySource(label: string): DataSourceKind {
  const l = label.toLowerCase();
  if (/(mail|email|outlook|exchange)/.test(l)) return "EMAIL";
  if (/(pdf|doc|sharepoint|ged|fichier|scan|image)/.test(l)) return "DOC";
  if (/(crm|si métier|si metier|service desk|ticket)/.test(l)) return "CRM";
  if (/(base|db|sql|postgres|oracle|erp)/.test(l)) return "DB";
  if (/(historique|csv|fichier)/.test(l)) return "FILE";
  return "OTHER";
}

function deriveDataUsages(snap: ProjectSnapshot): string[] {
  const ai = snap.aiAnalysis;
  if (!ai) return [];
  const out: string[] = [];
  if (ai.mlRelevant) out.push("Classification des demandes");
  if (ai.llmRelevant) out.push("Extraction & génération de contenu");
  if (ai.ragRelevant) out.push("Recherche documentaire ancrée");
  if (ai.agentRelevant) out.push("Orchestration multi-étapes");
  if (ai.automationRelevant) out.push("Automatisation des actions standards");
  out.push("Analyse & recommandation");
  out.push("Reporting & pilotage");
  return Array.from(new Set(out)).slice(0, 6);
}

// -------------------------------------------------------------
function buildActorsInsights(snap: ProjectSnapshot): ActorsInsights {
  const arch = snap.architecture;
  const da = snap.dataAssessment;

  const actors: Actor[] = [
    {
      id: "user",
      label: "Usager",
      description: "Citoyens, clients, demandeurs finaux",
      tone: "USER",
      responsibilities: ["Émet une demande", "Reçoit la réponse"],
    },
    {
      id: "agent",
      label: "Agent métier",
      description: "Traite les cas, valide les sorties IA",
      tone: "AGENT",
      responsibilities: [
        "Traite les cas complexes",
        "Valide les réponses IA",
        "Supervise les exceptions",
      ],
    },
    {
      id: "manager",
      label: "Manager / Responsable",
      description: "Pilote l'activité",
      tone: "MANAGER",
      responsibilities: [
        "Pilote l'activité",
        "Valide les indicateurs",
        "Arbitre les décisions",
      ],
    },
    {
      id: "governance",
      label: "Gouvernance / DPO",
      description: "Définit les règles, contrôle la conformité",
      tone: "GOVERNANCE",
      responsibilities: [
        "Définit les règles",
        "Contrôle la conformité",
        "Suit les risques",
      ],
    },
    {
      id: "it",
      label: "DSI / IT",
      description: "Intègre, sécurise, maintient",
      tone: "IT",
      responsibilities: [
        "Intègre les systèmes",
        "Gère les accès",
        "Assure la sécurité",
      ],
    },
  ];

  if (arch?.humanValidation || da?.personalData) {
    actors.push({
      id: "supervisor",
      label: "Superviseur humain",
      description: "Garantit la qualité IA",
      tone: "SUPERVISOR",
      responsibilities: [
        "Contrôle les sorties IA",
        "Valide les exceptions",
        "Garantit la qualité",
      ],
    });
  }

  return {
    hubLabel: "Plateforme IA",
    actors,
  };
}

// -------------------------------------------------------------
function buildTechnologyInsights(
  snap: ProjectSnapshot,
  decision: DecisionResult,
): TechnologyInsights {
  const ai = snap.aiAnalysis;
  const arch = snap.architecture;
  const approach = decision.recommendedApproach ?? ai?.recommendedApproach ?? null;

  const interfaces: TechBlock[] = [
    { id: "ui-agent", label: "Interface Agent", detail: "Web" },
    { id: "ui-admin", label: "Interface Admin", detail: "Web" },
    { id: "ui-dashboard", label: "Tableaux de bord", detail: "Reporting" },
  ];

  const aiBricks: TechBlock[] = [
    {
      id: "ocr",
      label: "OCR",
      detail: "Extraction",
      active:
        (snap.dataAssessment?.unstructured ?? false) &&
        (approach === "LLM" || approach === "HYBRID" || approach === "RAG"),
    },
    {
      id: "ml",
      label: "ML",
      detail: "Classification",
      active: !!ai?.mlRelevant,
    },
    {
      id: "llm",
      label: "LLM",
      detail: "Génération",
      active: !!ai?.llmRelevant,
    },
    {
      id: "rag",
      label: "RAG",
      detail: "Recherche",
      active: !!ai?.ragRelevant,
    },
    {
      id: "agent",
      label: "Agent IA",
      detail: "Orchestration",
      active: !!ai?.agentRelevant,
    },
  ];

  const integration: TechBlock[] = [
    { id: "api-gw", label: "API Gateway" },
    { id: "connectors", label: "Connecteurs SI" },
    { id: "workflow", label: "Workflow Engine" },
    { id: "services", label: "Services métier" },
  ];

  const external: TechBlock[] = (arch?.applications ?? []).slice(0, 6).map(
    (app, i) => ({ id: `app-${i}`, label: app }),
  );
  if (external.length === 0) {
    external.push(
      { id: "ext-outlook", label: "Outlook / Email" },
      { id: "ext-crm", label: "CRM / SI Métier" },
      { id: "ext-ged", label: "GED / SharePoint" },
      { id: "ext-erp", label: "ERP" },
    );
  }

  const governance: TechBlock[] = [
    { id: "iam", label: "Gestion des accès (IAM)" },
    { id: "crypto", label: "Chiffrement" },
    { id: "logs", label: "Logs & traçabilité" },
    { id: "audit", label: "Audit & conformité" },
    { id: "monitoring", label: "Monitoring" },
  ];

  return {
    interfaces,
    aiBricks,
    integration,
    external,
    governance,
    recommendedApproach: approach,
  };
}

// -------------------------------------------------------------
function buildRiskInsights(
  snap: ProjectSnapshot,
  scoring: ScoringResult,
  decision: DecisionResult,
): RiskInsights {
  const r = snap.riskAssessment;

  const categories: RiskCategory[] = [
    {
      id: "DATA",
      title: "Risques données",
      items: [
        { label: "Données sensibles", score: r?.sensitiveDataRisk ?? null },
        { label: "Qualité insuffisante", score: scoreFromText(snap.dataAssessment?.quality) },
        { label: "Données incomplètes", score: r?.classificationRisk ?? null },
        { label: "Mauvaises sources", score: snap.dataAssessment?.dataSources.length === 0 ? 5 : null },
      ],
    },
    {
      id: "AI",
      title: "Risques IA",
      items: [
        { label: "Hallucinations", score: r?.hallucinationRisk ?? null },
        { label: "Mauvaises prédictions", score: r?.classificationRisk ?? null },
        { label: "Biais algorithmiques", score: r?.biasRisk ?? null },
        { label: "Manque de fiabilité", score: r?.supervisionRisk ?? null },
      ],
    },
    {
      id: "REGULATORY",
      title: "Risques réglementaires",
      items: [
        { label: "RGPD", score: r?.rgpdRisk ?? null },
        { label: "Confidentialité", score: r?.sensitiveDataRisk ?? null },
        { label: "Conservation", score: snap.dataAssessment?.rgpdConstraints ? null : 3 },
        { label: "Décision automatisée", score: r?.autoDecisionRisk ?? null },
      ],
    },
    {
      id: "SECURITY",
      title: "Risques sécurité",
      items: [
        { label: "Fuites de données", score: r?.securityRisk ?? null },
        { label: "Accès non autorisés", score: r?.securityRisk ?? null },
        { label: "Cybersécurité", score: r?.securityRisk ?? null },
        { label: "Attaques externes", score: r?.securityRisk ?? null },
      ],
    },
    {
      id: "BUSINESS",
      title: "Risques métier",
      items: [
        { label: "Adoption", score: r?.adoptionRisk ?? null },
        { label: "Changement processus", score: r?.adoptionRisk ?? null },
        { label: "Résistance au changement", score: r?.adoptionRisk ?? null },
        { label: "Perte de compétences", score: r?.adoptionRisk ?? null },
      ],
    },
    {
      id: "OPERATIONAL",
      title: "Risques opérationnels",
      items: [
        { label: "Disponibilité système", score: r?.vendorLockRisk ?? null },
        { label: "Pannes techniques", score: r?.vendorLockRisk ?? null },
        { label: "Dépendances externes", score: r?.vendorLockRisk ?? null },
        { label: "Performance", score: null },
      ],
    },
  ];

  const mitigations = splitBullets(r?.mitigationPlan ?? "", 8);

  return {
    overall: r?.overallRisk ?? null,
    decision: decision.decision,
    categories,
    mitigations,
    signals: scoring.signals.filter(
      (s) => s.category === "RISK" || s.category === "GOVERNANCE",
    ),
  };
}

function scoreFromText(value: string | null | undefined): number | null {
  if (!value) return null;
  if (/\b(faible|insuffisant|mauvaise|fragmenté)\b/i.test(value)) return 3;
  if (/\b(bonne|excellente|élevée|maîtrisée|fiable)\b/i.test(value)) return 1;
  return 2;
}

// -------------------------------------------------------------
// Shared helpers
// -------------------------------------------------------------

function splitBullets(text: string, max: number): string[] {
  if (!text) return [];
  return text
    .split(/[\n;]|(?:^|\.)\s+(?=[A-Z])/g)
    .map((s) => s.trim().replace(/^[-•]\s*/, ""))
    .filter((s) => s.length > 4)
    .slice(0, max);
}

function splitInline(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function splitSteps(s: string | null): string[] {
  if (!s) return [];
  const cleaned = s
    .replace(/(\d+[.)])\s*/g, "\n")
    .replace(/\s*→\s*/g, "\n")
    .replace(/\s*-\s+/g, "\n")
    .replace(/\s+puis\s+/gi, "\n");
  return cleaned
    .split(/\n+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .slice(0, 10);
}
