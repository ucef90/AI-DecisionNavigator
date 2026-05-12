"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { DECISIONS } from "@/types";

export type DecisionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const decisionSchema = z.object({
  decision: z.enum(DECISIONS),
  justification: z.string().trim().max(8000).optional().or(z.literal("")),
});

function readField(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

// Finalises the project decision — sets Project.finalDecision and moves
// status to DECIDED. The (optional) justification is appended to the
// existing Scoring.justification so the audit trail is preserved.
export async function finaliseDecision(
  projectId: string,
  _prev: DecisionState | undefined,
  form: FormData,
): Promise<DecisionState> {
  const parsed = decisionSchema.safeParse({
    decision: readField(form, "decision"),
    justification: readField(form, "justification"),
  });

  if (!parsed.success) {
    return {
      error: "Décision invalide.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { decision, justification } = parsed.data;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      finalDecision: decision,
      status: "DECIDED",
    },
  });

  if (justification && justification.length > 0) {
    // Append to scoring justification when present, otherwise ignore — we
    // could persist on a dedicated DecisionLog table later.
    const existing = await prisma.scoring.findUnique({
      where: { projectId },
      select: { justification: true },
    });
    if (existing) {
      const prefix = existing.justification ? existing.justification + "\n\n" : "";
      await prisma.scoring.update({
        where: { projectId },
        data: { justification: prefix + "[Décision finale] " + justification },
      });
    }
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/decision`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}`);
}
