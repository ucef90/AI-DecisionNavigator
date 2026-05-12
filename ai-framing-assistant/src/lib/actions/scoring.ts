"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { DECISIONS } from "@/types";

export type ScoringState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const axisScore = z.coerce.number().int().min(1).max(3);

const scoringSchema = z.object({
  needClarity: axisScore,
  aiRelevance: axisScore,
  dataMaturity: axisScore,
  businessValue: axisScore,
  riskControl: axisScore,
  feasibility: axisScore,
  recommendation: z.enum(DECISIONS),
  justification: z.string().trim().max(8000).optional().or(z.literal("")),
});

function readField(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

// Persist the (possibly overridden) scoring + recompute the total + move
// the project from IN_PROGRESS to SCORED.
export async function saveScoring(
  projectId: string,
  _prev: ScoringState | undefined,
  form: FormData,
): Promise<ScoringState> {
  const parsed = scoringSchema.safeParse({
    needClarity: readField(form, "needClarity"),
    aiRelevance: readField(form, "aiRelevance"),
    dataMaturity: readField(form, "dataMaturity"),
    businessValue: readField(form, "businessValue"),
    riskControl: readField(form, "riskControl"),
    feasibility: readField(form, "feasibility"),
    recommendation: readField(form, "recommendation"),
    justification: readField(form, "justification"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les notes (entre 1 et 3) et la recommandation.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  const total =
    d.needClarity +
    d.aiRelevance +
    d.dataMaturity +
    d.businessValue +
    d.riskControl +
    d.feasibility;

  const data = {
    needClarity: d.needClarity,
    aiRelevance: d.aiRelevance,
    dataMaturity: d.dataMaturity,
    businessValue: d.businessValue,
    riskControl: d.riskControl,
    feasibility: d.feasibility,
    total,
    recommendation: d.recommendation,
    justification: d.justification || null,
  };

  await prisma.scoring.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalScore: total,
      // Move from IN_PROGRESS → SCORED. Stays SCORED until decision is finalised.
      status: "SCORED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scoring`);
  revalidatePath(`/projects/${projectId}/decision`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  redirect(`/projects/${projectId}/decision`);
}
