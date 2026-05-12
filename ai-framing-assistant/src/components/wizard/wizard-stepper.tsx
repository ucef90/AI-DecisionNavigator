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

function activeFromPath(pathname: string): WizardStepId | null {
  // /projects/[id]/wizard/<step-id> or /projects/[id]/<engine-step>
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
                "group flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : done
                    ? "border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 hover:border-emerald-600"
                    : step.phase === "engine"
                      ? "border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  active
                    ? "bg-background text-foreground"
                    : done
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-foreground/70",
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
