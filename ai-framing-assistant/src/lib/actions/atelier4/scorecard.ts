"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  SCORECARD_AXES,
  type ScorecardAxis,
} from "@/types/atelier4";
import type { ScoreValue } from "@/types/score-levels";

// Persistance du scorecard atelier 4. Le scorecard est un seul
// row (one-to-one avec Project). Pour chaque axe on garde :
//   - la valeur (1..5 ou null)
//   - le flag auto (true = on a accepté l'auto-score) — sinon override
//   - la justification (texte libre)
//
// Les justifications/autoFlags sont stockés en JSON map dans
// 2 colonnes pour rester portable SQLite/Postgres.

type AxisPatch = {
  axis: ScorecardAxis;
  value: ScoreValue | null;
  justification?: string | null;
  /** true = mark as auto (la valeur sera recalculée à chaque lecture).
   *  false = mark as manual override. */
  isAuto?: boolean;
};

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function patchScorecard(projectId: string, patch: AxisPatch): Promise<void> {
  const existing = await prisma.projectScorecard.findUnique({ where: { projectId } });
  const autoFlags = safeJSON<Record<string, boolean>>(existing?.autoFlags, {});
  const justifications = safeJSON<Record<string, string>>(existing?.justifications, {});

  if (patch.isAuto != null) autoFlags[patch.axis] = patch.isAuto;
  if (patch.justification !== undefined) {
    if (patch.justification && patch.justification.trim().length > 0) {
      justifications[patch.axis] = patch.justification.trim();
    } else {
      delete justifications[patch.axis];
    }
  }

  // On stocke aussi la valeur même quand c'est auto — utile en cas
  // de reset DB (sinon on perd l'historique des overrides).
  const data: Record<string, unknown> = {
    [patch.axis]: patch.value,
    autoFlags: JSON.stringify(autoFlags),
    justifications: JSON.stringify(justifications),
  };

  await prisma.projectScorecard.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  revalidatePath(`/projects/${projectId}/atelier/4`);
  revalidatePath(`/projects/${projectId}/atelier/4/cockpit`);
}

export async function acceptAllAutoScores(
  projectId: string,
  autoValues: Partial<Record<ScorecardAxis, ScoreValue>>,
): Promise<void> {
  const autoFlags: Record<string, boolean> = {};
  for (const axis of SCORECARD_AXES) autoFlags[axis] = true;
  const data: Record<string, unknown> = {
    autoFlags: JSON.stringify(autoFlags),
  };
  for (const [axis, val] of Object.entries(autoValues)) {
    data[axis] = val;
  }
  await prisma.projectScorecard.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  revalidatePath(`/projects/${projectId}/atelier/4`);
  revalidatePath(`/projects/${projectId}/atelier/4/cockpit`);
}
