import { z } from "zod";

import {
  AI_APPROACHES,
  OVERALL_RISKS,
  SENSITIVITY_LEVELS,
} from "@/types";

const optionalText = z.string().trim().max(4000).optional().or(z.literal(""));
const longText = z.string().trim().max(8000).optional().or(z.literal(""));

export const businessNeedSchema = z.object({
  reformulatedNeed: longText,
  painPoints: longText,
  expectedValue: optionalText,
  usersImpacted: optionalText,
  currentKpis: longText,
  expectedOutcome: longText,
});

export const aiAnalysisSchema = z.object({
  automationRelevant: z.coerce.boolean().optional(),
  ruleEngineRelevant: z.coerce.boolean().optional(),
  mlRelevant: z.coerce.boolean().optional(),
  llmRelevant: z.coerce.boolean().optional(),
  ragRelevant: z.coerce.boolean().optional(),
  agentRelevant: z.coerce.boolean().optional(),
  hybridRelevant: z.coerce.boolean().optional(),
  classicRelevant: z.coerce.boolean().optional(),
  recommendedApproach: z.enum(AI_APPROACHES).optional().or(z.literal("")),
  justification: longText,
});

export const dataAssessmentSchema = z.object({
  dataSources: longText,
  structured: z.coerce.boolean().optional(),
  unstructured: z.coerce.boolean().optional(),
  history: optionalText,
  quality: optionalText,
  availability: optionalText,
  silos: optionalText,
  personalData: z.coerce.boolean().optional(),
  sensitivity: z.enum(SENSITIVITY_LEVELS).optional().or(z.literal("")),
  rgpdConstraints: longText,
});

export const architectureSchema = z.object({
  applications: longText,
  apis: longText,
  workflowCurrent: longText,
  workflowTarget: longText,
  siIntegration: optionalText,
  humanValidation: z.coerce.boolean().optional(),
  traceability: optionalText,
  existingTools: longText,
});

const riskScore = z.coerce.number().int().min(1).max(5).optional().or(z.literal(""));

export const riskAssessmentSchema = z.object({
  rgpdRisk: riskScore,
  sensitiveDataRisk: riskScore,
  hallucinationRisk: riskScore,
  biasRisk: riskScore,
  classificationRisk: riskScore,
  autoDecisionRisk: riskScore,
  securityRisk: riskScore,
  vendorLockRisk: riskScore,
  adoptionRisk: riskScore,
  supervisionRisk: riskScore,
  overallRisk: z.enum(OVERALL_RISKS).optional().or(z.literal("")),
  mitigationPlan: longText,
});

export type BusinessNeedInput = z.infer<typeof businessNeedSchema>;
export type AIAnalysisInput = z.infer<typeof aiAnalysisSchema>;
export type DataAssessmentInput = z.infer<typeof dataAssessmentSchema>;
export type ArchitectureInput = z.infer<typeof architectureSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
