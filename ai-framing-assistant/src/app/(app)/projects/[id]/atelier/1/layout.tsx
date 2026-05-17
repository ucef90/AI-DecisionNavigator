import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientPhaseNav } from "@/components/atelier1/client-phase-nav";
import { AtelierLivePanel } from "@/components/atelier1/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER_PHASES, type AtelierSectionId } from "@/types/atelier1";
import {
  computeGateCriteria,
  computeSectionProgress,
  detectLiveSignals,
  loadAtelierSnapshot,
  overallProgress,
  phaseProgress,
} from "@/lib/engines/atelier1";

// 3-column layout : left = phase/section nav, center = workspace,
// right = live signals + gate criteria. The snapshot is loaded once
// here and re-derived on every navigation (no caching to keep signals
// fresh after a save action).

export default async function AtelierLayout(
  props: LayoutProps<"/projects/[id]/atelier/1">,
) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeSectionProgress(snap);
  const overall = overallProgress(snap);
  const signals = detectLiveSignals(snap);
  const gate = computeGateCriteria(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER_PHASES.map((p) => [p.id, phaseProgress(snap, p.id)]),
  );

  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<AtelierSectionId, { status: typeof sectionProgress[AtelierSectionId]["status"]; note?: string }>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/projects" className="hover:underline">
              Projets
            </Link>
            <span>/</span>
            <Link href={`/projects/${snap.projectId}`} className="hover:underline">
              {snap.projectName}
            </Link>
            <span>/</span>
            <span>Atelier 1</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 1 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">
              Comprendre le vrai problème métier
            </h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{overall}%</div>
          <div className="text-xs text-muted-foreground">complété</div>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-foreground transition-all"
          style={{ width: `${overall}%` }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <ClientPhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>

        <main className="min-w-0 space-y-6">{props.children}</main>

        <div className="rounded-xl border border-border bg-background/80 p-3">
          <AtelierLivePanel
            projectId={snap.projectId}
            signals={signals}
            gate={gate}
            gateVerdict={gateVerdict}
          />
        </div>
      </div>
    </div>
  );
}
