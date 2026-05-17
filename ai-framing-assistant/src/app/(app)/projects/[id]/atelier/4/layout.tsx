import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA4PhaseNav } from "@/components/atelier4/client-phase-nav";
import { Atelier4LivePanel } from "@/components/atelier4/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER4_PHASES, type Atelier4SectionId } from "@/types/atelier4";
import {
  a4OverallProgress,
  a4PhaseProgress,
  aggregateScore,
  computeA4Gate,
  computeA4Progress,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
} from "@/lib/engines/atelier4";

export default async function Atelier4Layout(
  props: LayoutProps<"/projects/[id]/atelier/4">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA4Progress(snap);
  const overall = a4OverallProgress(snap);
  const results = computeAutoScorecard(snap);
  const { overallScore, overallLevel } = aggregateScore(results);
  const decision = recommendDecision(snap, results);
  const gate = computeA4Gate(snap);
  const gateVerdict = (snap.a4Gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER4_PHASES.map((p) => [p.id, a4PhaseProgress(snap, p.id)]),
  );
  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier4SectionId, { status: typeof sectionProgress[Atelier4SectionId]["status"]; note?: string }>;

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
            <span>Atelier 4</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 4 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">Scoring et maturité projet IA</h1>
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
          <ClientA4PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier4LivePanel
            projectId={snap.projectId}
            results={results}
            overallScore={overallScore}
            overallLevel={overallLevel}
            decision={decision}
            gate={gate}
            gateVerdict={gateVerdict}
          />
        </div>
      </div>
    </div>
  );
}
