import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA7PhaseNav } from "@/components/atelier7/client-phase-nav";
import { Atelier7LivePanel } from "@/components/atelier7/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER7_PHASES, type Atelier7SectionId } from "@/types/atelier7";
import {
  a7OverallProgress,
  a7PhaseProgress,
  computeA7Gate,
  computeA7Progress,
  computeFinalDecision,
  computeGlobalProjectScore,
  loadAtelier7Snapshot,
} from "@/lib/engines/atelier7";

export default async function Atelier7Layout(
  props: LayoutProps<"/projects/[id]/atelier/7">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA7Progress(snap);
  const overall = a7OverallProgress(snap);
  const globalScore = computeGlobalProjectScore(snap);
  const decision = computeFinalDecision(snap);
  const gate = computeA7Gate(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "CLOSED"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER7_PHASES.map((p) => [p.id, a7PhaseProgress(snap, p.id)]),
  );
  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier7SectionId, { status: typeof sectionProgress[Atelier7SectionId]["status"]; note?: string }>;

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
            <span>Atelier 7</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 7 sur 7 — décision finale
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">
              Architecture cible, roadmap & décision finale IA
            </h1>
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
          <ClientA7PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier7LivePanel
            projectId={snap.projectId}
            globalScore={globalScore}
            decision={decision}
            gate={gate}
            gateVerdict={gateVerdict}
          />
        </div>
      </div>
    </div>
  );
}
