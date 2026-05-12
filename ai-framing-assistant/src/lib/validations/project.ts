import { z } from "zod";

import { MATURITY_LEVELS } from "@/types";

// Schema for the "Étape 1 — Création du projet" form (SPEC §88).
// Fields below mix Project columns and BusinessNeed columns; the action
// splits them across the two tables on insert.
export const newProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(120, "Maximum 120 caractères"),
  direction: z.string().trim().max(120).optional().or(z.literal("")),
  sponsor: z.string().trim().max(120).optional().or(z.literal("")),
  managerName: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  initialRequest: z
    .string()
    .trim()
    .max(4000, "Maximum 4000 caractères")
    .optional()
    .or(z.literal("")),
  expectedValue: z.string().trim().max(2000).optional().or(z.literal("")),
  usersImpacted: z.string().trim().max(2000).optional().or(z.literal("")),
  maturity: z.enum(MATURITY_LEVELS).optional().or(z.literal("")),
});

export type NewProjectInput = z.infer<typeof newProjectSchema>;
