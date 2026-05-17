import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function DataMapPage(props: PageProps<"/projects/[id]/atelier/5/data-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase C — Data & IA"
      title="Cartographie data"
      livrableRef="Couche DATA"
      intent="Sources de données, flux, transformations, sensibilité."
      pourquoi={["Data = matière première IA. Sources peu fiables = IA peu fiable.", "Sensibilité conditionne la conformité RGPD."]}
      cherche={["Sources principales identifiées.", "Flux et transformations cartographiés.", "Données sensibles flaggées."]}
    >
      <LayerView projectId={id} layer="DATA" graph={snap.cartography?.layers.DATA} annotations={snap.annotations} />
    </SectionShell>
  );
}
