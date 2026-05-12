// Shared domain types for the business engines.
//
// The engines layer is pure TypeScript: no React, no Prisma, no I/O.
// It receives plain snapshots (ProjectSnapshot) and returns plain results
// (ScoringResult, DecisionResult, Cartography, ...) so it can be unit-tested,
// reused on the server, in workers, or embedded in a CLI.

import type {
  AIApproach,
  Maturity,
  OverallRisk,
  Sensitivity,
} from "@/types";

// -------------------------------------------------------------
// Project snapshot — the engines' single input shape.
//
// Maps loosely to the Prisma models but normalised: JSON-encoded arrays
// are already parsed, optional fields are nullable, no Date types so it
// can be serialised. Built by buildProjectSnapshot() (db/snapshot.ts).
// -------------------------------------------------------------

export type ProjectSnapshot = {
  id: string;
  name: string;
  direction: string | null;
  sponsor: string | null;
  description: string | null;
  maturity: Maturity | null;

  businessNeed: BusinessNeedSnapshot | null;
  aiAnalysis: AIAnalysisSnapshot | null;
  dataAssessment: DataAssessmentSnapshot | null;
  architecture: ArchitectureSnapshot | null;
  riskAssessment: RiskAssessmentSnapshot | null;
};

export type BusinessNeedSnapshot = {
  initialRequest: string | null;
  reformulatedNeed: string | null;
  painPoints: string[];
  expectedValue: string | null;
  usersImpacted: string | null;
  currentKpis: string[];
  expectedOutcome: string | null;
};

export type AIAnalysisSnapshot = {
  automationRelevant: boolean;
  ruleEngineRelevant: boolean;
  mlRelevant: boolean;
  llmRelevant: boolean;
  ragRelevant: boolean;
  agentRelevant: boolean;
  hybridRelevant: boolean;
  classicRelevant: boolean;
  recommendedApproach: AIApproach | null;
  justification: string | null;
};

export type DataAssessmentSnapshot = {
  dataSources: string[];
  structured: boolean;
  unstructured: boolean;
  history: string | null;
  quality: string | null;
  availability: string | null;
  silos: string | null;
  personalData: boolean;
  sensitivity: Sensitivity | null;
  rgpdConstraints: string | null;
};

export type ArchitectureSnapshot = {
  applications: string[];
  apis: string[];
  workflowCurrent: string | null;
  workflowTarget: string | null;
  siIntegration: string | null;
  humanValidation: boolean;
  traceability: string | null;
  existingTools: string[];
};

export type RiskAssessmentSnapshot = {
  // Each axis is 1..5, null when not yet rated.
  rgpdRisk: number | null;
  sensitiveDataRisk: number | null;
  hallucinationRisk: number | null;
  biasRisk: number | null;
  classificationRisk: number | null;
  autoDecisionRisk: number | null;
  securityRisk: number | null;
  vendorLockRisk: number | null;
  adoptionRisk: number | null;
  supervisionRisk: number | null;
  overallRisk: OverallRisk | null;
  mitigationPlan: string | null;
};

// -------------------------------------------------------------
// Engine vocabulary
// -------------------------------------------------------------

// Confidence: how strongly the engine trusts a derived value given the
// completeness of the input. Used to flag "score computed from very few
// answers" vs "score computed from a full questionnaire".
export type Confidence = "LOW" | "MEDIUM" | "HIGH";

// Signal: structured observation produced by the engines. Surfaces in
// the UI as cards and aggregates into cartographies (risk/maturity layers).
export type SignalSeverity = "INFO" | "WARNING" | "CRITICAL";
export type SignalCategory =
  | "MATURITY"
  | "BUSINESS"
  | "DATA"
  | "AI_FIT"
  | "RISK"
  | "GOVERNANCE"
  | "FEASIBILITY"
  | "ADOPTION";

export type Signal = {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  title: string;
  detail: string;
  // Optional source field, helps cartography back-link signals to nodes.
  sourceField?: string;
};

// Each engine returns the signals it produced + the artefacts it derived.
// Aggregated by the orchestrator (lib/engines/index.ts) into a single
// EngineReport stored in memory per request.
