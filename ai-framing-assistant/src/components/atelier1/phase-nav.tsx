import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ATELIER_PHASES,
  type AtelierSectionId,
} from "@/types/atelier1";
import type { SectionStatus } from "@/lib/engines/atelier1";

// Left rail. Lists the 5 phases (A → E) and their sections.
// Each section shows an EMPTY / STARTED / COMPLETE pill so the CDP
// sees at a glance what's done and what's pending.

type Props = {
  projectId: string;
  currentSectionId: AtelierSectionId | null;
  sectionProgress: Record<AtelierSectionId, { status: SectionStatus; note?: string }>;
  phaseProgress: Record<string, number>;
};

const STATUS_DOT: Record<SectionStatus, string> = {
  EMPTY: "bg-muted",
  STARTED: "bg-amber-400",
  COMPLETE: "bg-emerald-500",
};

export function AtelierPhaseNav({
  projectId,
  currentSectionId,
  sectionProgress,
  phaseProgress,
}: Props) {
  return (
    <nav className="space-y-4 text-sm">
      <div>
        <Link
          href={`/projects/${projectId}/atelier/1`}
          className={cn(
            "block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide",
            currentSectionId === null
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          Vue d&apos;ensemble
        </Link>
      </div>

      {ATELIER_PHASES.map((phase) => {
        const ratio = phaseProgress[phase.id] ?? 0;
        return (
          <section key={phase.id} className="space-y-1.5">
            <header className="flex items-center justify-between gap-2 px-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Phase {phase.id} — {phase.title}
              </div>
              <Badge variant="outline" className="text-[10px]">
                {ratio}%
              </Badge>
            </header>
            <ul className="space-y-0.5">
              {phase.sections.map((section) => {
                const progress = sectionProgress[section.id];
                const isCurrent = currentSectionId === section.id;
                return (
                  <li key={section.id}>
                    <Link
                      href={`/projects/${projectId}/atelier/1/${section.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
                        isCurrent
                          ? "bg-foreground/95 text-background"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          STATUS_DOT[progress?.status ?? "EMPTY"],
                        )}
                      />
                      <span className="flex-1 truncate">{section.title}</span>
                      {progress?.note ? (
                        <span
                          className={cn(
                            "shrink-0 text-[10px]",
                            isCurrent ? "text-background/70" : "text-muted-foreground",
                          )}
                        >
                          {progress.note}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </nav>
  );
}
