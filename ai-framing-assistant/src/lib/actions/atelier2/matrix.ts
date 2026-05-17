"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  TASK_NATURES,
  TASK_VERDICTS,
  type TaskNature,
  type TaskVerdict,
} from "@/types/atelier2";

// CRUD minimal pour la matrice IA vs automatisation. Les form
// submissions passent par ces actions ; on revalide la route pour
// que les signaux live et la reco profil se rafraîchissent.

export type MatrixState = {
  error?: string;
  ok?: boolean;
};

function pickNature(v: FormDataEntryValue | null): TaskNature {
  return TASK_NATURES.includes(v as TaskNature) ? (v as TaskNature) : "OTHER";
}
function pickVerdict(v: FormDataEntryValue | null): TaskVerdict {
  return TASK_VERDICTS.includes(v as TaskVerdict) ? (v as TaskVerdict) : "HUMAN";
}

export async function createTaskQualification(
  projectId: string,
  _prev: MatrixState | undefined,
  form: FormData,
): Promise<MatrixState> {
  const taskName = String(form.get("taskName") ?? "").trim();
  if (!taskName) return { error: "Le nom de la tâche est requis." };

  const nature = pickNature(form.get("nature"));
  const verdict = pickVerdict(form.get("verdict"));
  const complexityRaw = Number(form.get("complexity") ?? 3);
  const complexity = Number.isFinite(complexityRaw)
    ? Math.min(5, Math.max(1, Math.round(complexityRaw)))
    : 3;
  const justification = String(form.get("justification") ?? "").trim() || null;

  await prisma.taskQualification.create({
    data: {
      projectId,
      taskName,
      nature,
      verdict,
      complexity,
      justification,
      rulesKnownAndFixed: form.get("rulesKnownAndFixed") === "on",
      workflowStable: form.get("workflowStable") === "on",
      fewExceptions: form.get("fewExceptions") === "on",
      needsTextUnderstanding: form.get("needsTextUnderstanding") === "on",
      needsClassification: form.get("needsClassification") === "on",
      needsContentGeneration: form.get("needsContentGeneration") === "on",
      needsDocumentReading: form.get("needsDocumentReading") === "on",
      needsDocSearch: form.get("needsDocSearch") === "on",
      needsContextualReasoning: form.get("needsContextualReasoning") === "on",
      needsHumanInterpretation: form.get("needsHumanInterpretation") === "on",
    },
  });
  revalidatePath(`/projects/${projectId}/atelier/2/matrix`);
  revalidatePath(`/projects/${projectId}/atelier/2`);
  return { ok: true };
}

export async function updateTaskQualification(
  projectId: string,
  taskId: string,
  patch: {
    verdict?: TaskVerdict;
    complexity?: number;
    justification?: string;
    nature?: TaskNature;
  },
): Promise<void> {
  await prisma.taskQualification.update({
    where: { id: taskId },
    data: {
      ...(patch.verdict !== undefined ? { verdict: patch.verdict } : {}),
      ...(patch.nature !== undefined ? { nature: patch.nature } : {}),
      ...(patch.complexity !== undefined
        ? { complexity: Math.min(5, Math.max(1, Math.round(patch.complexity))) }
        : {}),
      ...(patch.justification !== undefined ? { justification: patch.justification } : {}),
    },
  });
  revalidatePath(`/projects/${projectId}/atelier/2/matrix`);
  revalidatePath(`/projects/${projectId}/atelier/2`);
}

export async function deleteTaskQualification(projectId: string, taskId: string): Promise<void> {
  await prisma.taskQualification.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}/atelier/2/matrix`);
  revalidatePath(`/projects/${projectId}/atelier/2`);
}

// Bonus utile : pré-remplir la matrice à partir des étapes du
// workflow déjà cartographié à l'atelier 1. Garantit zéro re-saisie
// si l'atelier 1 est sérieux.
export async function seedFromAtelier1Workflow(projectId: string): Promise<{ created: number }> {
  const steps = await prisma.processStep.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
  if (steps.length === 0) return { created: 0 };
  const existing = await prisma.taskQualification.findMany({
    where: { projectId },
    select: { processStepId: true, taskName: true },
  });
  const existingNames = new Set(existing.map((e) => e.taskName));
  const existingStepIds = new Set(existing.map((e) => e.processStepId).filter(Boolean) as string[]);

  let created = 0;
  for (const [idx, step] of steps.entries()) {
    if (existingStepIds.has(step.id) || existingNames.has(step.name)) continue;
    // Heuristique : suggérer un verdict par défaut selon le mode
    // de l'étape (MANUAL → HUMAN, AUTOMATED → AUTOMATION, semi → HYBRID)
    const verdict: TaskVerdict =
      step.mode === "AUTOMATED" ? "AUTOMATION" : step.mode === "SEMI_AUTOMATED" ? "HYBRID" : "HUMAN";
    await prisma.taskQualification.create({
      data: {
        projectId,
        taskName: step.name,
        processStepId: step.id,
        verdict,
        nature: guessNatureFromStepType(step.stepType),
        complexity: 3,
        position: idx,
      },
    });
    created++;
  }
  revalidatePath(`/projects/${projectId}/atelier/2/matrix`);
  revalidatePath(`/projects/${projectId}/atelier/2`);
  return { created };
}

function guessNatureFromStepType(stepType: string): TaskNature {
  switch (stepType) {
    case "INPUT":
      return "RECEIVE";
    case "VALIDATION":
      return "VALIDATE";
    case "DECISION":
      return "DECIDE";
    case "TRANSFER":
      return "TRANSFER";
    case "OUTPUT":
      return "NOTIFY";
    default:
      return "OTHER";
  }
}
