"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  ACTOR_CATEGORIES,
  ACTOR_INVOLVEMENTS,
  IRRITANT_CATEGORIES,
  KPI_MEASURE_STATUSES,
  PROCESS_STEP_MODES,
  PROCESS_STEP_TYPES,
  SEVERITY_LEVELS,
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
