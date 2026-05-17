import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA5PhaseNav } from "@/components/atelier5/client-phase-nav";
import { Atelier5LivePanel } from "@/components/atelier5/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER5_PHASES, type Atelier5SectionId } from "@/types/atelier5";
import {
  a5OverallProgress,
  a5PhaseProgress,
  computeA5Gate,
  computeA5Progress,
  computeLayerStats,
  loadAtelier5Snapshot,
} from "@/lib/engines/atelier5";

export default async function Atelier5Layout(
  props: LayoutProps<"/projects/[id]/atelier/5">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA5Progress(snap);
  const overall = a5OverallProgress(snap);
  const gate = computeA5Gate(snap);
  const layerStats = computeLayerStats(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER5_PHASES.map((p) => [p.id, a5PhaseProgress(snap, p.id)]),
  );
  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier5SectionId, { status: typeof sectionProgress[Atelier5SectionId]["status"]; note?: string }>;

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
            <span>Atelier 5</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 5 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">Cartographie IA complète</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{overall}%</div>
          <div className="text-xs text-muted-foreground">complété</div>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${overall}%` }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <ClientA5PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier5LivePanel
            projectId={snap.projectId}
            layerStats={layerStats}
            gate={gate}
            gateVerdict={gateVerdict}
            totalAnnotations={snap.annotations.length}
          />
        </div>
      </div>
    </div>
  );
}
