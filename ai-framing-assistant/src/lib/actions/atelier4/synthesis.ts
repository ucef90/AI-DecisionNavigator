"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { DECISIONS, type Decision } from "@/types";
import { OVERALL_LEVELS, PRIORITY_LEVELS, type OverallLevel, type PriorityLevel } from "@/types/atelier4";

// Actions serveur pour les sections de la phase E (synthèse, décision,
// priorité, gate). On garde un seul fichier pour partager les helpers
// de revalidation.

function rev(projectId: string) {
  revalidatePath(`/projects/${projectId}/atelier/4`);
  revalidatePath(`/projects/${projectId}/atelier/4/synthesis`);
  revalidatePath(`/projects/${projectId}/atelier/4/recommendation`);
  revalidatePath(`/projects/${projectId}/atelier/4/priority`);
  revalidatePath(`/projects/${projectId}/atelier/4/gate`);
}

// -----------------------------------------------------------------
// Synthèse (§15) + Décision (§18) — même modèle Atelier4Synthesis
// -----------------------------------------------------------------
export type SynthesisPatch = {
  globalMaturity?: OverallLevel | "";
  globalFeasibility?: "LOW" | "MEDIUM" | "HIGH" | "";
  globalRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "";
  recommendedDecision?: Decision | "";
  decisionRationale?: string;
  strongPoints?: string[];
  weakPoints?: string[];
  topRecommendations?: string[];
};

const FEAS_VALUES = new Set(["LOW", "MEDIUM", "HIGH"]);
const RISK_VALUES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function clean<T extends string>(value: string | undefined, allowed: ReadonlyArray<T> | Set<string>): T | null {
  if (!value) return null;
  const set = Array.isArray(allowed) ? new Set<string>(allowed) : (allowed as Set<string>);
  return set.has(value) ? (value as T) : null;
}

export async function saveSynthesis(projectId: string, patch: SynthesisPatch): Promise<void> {
  const data: Record<string, unknown> = {};
  if (patch.globalMaturity !== undefined) {
    data.globalMaturity = clean<OverallLevel>(patch.globalMaturity, OVERALL_LEVELS);
  }
  if (patch.globalFeasibility !== undefined) {
    data.globalFeasibility = clean(patch.globalFeasibility, FEAS_VALUES);
  }
  if (patch.globalRisk !== undefined) {
    data.globalRisk = clean(patch.globalRisk, RISK_VALUES);
  }
  if (patch.recommendedDecision !== undefined) {
    data.recommendedDecision = clean<Decision>(patch.recommendedDecision, DECISIONS);
  }
  if (patch.decisionRationale !== undefined) {
    data.decisionRationale = patch.decisionRationale.trim() || null;
  }
  if (patch.strongPoints !== undefined) {
    data.strongPoints = patch.strongPoints.length > 0 ? JSON.stringify(patch.strongPoints) : null;
  }
  if (patch.weakPoints !== undefined) {
    data.weakPoints = patch.weakPoints.length > 0 ? JSON.stringify(patch.weakPoints) : null;
  }
  if (patch.topRecommendations !== undefined) {
    data.topRecommendations =
      patch.topRecommendations.length > 0 ? JSON.stringify(patch.topRecommendations) : null;
  }

  await prisma.atelier4Synthesis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// -----------------------------------------------------------------
// Priorité (§17)
// -----------------------------------------------------------------
export async function savePriority(
  projectId: string,
  patch: { level?: PriorityLevel | ""; justification?: string; notes?: string },
): Promise<void> {
  const data: Record<string, unknown> = {};
  if (patch.level !== undefined) {
    data.level = clean<PriorityLevel>(patch.level, PRIORITY_LEVELS);
  }
  if (patch.justification !== undefined) data.justification = patch.justification.trim() || null;
  if (patch.notes !== undefined) data.notes = patch.notes.trim() || null;
  await prisma.priorityAssessment.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// -----------------------------------------------------------------
// Gate atelier 5
// -----------------------------------------------------------------
export type GatePatch = {
  scoringComplete?: boolean;
  weakPointsAddressed?: boolean;
  priorityDefined?: boolean;
  decisionRecommended?: boolean;
  synthesisWritten?: boolean;
  verdict?: "NOT_READY" | "READY" | "OVERRIDE";
  overrideNotes?: string;
  decidedBy?: string;
};

export async function saveGate(projectId: string, patch: GatePatch): Promise<void> {
  const data: Record<string, unknown> = {};
  for (const k of [
    "scoringComplete",
    "weakPointsAddressed",
    "priorityDefined",
    "decisionRecommended",
    "synthesisWritten",
  ] as const) {
    if (patch[k] !== undefined) data[k] = patch[k];
  }
  if (patch.verdict !== undefined) {
    data.verdict = patch.verdict;
    if (patch.verdict !== "NOT_READY") {
      data.decidedAt = new Date();
    }
  }
  if (patch.overrideNotes !== undefined) data.overrideNotes = patch.overrideNotes.trim() || null;
  if (patch.decidedBy !== undefined) data.decidedBy = patch.decidedBy.trim() || null;

  await prisma.atelier4Gate.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}
