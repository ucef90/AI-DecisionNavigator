import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { A6SynthesisEditor } from "@/components/atelier6/editors/synthesis-editor";
import { safeJSON } from "@/components/common/data-block";
import { saveA6Synthesis } from "@/lib/actions/atelier6";
import { aggregateGovernanceScore, computeDimensionScores, loadAtelier6Snapshot, reasonGovernance } from "@/lib/engines/atelier6";
import { GOVERNANCE_LEVEL_COLORS, GOVERNANCE_LEVEL_LABELS, governanceLevelFromScore } from "@/types/atelier6";

export default async function A6SynthesisPage(props: PageProps<"/projects/[id]/atelier/6/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const dims = computeDimensionScores(snap);
  const { overall } = aggregateGovernanceScore(dims);
  const level = governanceLevelFromScore(overall);
  const reasoning = reasonGovernance(snap, dims);
  const s = snap.synthesis;

  async function action(formData: FormData) { "use server"; await saveA6Synthesis(id, formData); }

  const existingStrong = safeJSON<string[]>(s?.strongPoints, []);
  const existingWeak = safeJSON<string[]>(s?.weakPoints, []);
  const existingActions = safeJSON<string[]>(s?.priorityActions, []);

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse"
      title="Synthèse gouvernance"
      livrableRef="Synthèse atelier 6"
      intent="Score global gouvernance + statement consultant + actions prioritaires."
      pourquoi={["Page COPIL — résumé exécutif gouvernance.", "Conditionne le passage à l'atelier 7 (industrialisation).", "Industrialisation possible si score ≥ 60."]}
      cherche={["Score ≥ 60.", "Industrialisation readiness OK.", "Actions prioritaires nommées."]}
    >
      <div className="mb-4 rounded-md border border-foreground/15 bg-muted/30 p-4 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score gouvernance</div>
        <div className="mt-1 text-4xl font-semibold tabular-nums">{overall}/100</div>
        <div className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${GOVERNANCE_LEVEL_COLORS[level]}`}>
          {GOVERNANCE_LEVEL_LABELS[level]}
        </div>
      </div>

      <A6SynthesisEditor
        defaults={{
          overallStatement: s?.overallStatement ?? "",
          industrializationReadiness: s?.industrializationReadiness ?? false,
          strongPointsText: existingStrong.join("\n"),
          weakPointsText: existingWeak.join("\n"),
          priorityActionsText: existingActions.join("\n"),
        }}
        suggested={{
          overallStatement: reasoning.overallStatement,
          industrializationReadiness: reasoning.industrializationReadiness,
          strongPoints: reasoning.strongPoints,
          weakPoints: reasoning.weakPoints,
          priorityActions: reasoning.priorityActions,
        }}
        action={action}
      />
    </SectionShell>
  );
}
