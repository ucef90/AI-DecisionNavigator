"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  WIZARD_STEPS,
  type WizardStepId,
  wizardStepUrl,
} from "@/lib/wizard/steps";
import type { WizardProgress } from "@/lib/wizard/progress";

// Modern stepper — active step filled vibrant blue, completed steps filled
// success green, pending steps lavender outline. Engine phase steps are
// dashed (still optional).

function activeFromPath(pathname: string): WizardStepId | null {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return (WIZARD_STEPS.find((s) => s.id === last)?.id ?? null) as
    | WizardStepId
    | null;
}

export function WizardStepper({
  projectId,
  progress,
}: {
  projectId: string;
  progress: WizardProgress;
}) {
  const pathname = usePathname();
  const activeId = activeFromPath(pathname);

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {WIZARD_STEPS.map((step, idx) => {
        const active = step.id === activeId;
        const done = progress[step.id];
        const Icon = step.icon;
        const phaseBreak =
          idx > 0 && step.phase !== WIZARD_STEPS[idx - 1].phase;
        return (
          <li key={step.id} className="flex items-center gap-2">
            {phaseBreak ? (
              <span className="mx-1 inline-block h-4 w-px bg-border" />
            ) : null}
            <Link
              href={wizardStepUrl(projectId, step.id)}
              className={cn(
                "group inline-flex items-center gap-2 px-3 py-2 rounded-2xl border transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-[color-mix(in_oklab,var(--success)_40%,white)] bg-[color-mix(in_oklab,var(--success)_12%,white)] text-success hover:bg-[color-mix(in_oklab,var(--success)_20%,white)]"
                    : step.phase === "engine"
                      ? "border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center text-[10px] font-bold rounded-full",
                  active
                    ? "bg-primary-foreground text-primary"
                    : done
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {done && !active ? <Check className="size-3" /> : idx + 1}
              </span>
              <Icon className="size-3.5" />
              <span className="font-medium">{step.shortLabel}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
