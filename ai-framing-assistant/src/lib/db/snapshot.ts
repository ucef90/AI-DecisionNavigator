// Builds a ProjectSnapshot from Prisma. This is the single boundary
// between the DB and the engines layer — engines never import Prisma.

import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/wizard/progress";
import type {
  AIAnalysisSnapshot,
  ArchitectureSnapshot,
  BusinessNeedSnapshot,
  DataAssessmentSnapshot,
  ProjectSnapshot,
  RiskAssessmentSnapshot,
} from "@/lib/engines/types";
import type {
  AIApproach,
  Maturity,
  OverallRisk,
  Sensitivity,
} from "@/types";

export async function buildProjectSnapshot(
  id: string,
): Promise<ProjectSnapshot | null> {
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      businessNeed: true,
      aiAnalysis: true,
      dataAssessment: true,
      architectureAssessment: true,
      riskAssessment: true,
    },
  });
  if (!p) return null;

  const businessNeed: BusinessNeedSnapshot | null = p.businessNeed
    ? {
        initialRequest: p.businessNeed.initialRequest,
        reformulatedNeed: p.businessNeed.reformulatedNeed,
        painPoints: parseJsonArray(p.businessNeed.painPoints),
        expectedValue: p.businessNeed.expectedValue,
        usersImpacted: p.businessNeed.usersImpacted,
        currentKpis: parseJsonArray(p.businessNeed.currentKpis),
        expectedOutcome: p.businessNeed.expectedOutcome,
      }
    : null;

  const aiAnalysis: AIAnalysisSnapshot | null = p.aiAnalysis
    ? {
        automationRelevant: p.aiAnalysis.automationRelevant,
        ruleEngineRelevant: p.aiAnalysis.ruleEngineRelevant,
        mlRelevant: p.aiAnalysis.mlRelevant,
        llmRelevant: p.aiAnalysis.llmRelevant,
        ragRelevant: p.aiAnalysis.ragRelevant,
        agentRelevant: p.aiAnalysis.agentRelevant,
        hybridRelevant: p.aiAnalysis.hybridRelevant,
        classicRelevant: p.aiAnalysis.classicRelevant,
        recommendedApproach: p.aiAnalysis.recommendedApproach as AIApproach | null,
        justification: p.aiAnalysis.justification,
      }
    : null;

  const dataTypes = parseDataTypes(p.dataAssessment?.dataTypes);
  const dataAssessment: DataAssessmentSnapshot | null = p.dataAssessment
    ? {
        dataSources: parseJsonArray(p.dataAssessment.dataSources),
        structured: dataTypes.structured,
        unstructured: dataTypes.unstructured,
        history: p.dataAssessment.history,
        quality: p.dataAssessment.quality,
        availability: p.dataAssessment.availability,
        silos: p.dataAssessment.silos,
        personalData: p.dataAssessment.personalData,
        sensitivity: p.dataAssessment.sensitivity as Sensitivity | null,
        rgpdConstraints: p.dataAssessment.rgpdConstraints,
      }
    : null;

  const architecture: ArchitectureSnapshot | null = p.architectureAssessment
    ? {
        applications: parseJsonArray(p.architectureAssessment.applications),
        apis: parseJsonArray(p.architectureAssessment.apis),
        workflowCurrent: p.architectureAssessment.workflowCurrent,
        workflowTarget: p.architectureAssessment.workflowTarget,
        siIntegration: p.architectureAssessment.siIntegration,
        humanValidation: p.architectureAssessment.humanValidation,
        traceability: p.architectureAssessment.traceability,
        existingTools: parseJsonArray(p.architectureAssessment.existingTools),
      }
    : null;

  const riskAssessment: RiskAssessmentSnapshot | null = p.riskAssessment
    ? {
        rgpdRisk: p.riskAssessment.rgpdRisk,
        sensitiveDataRisk: p.riskAssessment.sensitiveDataRisk,
        hallucinationRisk: p.riskAssessment.hallucinationRisk,
        biasRisk: p.riskAssessment.biasRisk,
        classificationRisk: p.riskAssessment.classificationRisk,
        autoDecisionRisk: p.riskAssessment.autoDecisionRisk,
        securityRisk: p.riskAssessment.securityRisk,
        vendorLockRisk: p.riskAssessment.vendorLockRisk,
        adoptionRisk: p.riskAssessment.adoptionRisk,
        supervisionRisk: p.riskAssessment.supervisionRisk,
        overallRisk: p.riskAssessment.overallRisk as OverallRisk | null,
        mitigationPlan: p.riskAssessment.mitigationPlan,
      }
    : null;

  return {
    id: p.id,
    name: p.name,
    direction: p.direction,
    sponsor: p.sponsor,
    description: p.description,
    maturity: p.maturity as Maturity | null,
    businessNeed,
    aiAnalysis,
    dataAssessment,
    architecture,
    riskAssessment,
  };
}

function parseDataTypes(raw: string | null | undefined): {
  structured: boolean;
  unstructured: boolean;
} {
  if (!raw) return { structured: false, unstructured: false };
  try {
    const obj = JSON.parse(raw) as { structured?: unknown; unstructured?: unknown };
    return {
      structured: obj.structured === true,
      unstructured: obj.unstructured === true,
    };
  } catch {
    return { structured: false, unstructured: false };
  }
}
