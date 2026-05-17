import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, ListBlock, safeJSON } from "@/components/common/data-block";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function A5SynthesisPage(props: PageProps<"/projects/[id]/atelier/5/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();
  const s = snap.synthesis;

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse + gate"
      title="Synthèse cartographique"
      livrableRef="Synthèse atelier 5"
      intent="Vision système globale + nœuds critiques + observations gouvernance."
      pourquoi={["Cristallise les observations issues des 6 cartos.", "Prépare l'atelier 6 (gouvernance/risques)."]}
      cherche={["Vision système rédigée.", "Nœuds critiques listés.", "Hotspots gouvernance flaggés."]}
    >
      {!s ? <EmptyState message="Synthèse non rédigée." /> : (
        <div className="space-y-3">
          <DataBlock title="Vue système globale" body={s.systemOverview} />
          <ListBlock title="Nœuds critiques" items={safeJSON<string[]>(s.criticalNodes, [])} />
          <ListBlock title="Composants manquants" items={safeJSON<string[]>(s.missingComponents, [])} />
          <DataBlock title="Observations gouvernance" body={s.governanceObservations} />
          <DataBlock title="Hotspots pour atelier 6" body={s.governanceHotspots} />
        </div>
      )}
    </SectionShell>
  );
}
