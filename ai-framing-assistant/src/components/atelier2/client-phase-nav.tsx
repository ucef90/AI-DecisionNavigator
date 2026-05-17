"use client";

import { usePathname } from "next/navigation";

import { Atelier2PhaseNav } from "./phase-nav";
import { allA2Sections, type Atelier2SectionId } from "@/types/atelier2";
import type { SectionStatus } from "@/lib/engines/atelier2";

type Props = {
  projectId: string;
  sectionProgress: Record<Atelier2SectionId, { status: SectionStatus; note?: string }>;
  phaseProgress: Record<string, number>;
};

export function ClientA2PhaseNav({ projectId, sectionProgress, phaseProgress }: Props) {
  const pathname = usePathname() ?? "";
  const valid = new Set<Atelier2SectionId>(allA2Sections().map((s) => s.id));
  const tail = pathname.split("/").pop() ?? "";
  const currentSectionId: Atelier2SectionId | null =
    valid.has(tail as Atelier2SectionId) ? (tail as Atelier2SectionId) : null;

  return (
    <Atelier2PhaseNav
      projectId={projectId}
      currentSectionId={currentSectionId}
      sectionProgress={sectionProgress}
      phaseProgress={phaseProgress}
    />
  );
}
