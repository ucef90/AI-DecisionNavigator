import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientA3PhaseNav } from "@/components/atelier3/client-phase-nav";
import { Atelier3LivePanel } from "@/components/atelier3/live-panel";
import { Badge } from "@/components/ui/badge";
import { ATELIER3_PHASES, type Atelier3SectionId } from "@/types/atelier3";
import {
  a3OverallProgress,
  a3PhaseProgress,
  buildCoverageMap,
  computeA3Gate,
  computeA3Progress,
  coverageAverage,
  detectCriticalPoints,
  deriveMaturity,
  loadAtelier3Snapshot,
} from "@/lib/engines/atelier3";

export default async function Atelier3Layout(
  props: LayoutProps<"/projects/[id]/atelier/3">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA3Progress(snap);
  const overall = a3OverallProgress(snap);
  const gate = computeA3Gate(snap);
  const derivedMaturity = deriveMaturity(snap);
  const coverage = buildCoverageMap(snap);
  const coverageAvg = coverageAverage(coverage);
  const criticalPoints = detectCriticalPoints(snap);
  const gateVerdict = (snap.gate?.verdict ?? null) as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE"
    | null;

  const phaseProgressMap: Record<string, number> = Object.fromEntries(
    ATELIER3_PHASES.map((p) => [p.id, a3PhaseProgress(snap, p.id)]),
  );

  const sectionProgressForNav = Object.fromEntries(
    Object.entries(sectionProgress).map(([k, v]) => [k, { status: v.status, note: v.note }]),
  ) as Record<Atelier3SectionId, { status: typeof sectionProgress[Atelier3SectionId]["status"]; note?: string }>;

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
            <span>Atelier 3</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Atelier 3 sur 7
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">Questionnaire de cadrage IA</h1>
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
          <ClientA3PhaseNav
            projectId={snap.projectId}
            sectionProgress={sectionProgressForNav}
            phaseProgress={phaseProgressMap}
          />
        </div>
        <main className="min-w-0 space-y-6">{props.children}</main>
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <Atelier3LivePanel
            projectId={snap.projectId}
            criticalPoints={criticalPoints}
            gate={gate}
            gateVerdict={gateVerdict}
            derivedMaturity={derivedMaturity}
            coverageAvg={coverageAvg}
          />
        </div>
      </div>
    </div>
  );
}
