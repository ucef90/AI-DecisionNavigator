import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function RiskMapPage(props: PageProps<"/projects/[id]/atelier/5/risk-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase D — Risques & gouvernance"
      title="Cartographie risques"
      livrableRef="Couche RISK"
      intent="Risques identifiés positionnés dans le workflow + criticité."
      pourquoi={["La couche risques ancre les risques abstraits dans le système.", "Permet de voir quels nœuds concentrent le risque."]}
      cherche={["Risques CRITICAL annotés.", "Couverture des grands axes (RGPD, hallu, sécurité, biais)."]}
    >
      <LayerView projectId={id} layer="RISK" graph={snap.cartography?.layers.RISK} annotations={snap.annotations} />
    </SectionShell>
  );
}
