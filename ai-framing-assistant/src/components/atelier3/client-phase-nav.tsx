"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ATELIER3_PHASES,
  allA3Sections,
  type Atelier3SectionId,
} from "@/types/atelier3";
import type { SectionStatus } from "@/lib/engines/atelier3";

type Props = {
  projectId: string;
  sectionProgress: Record<Atelier3SectionId, { status: SectionStatus; note?: string }>;
  phaseProgress: Record<string, number>;
};

const STATUS_DOT: Record<SectionStatus, string> = {
  EMPTY: "bg-muted",
  STARTED: "bg-amber-400",
  COMPLETE: "bg-emerald-500",
};

const ORIGIN_BADGE: Record<string, string> = {
  ATELIER_1: "A1",
  ATELIER_2: "A2",
  OWN: "A3",
  MIXED: "MX",
  DERIVED: "•",
};

export function ClientA3PhaseNav({ projectId, sectionProgress, phaseProgress }: Props) {
  const pathname = usePathname() ?? "";
  const valid = new Set<Atelier3SectionId>(allA3Sections().map((s) => s.id));
  const tail = pathname.split("/").pop() ?? "";
  const currentSectionId: Atelier3SectionId | null =
    valid.has(tail as Atelier3SectionId) ? (tail as Atelier3SectionId) : null;

  return (
    <nav className="space-y-4 text-sm">
      <div>
        <Link
          href={`/projects/${projectId}/atelier/3`}
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

      {ATELIER3_PHASES.map((phase) => {
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
                      href={`/projects/${projectId}/atelier/3/${section.id}`}
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
                      <span
                        className={cn(
                          "shrink-0 rounded px-1 text-[9px] font-semibold",
                          isCurrent ? "bg-background/20 text-background" : "bg-muted text-muted-foreground",
                        )}
                        title={`Origine : ${section.coverageOrigin}`}
                      >
                        {ORIGIN_BADGE[section.coverageOrigin]}
                      </span>
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
