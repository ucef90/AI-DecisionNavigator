"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  ACTOR_CATEGORIES,
  ACTOR_INVOLVEMENTS,
  ASSUMPTION_STATUSES,
  ASSUMPTION_TYPES,
  CONSTRAINT_TYPES,
  EFFORT_LEVELS,
  IMPACT_AXES,
  IMPACT_DIRECTIONS,
  IMPACT_SEVERITIES,
  IRRITANT_CATEGORIES,
  KPI_MEASURE_STATUSES,
  OBJECTIVE_CATEGORIES,
  OPPORTUNITY_CATEGORIES,
  PROCESS_STEP_MODES,
  PROCESS_STEP_TYPES,
  RISK_LEVELS,
  SEVERITY_LEVELS,
  UNCERTAINTY_SEVERITIES,
  UNCERTAINTY_STATUSES,
  VERBATIM_SENTIMENTS,
  VERBATIM_SOURCES,
} from "@/types/atelier1";

// Server actions atelier 1 — CRUD pour les modèles éditables.
//
// Convention : chaque action revalide la route du projet pour
// que les signaux live + gate + cockpit se rafraîchissent.
//
// Utility : `bindForProject(id)` permet de créer une action
// pré-bindée au projectId (pratique pour passer aux composants
// client sans exposer le projectId à chaque appel).

function rev(projectId: string) {
  revalidatePath(`/projects/${projectId}`, "layout");
}

