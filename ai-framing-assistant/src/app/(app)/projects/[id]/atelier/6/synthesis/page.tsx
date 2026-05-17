import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, ListBlock, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { GOVERNANCE_LEVEL_COLORS, GOVERNANCE_LEVEL_LABELS, governanceLevelFromScore } from "@/types/atelier6";
import { aggregateGovernanceScore, computeDimensionScores, loadAtelier6Snapshot, reasonGovernance } from "@/lib/engines/atelier6";

export default async function A6SynthesisPage(props: PageProps<"/projects/[id]/atelier/6/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const dims = computeDimensionScores(snap);
  const { overall } = aggregateGovernanceScore(dims);
  const level = governanceLevelFromScore(overall);
  const reasoning = reasonGovernance(snap, dims);
  const s = snap.synthesis;

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse"
      title="Synthèse gouvernance"
      livrableRef="Synthèse atelier 6"
      intent="Score global gouvernance + statement consultant + actions prioritaires."
      pourquoi={["Page COPIL — résumé exécutif gouvernance.", "Conditionne le passage à l'atelier 7 (industrialisation).", "Industrialisation possible si score ≥ 60."]}
      cherche={["Score ≥ 60.", "Industrialisation readiness OK.", "Actions prioritaires nommées."]}
    >
      <div className="space-y-4">
        <div className="rounded-md border border-foreground/15 bg-muted/30 p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score gouvernance</div>
          <div className="mt-1 text-4xl font-semibold tabular-nums">{overall}/100</div>
          <div className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${GOVERNANCE_LEVEL_COLORS[level]}`}>
            {GOVERNANCE_LEVEL_LABELS[level]}
          </div>
        </div>

        {!s ? <EmptyState message="Synthèse non rédigée." /> : (
          <>
            <DataBlock title="Vision globale" body={s.overallStatement} />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={reasoning.industrializationReadiness ? "border-emerald-500/40" : "border-amber-500/40"}>
                {reasoning.industrializationReadiness ? "✓ Industrialisation envisageable" : "⚠ Industrialisation à sécuriser"}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ListBlock title="Points forts" items={safeJSON<string[]>(s.strongPoints, reasoning.strongPoints)} />
              <ListBlock title="Points faibles" items={safeJSON<string[]>(s.weakPoints, reasoning.weakPoints)} />
              <ListBlock title="Actions prioritaires" items={safeJSON<string[]>(s.priorityActions, reasoning.priorityActions)} />
            </div>
          </>
        )}
      </div>
    </SectionShell>
  );
}
