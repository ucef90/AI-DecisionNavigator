"use client";

import { usePathname } from "next/navigation";

import { AtelierPhaseNav } from "./phase-nav";
import { allSections, type AtelierSectionId } from "@/types/atelier1";
import type { SectionStatus } from "@/lib/engines/atelier1";

// Thin client wrapper: reads the current route to highlight the active
// section, then delegates to the pure server-renderable AtelierPhaseNav.

type Props = {
  projectId: string;
  sectionProgress: Record<AtelierSectionId, { status: SectionStatus; note?: string }>;
  phaseProgress: Record<string, number>;
};

export function ClientPhaseNav({ projectId, sectionProgress, phaseProgress }: Props) {
  const pathname = usePathname() ?? "";
  const valid = new Set<AtelierSectionId>(allSections().map((s) => s.id));
  // match /projects/{id}/atelier/1/{section}
  const tail = pathname.split("/").pop() ?? "";
  const currentSectionId: AtelierSectionId | null =
    valid.has(tail as AtelierSectionId) ? (tail as AtelierSectionId) : null;

  return (
    <AtelierPhaseNav
      projectId={projectId}
      currentSectionId={currentSectionId}
      sectionProgress={sectionProgress}
      phaseProgress={phaseProgress}
    />
  );
}
