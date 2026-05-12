"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { linesToJsonArray } from "@/lib/wizard/progress";
import {
  getNextStep,
  wizardStepUrl,
  type WizardStepId,
} from "@/lib/wizard/steps";
import {
  aiAnalysisSchema,
  architectureSchema,
  businessNeedSchema,
  dataAssessmentSchema,
  riskAssessmentSchema,
} from "@/lib/validations/wizard";

export type WizardState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function readField(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBool(form: FormData, key: string): boolean {
  // <input type="checkbox" name="x" value="on"> emits the value only when checked.
  return form.get(key) === "on";
}

function readInt(form: FormData, key: string): string {
  // Returned as string so Zod's z.coerce handles empty values gracefully.
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function nullable<T>(v: T | "" | undefined | null): T | null {
  return v == null || (v as unknown) === "" ? null : (v as T);
}

async function markProjectInProgress(projectId: string) {
  // Once the user touches the wizard, leave DRAFT and become IN_PROGRESS.
  await prisma.project.updateMany({
    where: { id: projectId, status: "DRAFT" },
    data: { status: "IN_PROGRESS" },
  });
}

function afterSave(projectId: string, stepId: WizardStepId, exit: boolean) {
  revalidatePath(`/projects/${projectId}/wizard`, "layout");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scoring`);
  revalidatePath(`/projects/${projectId}/decision`);
  revalidatePath(`/projects/${projectId}/cartography`);
  revalidatePath(`/projects/${projectId}/deliverables`);
  if (exit) {
    redirect(`/projects/${projectId}`);
  }
  const next = getNextStep(stepId);
  // Last wizard step → hand off to the scoring page so the user enters the
  // engines layer (scoring → decision → cartography → deliverables) right
  // after finishing the questionnaire.
  redirect(
    next
      ? wizardStepUrl(projectId, next.id)
      : `/projects/${projectId}/scoring`,
  );
}

// -------------------------------------------------------------
// Business need
// -------------------------------------------------------------
export async function saveBusinessNeed(
  projectId: string,
  _prev: WizardState | undefined,
  form: FormData,
): Promise<WizardState> {
  const parsed = businessNeedSchema.safeParse({
    reformulatedNeed: readField(form, "reformulatedNeed"),
    painPoints: readField(form, "painPoints"),
    expectedValue: readField(form, "expectedValue"),
    usersImpacted: readField(form, "usersImpacted"),
    currentKpis: readField(form, "currentKpis"),
    expectedOutcome: readField(form, "expectedOutcome"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    reformulatedNeed: nullable(d.reformulatedNeed),
    painPoints: d.painPoints ? linesToJsonArray(d.painPoints) : null,
    expectedValue: nullable(d.expectedValue),
    usersImpacted: nullable(d.usersImpacted),
    currentKpis: d.currentKpis ? linesToJsonArray(d.currentKpis) : null,
    expectedOutcome: nullable(d.expectedOutcome),
  };

  await prisma.businessNeed.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await markProjectInProgress(projectId);
  afterSave(projectId, "business-need", readBool(form, "exit"));
  return {};
}

// -------------------------------------------------------------
// AI analysis
// -------------------------------------------------------------
export async function saveAIAnalysis(
  projectId: string,
  _prev: WizardState | undefined,
  form: FormData,
): Promise<WizardState> {
  const parsed = aiAnalysisSchema.safeParse({
    automationRelevant: readBool(form, "automationRelevant"),
    ruleEngineRelevant: readBool(form, "ruleEngineRelevant"),
    mlRelevant: readBool(form, "mlRelevant"),
    llmRelevant: readBool(form, "llmRelevant"),
    ragRelevant: readBool(form, "ragRelevant"),
    agentRelevant: readBool(form, "agentRelevant"),
    hybridRelevant: readBool(form, "hybridRelevant"),
    classicRelevant: readBool(form, "classicRelevant"),
    recommendedApproach: readField(form, "recommendedApproach"),
    justification: readField(form, "justification"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    automationRelevant: !!d.automationRelevant,
    ruleEngineRelevant: !!d.ruleEngineRelevant,
    mlRelevant: !!d.mlRelevant,
    llmRelevant: !!d.llmRelevant,
    ragRelevant: !!d.ragRelevant,
    agentRelevant: !!d.agentRelevant,
    hybridRelevant: !!d.hybridRelevant,
    classicRelevant: !!d.classicRelevant,
    recommendedApproach: nullable(d.recommendedApproach),
    justification: nullable(d.justification),
  };

  await prisma.aIAnalysis.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await markProjectInProgress(projectId);
  afterSave(projectId, "ai-analysis", readBool(form, "exit"));
  return {};
}

// -------------------------------------------------------------
// Data assessment
// -------------------------------------------------------------
export async function saveDataAssessment(
  projectId: string,
  _prev: WizardState | undefined,
  form: FormData,
): Promise<WizardState> {
  const parsed = dataAssessmentSchema.safeParse({
    dataSources: readField(form, "dataSources"),
    structured: readBool(form, "structured"),
    unstructured: readBool(form, "unstructured"),
    history: readField(form, "history"),
    quality: readField(form, "quality"),
    availability: readField(form, "availability"),
    silos: readField(form, "silos"),
    personalData: readBool(form, "personalData"),
    sensitivity: readField(form, "sensitivity"),
    rgpdConstraints: readField(form, "rgpdConstraints"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    dataSources: d.dataSources ? linesToJsonArray(d.dataSources) : null,
    dataTypes: JSON.stringify({
      structured: !!d.structured,
      unstructured: !!d.unstructured,
    }),
    history: nullable(d.history),
    quality: nullable(d.quality),
    availability: nullable(d.availability),
    silos: nullable(d.silos),
    personalData: !!d.personalData,
    sensitivity: nullable(d.sensitivity),
    rgpdConstraints: nullable(d.rgpdConstraints),
  };

  await prisma.dataAssessment.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await markProjectInProgress(projectId);
  afterSave(projectId, "data", readBool(form, "exit"));
  return {};
}

// -------------------------------------------------------------
// Architecture
// -------------------------------------------------------------
export async function saveArchitecture(
  projectId: string,
  _prev: WizardState | undefined,
  form: FormData,
): Promise<WizardState> {
  const parsed = architectureSchema.safeParse({
    applications: readField(form, "applications"),
    apis: readField(form, "apis"),
    workflowCurrent: readField(form, "workflowCurrent"),
    workflowTarget: readField(form, "workflowTarget"),
    siIntegration: readField(form, "siIntegration"),
    humanValidation: readBool(form, "humanValidation"),
    traceability: readField(form, "traceability"),
    existingTools: readField(form, "existingTools"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    applications: d.applications ? linesToJsonArray(d.applications) : null,
    apis: d.apis ? linesToJsonArray(d.apis) : null,
    workflowCurrent: nullable(d.workflowCurrent),
    workflowTarget: nullable(d.workflowTarget),
    siIntegration: nullable(d.siIntegration),
    humanValidation: !!d.humanValidation,
    traceability: nullable(d.traceability),
    existingTools: d.existingTools ? linesToJsonArray(d.existingTools) : null,
  };

  await prisma.architectureAssessment.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await markProjectInProgress(projectId);
  afterSave(projectId, "architecture", readBool(form, "exit"));
  return {};
}

// -------------------------------------------------------------
// Risks
// -------------------------------------------------------------
export async function saveRiskAssessment(
  projectId: string,
  _prev: WizardState | undefined,
  form: FormData,
): Promise<WizardState> {
  const parsed = riskAssessmentSchema.safeParse({
    rgpdRisk: readInt(form, "rgpdRisk"),
    sensitiveDataRisk: readInt(form, "sensitiveDataRisk"),
    hallucinationRisk: readInt(form, "hallucinationRisk"),
    biasRisk: readInt(form, "biasRisk"),
    classificationRisk: readInt(form, "classificationRisk"),
    autoDecisionRisk: readInt(form, "autoDecisionRisk"),
    securityRisk: readInt(form, "securityRisk"),
    vendorLockRisk: readInt(form, "vendorLockRisk"),
    adoptionRisk: readInt(form, "adoptionRisk"),
    supervisionRisk: readInt(form, "supervisionRisk"),
    overallRisk: readField(form, "overallRisk"),
    mitigationPlan: readField(form, "mitigationPlan"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const numOrNull = (v: number | "" | undefined) =>
    typeof v === "number" ? v : null;
  const data = {
    rgpdRisk: numOrNull(d.rgpdRisk),
    sensitiveDataRisk: numOrNull(d.sensitiveDataRisk),
    hallucinationRisk: numOrNull(d.hallucinationRisk),
    biasRisk: numOrNull(d.biasRisk),
    classificationRisk: numOrNull(d.classificationRisk),
    autoDecisionRisk: numOrNull(d.autoDecisionRisk),
    securityRisk: numOrNull(d.securityRisk),
    vendorLockRisk: numOrNull(d.vendorLockRisk),
    adoptionRisk: numOrNull(d.adoptionRisk),
    supervisionRisk: numOrNull(d.supervisionRisk),
    overallRisk: nullable(d.overallRisk),
    mitigationPlan: nullable(d.mitigationPlan),
  };

  await prisma.riskAssessment.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await markProjectInProgress(projectId);
  afterSave(projectId, "risks", readBool(form, "exit"));
  return {};
}
