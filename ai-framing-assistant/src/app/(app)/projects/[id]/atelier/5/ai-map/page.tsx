import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { LayerView } from "@/components/atelier5/layer-view";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function AIMapPage(props: PageProps<"/projects/[id]/atelier/5/ai-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase C — Data & IA"
      title="Cartographie technologies / IA"
      livrableRef="Couche TECHNOLOGY"
      intent="Briques IA + technos d'orchestration + APIs."
      pourquoi={["Voir le mix techno cible en 1 vue.", "Vérifier que les briques s'enchaînent logiquement.", "Repérer les composants IA critiques."]}
      cherche={["Briques IA isolées (OCR, NLP, ML, LLM, RAG).", "Orchestrateur (BPM) présent.", "APIs d'intégration listées."]}
    >
      <LayerView projectId={id} layer="TECHNOLOGY" graph={snap.cartography?.layers.TECHNOLOGY} annotations={snap.annotations} />
    </SectionShell>
  );
}
