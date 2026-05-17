import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function GovernanceMapPage(props: PageProps<"/projects/[id]/atelier/5/governance-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase D — Risques & gouvernance"
      title="Cartographie gouvernance"
      livrableRef="Couche GOVERNANCE"
      intent="Rôles, validations, contrôles, audits."
      pourquoi={["Couche pivot pour l'atelier 6 (gouvernance complète).", "Identifie les manques de supervision."]}
      cherche={["DPO + RSSI + Sponsor présents.", "Validations humaines connectées au workflow."]}
    >
      <LayerView projectId={id} layer="GOVERNANCE" graph={snap.cartography?.layers.GOVERNANCE} annotations={snap.annotations} />
    </SectionShell>
  );
}
