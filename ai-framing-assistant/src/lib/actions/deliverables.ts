"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";
import {
  generateAllDeliverables,
  generateDeliverable,
} from "@/lib/engines/deliverables";
import { DELIVERABLE_TYPES, type DeliverableType } from "@/types";

function isDeliverableType(v: string): v is DeliverableType {
  return (DELIVERABLE_TYPES as readonly string[]).includes(v);
}

// Replace strategy: a project has at most one row per (projectId, type).
// We delete-then-create rather than update to keep createdAt = "last regen".
async function persist(
  projectId: string,
  type: DeliverableType,
  content: string,
) {
  await prisma.deliverable.deleteMany({ where: { projectId, type } });
  await prisma.deliverable.create({
    data: { projectId, type, format: "markdown", content },
  });
}

export async function generateOneDeliverable(
  projectId: string,
  rawType: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isDeliverableType(rawType)) {
    return { ok: false, error: "Type de livrable invalide." };
  }
  const snap = await buildProjectSnapshot(projectId);
  if (!snap) return { ok: false, error: "Projet introuvable." };
  const report = computeEngineReport(snap);
  const out = generateDeliverable(rawType, snap, report);
  await persist(projectId, rawType, out.content);

  revalidatePath(`/projects/${projectId}/deliverables`);
  revalidatePath(`/projects/${projectId}/deliverables/${rawType}`);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function generateAllDeliverablesAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string; count?: number }> {
  const snap = await buildProjectSnapshot(projectId);
  if (!snap) return { ok: false, error: "Projet introuvable." };
  const report = computeEngineReport(snap);
  const all = generateAllDeliverables(snap, report);
  for (const d of all) {
    await persist(projectId, d.type, d.content);
  }
  revalidatePath(`/projects/${projectId}/deliverables`);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, count: all.length };
}

export async function deleteDeliverable(
  projectId: string,
  rawType: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isDeliverableType(rawType)) {
    return { ok: false, error: "Type de livrable invalide." };
  }
  await prisma.deliverable.deleteMany({ where: { projectId, type: rawType } });
  revalidatePath(`/projects/${projectId}/deliverables`);
  return { ok: true };
}
