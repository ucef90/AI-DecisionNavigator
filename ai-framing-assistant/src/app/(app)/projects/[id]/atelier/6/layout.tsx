import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA6PhaseNav } from "@/components/atelier6/client-phase-nav";
import { Atelier6LivePanel } from "@/components/atelier6/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER6_PHASES, type Atelier6SectionId } from "@/types/atelier6";
import {
  a6OverallProgress,
  a6PhaseProgress,
  aggregateGovernanceScore,
  computeA6Gate,
  computeA6Progress,
  computeDimensionScores,
  loadAtelier6Snapshot,
  reasonGovernance,
} from "@/lib/engines/atelier6";

export default async function Atelier6Layout(
  props: LayoutProps<"/projects/[id]/atelier/6">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA6Progress(snap);
  const overall = a6OverallProgress(snap);
  const dims = computeDimensionScores(snap);
  const { overall: governanceScore } = aggregateGovernanceScore(dims);
  const reasoning = reasonGovernance(snap, dims);
  const gate = computeA6Gate(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER6_PHASES.map((p) => [p.id, a6PhaseProgress(snap, p.id)]),
  );
  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier6SectionId, { status: typeof sectionProgress[Atelier6SectionId]["status"]; note?: string }>;

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
            <span>Atelier 6</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 6 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">
              Gouvernance, risques et conformité IA
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
          <ClientA6PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier6LivePanel
            projectId={snap.projectId}
            dims={dims}
            overallScore={governanceScore}
            reasoning={reasoning}
            gate={gate}
            gateVerdict={gateVerdict}
          />
        </div>
      </div>
    </div>
  );
}
