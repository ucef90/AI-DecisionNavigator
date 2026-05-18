"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { DECISIONS, type Decision } from "@/types";
import {
  INDUSTRIALIZATION_STAGES,
  INDUSTRIALIZATION_STATUSES,
  ROADMAP_ITEM_TYPES,
  ROADMAP_PHASES,
  ROADMAP_STATUSES,
  SPONSOR_DECISIONS,
  type SponsorDecision,
} from "@/types/atelier7";

function rev(projectId: string) {
  revalidatePath(`/projects/${projectId}`, "layout");
}

const inSet = <T extends string>(v: unknown, set: readonly T[], fallback: T): T => {
  const s = typeof v === "string" ? v : "";
  return (set as readonly string[]).includes(s) ? (s as T) : fallback;
};
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const optStr = (v: unknown): string | null => {
  const s = str(v);
  return s.length > 0 ? s : null;
};
const optInt = (v: unknown, min: number, max: number): number | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
};
const int = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = optInt(v, min, max);
  return n ?? fallback;
};

const linesToJSON = (v: unknown): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const list = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return list.length > 0 ? JSON.stringify(list) : null;
};

// =============================================================
// STRATEGIC VISION (single record per project)
// =============================================================
export async function saveStrategicVision(projectId: string, form: FormData): Promise<void> {
  const data = {
    visionStatement: optStr(form.get("visionStatement")),
    businessValue: optStr(form.get("businessValue")),
    strategicObjectives: linesToJSON(form.get("strategicObjectives")),
    transformationGoals: linesToJSON(form.get("transformationGoals")),
    successCriteria: linesToJSON(form.get("successCriteria")),
    businessValueScore: optInt(form.get("businessValueScore"), 1, 5),
    transformationScore: optInt(form.get("transformationScore"), 1, 5),
  };
  await prisma.strategicVision.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// ROADMAP ITEM
// =============================================================
export async function addRoadmapItem(projectId: string, form: FormData): Promise<void> {
  const title = str(form.get("title"));
  if (!title) return;
  await prisma.roadmapItem.create({
    data: {
      projectId,
      title,
      description: optStr(form.get("description")),
      phase: inSet(form.get("phase"), ROADMAP_PHASES, "PHASE_0_POC"),
      impact: int(form.get("impact"), 1, 5, 3),
      complexity: int(form.get("complexity"), 1, 5, 3),
      effortMonths: optInt(form.get("effortMonths"), 0, 60),
      itemType: inSet(form.get("itemType"), ROADMAP_ITEM_TYPES, "STRATEGIC"),
      status: inSet(form.get("status"), ROADMAP_STATUSES, "PLANNED"),
      ownerRole: optStr(form.get("ownerRole")),
    },
  });
  rev(projectId);
}
export async function updateRoadmapItem(projectId: string, iid: string, form: FormData): Promise<void> {
  await prisma.roadmapItem.update({
    where: { id: iid },
    data: {
      title: str(form.get("title")) || undefined,
      description: optStr(form.get("description")),
      phase: inSet(form.get("phase"), ROADMAP_PHASES, "PHASE_0_POC"),
      impact: int(form.get("impact"), 1, 5, 3),
      complexity: int(form.get("complexity"), 1, 5, 3),
      effortMonths: optInt(form.get("effortMonths"), 0, 60),
      itemType: inSet(form.get("itemType"), ROADMAP_ITEM_TYPES, "STRATEGIC"),
      status: inSet(form.get("status"), ROADMAP_STATUSES, "PLANNED"),
      ownerRole: optStr(form.get("ownerRole")),
    },
  });
  rev(projectId);
}
export async function deleteRoadmapItem(projectId: string, iid: string): Promise<void> {
  await prisma.roadmapItem.delete({ where: { id: iid } });
  rev(projectId);
}

// =============================================================
// INDUSTRIALIZATION STEP
// =============================================================
const parseDate = (v: unknown): Date | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
};

export async function addIndustrializationStep(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  await prisma.industrializationStep.create({
    data: {
      projectId,
      name,
      stage: inSet(form.get("stage"), INDUSTRIALIZATION_STAGES, "POC"),
      description: optStr(form.get("description")),
      readinessLevel: int(form.get("readinessLevel"), 1, 5, 1),
      status: inSet(form.get("status"), INDUSTRIALIZATION_STATUSES, "NOT_STARTED"),
      exitCriteria: optStr(form.get("exitCriteria")),
      startTarget: parseDate(form.get("startTarget")),
      endTarget: parseDate(form.get("endTarget")),
    },
  });
  rev(projectId);
}
export async function updateIndustrializationStep(projectId: string, sid: string, form: FormData): Promise<void> {
  await prisma.industrializationStep.update({
    where: { id: sid },
    data: {
      name: str(form.get("name")) || undefined,
      stage: inSet(form.get("stage"), INDUSTRIALIZATION_STAGES, "POC"),
      description: optStr(form.get("description")),
      readinessLevel: int(form.get("readinessLevel"), 1, 5, 1),
      status: inSet(form.get("status"), INDUSTRIALIZATION_STATUSES, "NOT_STARTED"),
      exitCriteria: optStr(form.get("exitCriteria")),
      startTarget: parseDate(form.get("startTarget")),
      endTarget: parseDate(form.get("endTarget")),
    },
  });
  rev(projectId);
}
export async function deleteIndustrializationStep(projectId: string, sid: string): Promise<void> {
  await prisma.industrializationStep.delete({ where: { id: sid } });
  rev(projectId);
}

// =============================================================
// ATELIER 7 SYNTHESIS / FINAL DECISION
// =============================================================
export async function saveA7Synthesis(projectId: string, form: FormData): Promise<void> {
  const fd = (() => {
    const s = typeof form.get("finalDecision") === "string" ? (form.get("finalDecision") as string) : "";
    return (DECISIONS as readonly string[]).includes(s) ? (s as Decision) : null;
  })();
  const sponsorDec = (() => {
    const s = typeof form.get("sponsorDecision") === "string" ? (form.get("sponsorDecision") as string) : "";
    return (SPONSOR_DECISIONS as readonly string[]).includes(s) ? (s as SponsorDecision) : null;
  })();
  const data = {
    finalDecision: fd,
    decisionRationale: optStr(form.get("decisionRationale")),
    strongPoints: linesToJSON(form.get("strongPoints")),
    weakPoints: linesToJSON(form.get("weakPoints")),
    mainRisks: linesToJSON(form.get("mainRisks")),
    roadmapSummary: optStr(form.get("roadmapSummary")),
    industrializationStrategy: optStr(form.get("industrializationStrategy")),
    governanceStrategy: optStr(form.get("governanceStrategy")),
    pilotageStrategy: optStr(form.get("pilotageStrategy")),
    sponsorDecision: sponsorDec,
    sponsorName: optStr(form.get("sponsorName")),
    sponsorDecisionDate: sponsorDec === "OK" || sponsorDec === "KO" ? new Date() : null,
  };
  await prisma.atelier7Synthesis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}
