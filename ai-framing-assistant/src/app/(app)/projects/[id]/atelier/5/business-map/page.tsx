import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function BusinessMapPage(props: PageProps<"/projects/[id]/atelier/5/business-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Métier & opérationnel"
      title="Cartographie métier"
      livrableRef="Couche BUSINESS"
      intent="Vue métier : besoin, utilisateurs, KPI, irritants, valeur."
      pourquoi={["La couche métier ancre le projet dans la réalité.", "Sans elle, l'IA est désincarnée."]}
      cherche={["Acteurs identifiés.", "Besoin et valeur clairs.", "Annotations sur points critiques."]}
    >
      <LayerView projectId={id} layer="BUSINESS" graph={snap.cartography?.layers.BUSINESS} annotations={snap.annotations} />
    </SectionShell>
  );
}
