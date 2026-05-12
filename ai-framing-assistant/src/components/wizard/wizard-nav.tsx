"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  getNextStep,
  getPrevStep,
  type WizardStepId,
  wizardStepUrl,
} from "@/lib/wizard/steps";

export function WizardNav({
  projectId,
  stepId,
  pending,
}: {
  projectId: string;
  stepId: WizardStepId;
  pending: boolean;
}) {
  const prev = getPrevStep(stepId);
  const next = getNextStep(stepId);

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
      {prev ? (
        <Link
          href={wizardStepUrl(projectId, prev.id)}
          className={buttonVariants({ variant: "ghost" })}
        >
          ← {prev.shortLabel}
        </Link>
      ) : (
        <Link
          href={`/projects/${projectId}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          ← Retour au projet
        </Link>
      )}

      <div className="flex items-center gap-2">
        <Link
          href={`/projects/${projectId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Quitter
        </Link>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Enregistrement..."
            : next
              ? `Enregistrer & ${next.shortLabel} →`
              : "Enregistrer & terminer"}
        </Button>
      </div>
    </div>
  );
}
