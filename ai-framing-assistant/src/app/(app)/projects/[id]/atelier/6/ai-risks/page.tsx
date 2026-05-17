import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RiskHeatmap } from "@/components/visualizations/risk-heatmap";
import { EmptyState } from "@/components/common/data-block";
import { computeRiskHeatmap, loadAtelier6Snapshot } from "@/lib/engines/atelier6";

export default async function A6AIRisksPage(props: PageProps<"/projects/[id]/atelier/6/ai-risks">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const heatmap = computeRiskHeatmap(snap);

  return (
    <SectionShell
      phaseLabel="Phase C — Risques & sécurité"
      title="Risques IA — Heatmap probabilité × impact"
      livrableRef="§3 du livrable atelier 6"
      intent="Visualiser les risques IA avec atténuation (mitigation + validations humaines)."
      pourquoi={["La heatmap rend visible ce qui est CRITIQUE.", "Atténuation = mitigation + validations atelier 2.", "Zones rouges = actions prioritaires gouvernance."]}
      cherche={["Aucun risque en zone rouge (16+).", "Mitigation et validations actives → décale les points en zones moins critiques."]}
    >
      {heatmap.length === 0 ? <EmptyState message="Aucun risque IA évalué. Compléter dans le wizard risques." /> : (
        <RiskHeatmap points={heatmap} />
      )}
    </SectionShell>
  );
}
