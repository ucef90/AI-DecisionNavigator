"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { newProjectSchema } from "@/lib/validations/project";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Returns an empty string for FormData entries that are absent or whitespace.
function readField(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createProject(
  _prev: ActionState | undefined,
  form: FormData,
): Promise<ActionState> {
  const parsed = newProjectSchema.safeParse({
    name: readField(form, "name"),
    direction: readField(form, "direction"),
    sponsor: readField(form, "sponsor"),
    managerName: readField(form, "managerName"),
    description: readField(form, "description"),
    initialRequest: readField(form, "initialRequest"),
    expectedValue: readField(form, "expectedValue"),
    usersImpacted: readField(form, "usersImpacted"),
    maturity: readField(form, "maturity"),
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs du formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Empty string → undefined so Prisma stores NULL instead of "".
  const optional = (v: string | undefined) => (v && v.length > 0 ? v : null);

  const project = await prisma.project.create({
    data: {
      name: data.name,
      direction: optional(data.direction),
      sponsor: optional(data.sponsor),
      managerName: optional(data.managerName),
      description: optional(data.description),
      maturity: optional(data.maturity),
      status: "DRAFT",
      // Seed the BusinessNeed row with the raw initial request — étape 2
      // (reformulation IA) will fill in reformulatedNeed later.
      businessNeed:
        data.initialRequest || data.expectedValue || data.usersImpacted
          ? {
              create: {
                initialRequest: optional(data.initialRequest),
                expectedValue: optional(data.expectedValue),
                usersImpacted: optional(data.usersImpacted),
              },
            }
          : undefined,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}
