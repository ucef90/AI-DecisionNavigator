import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA2PhaseNav } from "@/components/atelier2/client-phase-nav";
import { Atelier2LivePanel } from "@/components/atelier2/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER2_PHASES, type Atelier2SectionId } from "@/types/atelier2";
import {
  a2OverallProgress,
  a2PhaseProgress,
  computeA2Gate,
  computeA2Progress,
  detectA2Signals,
  loadAtelier2Snapshot,
  recommendProfile,
} from "@/lib/engines/atelier2";

export default async function Atelier2Layout(
  props: LayoutProps<"/projects/[id]/atelier/2">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA2Progress(snap);
  const overall = a2OverallProgress(snap);
  const signals = detectA2Signals(snap);
  const gate = computeA2Gate(snap);
  const profile = recommendProfile(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER2_PHASES.map((p) => [p.id, a2PhaseProgress(snap, p.id)]),
  );

  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier2SectionId, { status: typeof sectionProgress[Atelier2SectionId]["status"]; note?: string }>;

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
            <span>Atelier 2</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 2 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">IA ou automatisation ?</h1>
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
          <ClientA2PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier2LivePanel
            projectId={snap.projectId}
            signals={signals}
            gate={gate}
            gateVerdict={gateVerdict}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
}
