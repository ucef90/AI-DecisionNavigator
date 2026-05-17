import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function WorkflowMapPage(props: PageProps<"/projects/[id]/atelier/5/workflow-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Métier & opérationnel"
      title="Cartographie workflow"
      livrableRef="Couche WORKFLOW"
      intent="Vue processus : étapes, validations, transferts, automatisations."
      pourquoi={["Le workflow révèle le flux réel de bout en bout.", "Indispensable pour identifier les zones IA vs auto vs humain."]}
      cherche={["Étapes ordonnées.", "Validations humaines explicites.", "Annotations sur points critiques."]}
    >
      <LayerView projectId={id} layer="WORKFLOW" graph={snap.cartography?.layers.WORKFLOW} annotations={snap.annotations} />
    </SectionShell>
  );
}