const inSet = <T extends string>(v: unknown, set: readonly T[] | Set<string>, fallback: T): T => {
  const s = typeof v === "string" ? v : "";
  const valid = Array.isArray(set) ? new Set<string>(set) : (set as Set<string>);
  return valid.has(s) ? (s as T) : fallback;
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const optStr = (v: unknown): string | null => {
  const s = str(v);
  return s.length > 0 ? s : null;
};
const optInt = (v: unknown): number | null => {
  const n = typeof v === "string" || typeof v === "number" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

// =============================================================
// QUALIFICATION (fiche §1)
// =============================================================
export async function saveQualification(projectId: string, form: FormData): Promise<void> {
  const data = {
    directionConcerned: optStr(form.get("directionConcerned")),
    businessOwner: optStr(form.get("businessOwner")),
    triggerEvent: optStr(form.get("triggerEvent")),
    priorityReason: optStr(form.get("priorityReason")),
    strategicAlignment: optStr(form.get("strategicAlignment")),
    regulatoryPressure: form.get("regulatoryPressure") === "on",
    operationalOverload: form.get("operationalOverload") === "on",
    serviceDegradation: form.get("serviceDegradation") === "on",
    driverVolumeIncrease: form.get("driverVolumeIncrease") === "on",
    driverResourceShortage: form.get("driverResourceShortage") === "on",
    driverFrequentErrors: form.get("driverFrequentErrors") === "on",
    driverPoorUserExperience: form.get("driverPoorUserExperience") === "on",
    driverManualWorkflow: form.get("driverManualWorkflow") === "on",
    driverLowTraceability: form.get("driverLowTraceability") === "on",
    driverHighDelays: form.get("driverHighDelays") === "on",
  };
  await prisma.businessQualification.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// SCOPE (périmètre)
// =============================================================
export async function saveScope(projectId: string, form: FormData): Promise<void> {
  const inScopeRaw = str(form.get("inScope"));
  const outScopeRaw = str(form.get("outOfScope"));
  const inScope = inScopeRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const outOfScope = outScopeRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  const data = {
    inScope: inScope.length > 0 ? JSON.stringify(inScope) : null,
    outOfScope: outOfScope.length > 0 ? JSON.stringify(outOfScope) : null,
    assumptionsForScope: optStr(form.get("assumptionsForScope")),
    scopeValidatedBy: optStr(form.get("scopeValidatedBy")),
  };
  await prisma.projectScope.upsert({
    where: { projectId },
    create: { projectId, ...data, scopeValidatedAt: data.scopeValidatedBy ? new Date() : null },
    update: { ...data, scopeValidatedAt: data.scopeValidatedBy ? new Date() : null },
  });
  rev(projectId);
}

// =============================================================
// BUSINESS NEED — reformulation + value (atelier 1 sections
// "reformulation" et "value")
// =============================================================
export async function saveBusinessNeed(projectId: string, form: FormData): Promise<void> {
  const data = {
    initialRequest: optStr(form.get("initialRequest")),
    reformulatedNeed: optStr(form.get("reformulatedNeed")),
    expectedValue: optStr(form.get("expectedValue")),
    expectedOutcome: optStr(form.get("expectedOutcome")),
    usersImpacted: optStr(form.get("usersImpacted")),
    problemStatement: optStr(form.get("problemStatement")),
    currentImpactSummary: optStr(form.get("currentImpactSummary")),
    expectedResultSummary: optStr(form.get("expectedResultSummary")),
    declaredMaturityLevel: optStr(form.get("declaredMaturityLevel")),
  };
  await prisma.businessNeed.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// ACTORS (liste)
// =============================================================
export async function addActor(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  await prisma.businessActor.create({
    data: {
      projectId,
      name,
      category: inSet(form.get("category"), ACTOR_CATEGORIES, "USER"),
      involvement: inSet(form.get("involvement"), ACTOR_INVOLVEMENTS, "PRIMARY"),
      role: optStr(form.get("role")),
      volume: optInt(form.get("volume")),
      currentPain: optStr(form.get("currentPain")),
      expectedGain: optStr(form.get("expectedGain")),
    },
  });
  rev(projectId);
}

export async function updateActor(projectId: string, actorId: string, form: FormData): Promise<void> {
  await prisma.businessActor.update({
    where: { id: actorId },
    data: {
      name: str(form.get("name")) || undefined,
      category: inSet(form.get("category"), ACTOR_CATEGORIES, "USER"),
      involvement: inSet(form.get("involvement"), ACTOR_INVOLVEMENTS, "PRIMARY"),
      role: optStr(form.get("role")),
      volume: optInt(form.get("volume")),
      currentPain: optStr(form.get("currentPain")),
      expectedGain: optStr(form.get("expectedGain")),
    },
  });
  rev(projectId);
}

export async function deleteActor(projectId: string, actorId: string): Promise<void> {
  await prisma.businessActor.delete({ where: { id: actorId } });
  rev(projectId);
}

// =============================================================
// PROCESS STEPS (workflow AS-IS)
// =============================================================
export async function addProcessStep(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  const last = await prisma.processStep.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? 0) + 1;
  const toolsRaw = str(form.get("tools"));
  const tools = toolsRaw ? toolsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  await prisma.processStep.create({
    data: {
      projectId,
      order,
      name,
      actor: optStr(form.get("actor")),
      mode: inSet(form.get("mode"), PROCESS_STEP_MODES, "MANUAL"),
      stepType: inSet(form.get("stepType"), PROCESS_STEP_TYPES, "TREATMENT"),
      durationMin: optInt(form.get("durationMin")),
      tools: tools.length > 0 ? JSON.stringify(tools) : null,
    },
  });
  rev(projectId);
}

export async function updateProcessStep(projectId: string, stepId: string, form: FormData): Promise<void> {
  const toolsRaw = str(form.get("tools"));
  const tools = toolsRaw ? toolsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  await prisma.processStep.update({
    where: { id: stepId },
    data: {
      name: str(form.get("name")) || undefined,
      actor: optStr(form.get("actor")),
      mode: inSet(form.get("mode"), PROCESS_STEP_MODES, "MANUAL"),
      stepType: inSet(form.get("stepType"), PROCESS_STEP_TYPES, "TREATMENT"),
      durationMin: optInt(form.get("durationMin")),
      tools: tools.length > 0 ? JSON.stringify(tools) : null,
    },
  });
  rev(projectId);
}

export async function deleteProcessStep(projectId: string, stepId: string): Promise<void> {
  await prisma.processStep.delete({ where: { id: stepId } });
  rev(projectId);
}

// =============================================================
// IRRITANTS
// =============================================================
export async function addIrritant(projectId: string, form: FormData): Promise<void> {
  const title = str(form.get("title"));
  if (!title) return;
  await prisma.irritant.create({
    data: {
      projectId,
      title,
      description: optStr(form.get("description")),
      category: inSet(form.get("category"), IRRITANT_CATEGORIES, "OTHER"),
      severity: inSet(form.get("severity"), SEVERITY_LEVELS, "MEDIUM"),
      impactedActor: optStr(form.get("impactedActor")),
      frequency: optStr(form.get("frequency")),
      estimatedTimeWastedMinPerDay: optInt(form.get("estimatedTimeWastedMinPerDay")),
    },
  });
  rev(projectId);
}

export async function updateIrritant(projectId: string, irritantId: string, form: FormData): Promise<void> {
  await prisma.irritant.update({
    where: { id: irritantId },
    data: {
      title: str(form.get("title")) || undefined,
      description: optStr(form.get("description")),
      category: inSet(form.get("category"), IRRITANT_CATEGORIES, "OTHER"),
      severity: inSet(form.get("severity"), SEVERITY_LEVELS, "MEDIUM"),
      impactedActor: optStr(form.get("impactedActor")),
      frequency: optStr(form.get("frequency")),
      estimatedTimeWastedMinPerDay: optInt(form.get("estimatedTimeWastedMinPerDay")),
    },
  });
  rev(projectId);
}

export async function deleteIrritant(projectId: string, irritantId: string): Promise<void> {
  await prisma.irritant.delete({ where: { id: irritantId } });
  rev(projectId);
}

// =============================================================
// KPI BASELINE
// =============================================================
export async function addKpi(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  await prisma.kpiBaseline.create({
    data: {
      projectId,
      name,
      unit: optStr(form.get("unit")),
      currentValue: optStr(form.get("currentValue")),
      targetValue: optStr(form.get("targetValue")),
      source: optStr(form.get("source")),
      measureStatus: inSet(form.get("measureStatus"), KPI_MEASURE_STATUSES, "NOT_MEASURED"),
      notes: optStr(form.get("notes")),
    },
  });
  rev(projectId);
}

export async function updateKpi(projectId: string, kpiId: string, form: FormData): Promise<void> {
  await prisma.kpiBaseline.update({
    where: { id: kpiId },
    data: {
      name: str(form.get("name")) || undefined,
      unit: optStr(form.get("unit")),
      currentValue: optStr(form.get("currentValue")),
      targetValue: optStr(form.get("targetValue")),
      source: optStr(form.get("source")),
      measureStatus: inSet(form.get("measureStatus"), KPI_MEASURE_STATUSES, "NOT_MEASURED"),
      notes: optStr(form.get("notes")),
    },
  });
  rev(projectId);
}

export async function deleteKpi(projectId: string, kpiId: string): Promise<void> {
  await prisma.kpiBaseline.delete({ where: { id: kpiId } });
  rev(projectId);
}

// =============================================================
// OBJECTIVES
// =============================================================
export async function addObjective(projectId: string, form: FormData): Promise<void> {
  const title = str(form.get("title"));
  if (!title) return;
  await prisma.businessObjective.create({
    data: {
      projectId,
      title,
      description: optStr(form.get("description")),
      priority: optInt(form.get("priority")) ?? 3,
      category: inSet(form.get("category"), OBJECTIVE_CATEGORIES, "OTHER"),
    },
  });
  rev(projectId);
}
export async function updateObjective(projectId: string, oid: string, form: FormData): Promise<void> {
  await prisma.businessObjective.update({
    where: { id: oid },
    data: {
      title: str(form.get("title")) || undefined,
      description: optStr(form.get("description")),
      priority: optInt(form.get("priority")) ?? undefined,
      category: inSet(form.get("category"), OBJECTIVE_CATEGORIES, "OTHER"),
    },
  });
  rev(projectId);
}
export async function deleteObjective(projectId: string, oid: string): Promise<void> {
  await prisma.businessObjective.delete({ where: { id: oid } });
  rev(projectId);
}

// =============================================================
// IMPACTS
// =============================================================
export async function addImpact(projectId: string, form: FormData): Promise<void> {
  const description = str(form.get("description"));
  if (!description) return;
  await prisma.businessImpact.create({
    data: {
      projectId,
      axis: inSet(form.get("axis"), IMPACT_AXES, "AGENT"),
      description,
      severity: inSet(form.get("severity"), IMPACT_SEVERITIES, "MEDIUM"),
      direction: inSet(form.get("direction"), IMPACT_DIRECTIONS, "NEGATIVE"),
      metric: optStr(form.get("metric")),
    },
  });
  rev(projectId);
}
export async function updateImpact(projectId: string, iid: string, form: FormData): Promise<void> {
  await prisma.businessImpact.update({
    where: { id: iid },
    data: {
      axis: inSet(form.get("axis"), IMPACT_AXES, "AGENT"),
      description: str(form.get("description")) || undefined,
      severity: inSet(form.get("severity"), IMPACT_SEVERITIES, "MEDIUM"),
      direction: inSet(form.get("direction"), IMPACT_DIRECTIONS, "NEGATIVE"),
      metric: optStr(form.get("metric")),
    },
  });
  rev(projectId);
}
export async function deleteImpact(projectId: string, iid: string): Promise<void> {
  await prisma.businessImpact.delete({ where: { id: iid } });
  rev(projectId);
}

// =============================================================
// ASSUMPTIONS
// =============================================================
export async function addAssumption(projectId: string, form: FormData): Promise<void> {
  const statement = str(form.get("statement"));
  if (!statement) return;
  await prisma.projectAssumption.create({
    data: {
      projectId,
      statement,
      assumptionType: inSet(form.get("assumptionType"), ASSUMPTION_TYPES, "BUSINESS"),
      riskIfWrong: inSet(form.get("riskIfWrong"), RISK_LEVELS, "MEDIUM"),
      status: inSet(form.get("status"), ASSUMPTION_STATUSES, "UNVERIFIED"),
      validationPlan: optStr(form.get("validationPlan")),
    },
  });
  rev(projectId);
}
export async function updateAssumption(projectId: string, aid: string, form: FormData): Promise<void> {
  await prisma.projectAssumption.update({
    where: { id: aid },
    data: {
      statement: str(form.get("statement")) || undefined,
      assumptionType: inSet(form.get("assumptionType"), ASSUMPTION_TYPES, "BUSINESS"),
      riskIfWrong: inSet(form.get("riskIfWrong"), RISK_LEVELS, "MEDIUM"),
      status: inSet(form.get("status"), ASSUMPTION_STATUSES, "UNVERIFIED"),
      validationPlan: optStr(form.get("validationPlan")),
    },
  });
  rev(projectId);
}
export async function deleteAssumption(projectId: string, aid: string): Promise<void> {
  await prisma.projectAssumption.delete({ where: { id: aid } });
  rev(projectId);
}

// =============================================================
// UNCERTAINTIES
// =============================================================
export async function addUncertainty(projectId: string, form: FormData): Promise<void> {
  const topic = str(form.get("topic"));
  const question = str(form.get("question"));
  if (!topic || !question) return;
  await prisma.uncertainty.create({
    data: {
      projectId,
      topic,
      question,
      severity: inSet(form.get("severity"), UNCERTAINTY_SEVERITIES, "MEDIUM"),
      status: inSet(form.get("status"), UNCERTAINTY_STATUSES, "OPEN"),
      ownerToAsk: optStr(form.get("ownerToAsk")),
      resolution: optStr(form.get("resolution")),
    },
  });
  rev(projectId);
}
export async function updateUncertainty(projectId: string, uid: string, form: FormData): Promise<void> {
  await prisma.uncertainty.update({
    where: { id: uid },
    data: {
      topic: str(form.get("topic")) || undefined,
      question: str(form.get("question")) || undefined,
      severity: inSet(form.get("severity"), UNCERTAINTY_SEVERITIES, "MEDIUM"),
      status: inSet(form.get("status"), UNCERTAINTY_STATUSES, "OPEN"),
      ownerToAsk: optStr(form.get("ownerToAsk")),
      resolution: optStr(form.get("resolution")),
    },
  });
  rev(projectId);
}
export async function deleteUncertainty(projectId: string, uid: string): Promise<void> {
  await prisma.uncertainty.delete({ where: { id: uid } });
  rev(projectId);
}

// =============================================================
// CONSTRAINTS
// =============================================================
export async function addConstraint(projectId: string, form: FormData): Promise<void> {
  const description = str(form.get("description"));
  if (!description) return;
  await prisma.businessConstraint.create({
    data: {
      projectId,
      constraintType: inSet(form.get("constraintType"), CONSTRAINT_TYPES, "OTHER"),
      description,
      impactLevel: inSet(form.get("impactLevel"), SEVERITY_LEVELS, "MEDIUM"),
      source: optStr(form.get("source")),
    },
  });
  rev(projectId);
}
export async function updateConstraint(projectId: string, cid: string, form: FormData): Promise<void> {
  await prisma.businessConstraint.update({
    where: { id: cid },
    data: {
      constraintType: inSet(form.get("constraintType"), CONSTRAINT_TYPES, "OTHER"),
      description: str(form.get("description")) || undefined,
      impactLevel: inSet(form.get("impactLevel"), SEVERITY_LEVELS, "MEDIUM"),
      source: optStr(form.get("source")),
    },
  });
  rev(projectId);
}
export async function deleteConstraint(projectId: string, cid: string): Promise<void> {
  await prisma.businessConstraint.delete({ where: { id: cid } });
  rev(projectId);
}

// =============================================================
// OPPORTUNITIES
// =============================================================
export async function addOpportunity(projectId: string, form: FormData): Promise<void> {
  const title = str(form.get("title"));
  if (!title) return;
  await prisma.improvementOpportunity.create({
    data: {
      projectId,
      title,
      description: optStr(form.get("description")),
      category: inSet(form.get("category"), OPPORTUNITY_CATEGORIES, "OTHER"),
      estimatedGain: optStr(form.get("estimatedGain")),
      effort: inSet(form.get("effort"), EFFORT_LEVELS, "MEDIUM"),
    },
  });
  rev(projectId);
}
export async function updateOpportunity(projectId: string, oid: string, form: FormData): Promise<void> {
  await prisma.improvementOpportunity.update({
    where: { id: oid },
    data: {
      title: str(form.get("title")) || undefined,
      description: optStr(form.get("description")),
      category: inSet(form.get("category"), OPPORTUNITY_CATEGORIES, "OTHER"),
      estimatedGain: optStr(form.get("estimatedGain")),
      effort: inSet(form.get("effort"), EFFORT_LEVELS, "MEDIUM"),
    },
  });
  rev(projectId);
}
export async function deleteOpportunity(projectId: string, oid: string): Promise<void> {
  await prisma.improvementOpportunity.delete({ where: { id: oid } });
  rev(projectId);
}

// =============================================================
// VERBATIMS
// =============================================================
export async function addVerbatim(projectId: string, form: FormData): Promise<void> {
  const quote = str(form.get("quote"));
  if (!quote) return;
  await prisma.userVerbatim.create({
    data: {
      projectId,
      quote,
      speakerRole: optStr(form.get("speakerRole")),
      speakerName: optStr(form.get("speakerName")),
      source: inSet(form.get("source"), VERBATIM_SOURCES, "INTERVIEW"),
      sentiment: inSet(form.get("sentiment"), VERBATIM_SENTIMENTS, "NEGATIVE"),
      theme: optStr(form.get("theme")),
    },
  });
  rev(projectId);
}
export async function updateVerbatim(projectId: string, vid: string, form: FormData): Promise<void> {
  await prisma.userVerbatim.update({
    where: { id: vid },
    data: {
      quote: str(form.get("quote")) || undefined,
      speakerRole: optStr(form.get("speakerRole")),
      speakerName: optStr(form.get("speakerName")),
      source: inSet(form.get("source"), VERBATIM_SOURCES, "INTERVIEW"),
      sentiment: inSet(form.get("sentiment"), VERBATIM_SENTIMENTS, "NEGATIVE"),
      theme: optStr(form.get("theme")),
    },
  });
  rev(projectId);
}
export async function deleteVerbatim(projectId: string, vid: string): Promise<void> {
  await prisma.userVerbatim.delete({ where: { id: vid } });
  rev(projectId);
}
