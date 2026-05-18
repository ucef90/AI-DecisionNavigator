import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ImpactsEditor } from "@/components/atelier1/editors/impacts-editor";
import { addImpact, deleteImpact, updateImpact } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ImpactsPage(props: PageProps<"/projects/[id]/atelier/1/impacts">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addImpact(id, formData); }
  async function onUpdate(iid: string, formData: FormData) { "use server"; await updateImpact(id, iid, formData); }
  async function onDelete(iid: string) { "use server"; await deleteImpact(id, iid); }

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Impacts opérationnels"
      livrableRef="§5 du livrable atelier 1"
      intent="Mesurer les conséquences des irritants : sur agents, usagers, organisation, finance."
      pourquoi={[
        "Les impacts justifient le ROI du projet auprès du sponsor.",
        "Ils révèlent l'urgence réelle (regulatory > satisfaction > coût…).",
        "Chiffrer les impacts crée des points de comparaison post-projet.",
      ]}
      cherche={["Au moins 3 impacts sur 3 axes différents.", "Chiffrage quand possible.", "Niveau de sévérité critique/élevé pour les vrais leviers."]}
    >
      <ImpactsEditor
        items={snap.impacts.map((i) => ({
          id: i.id, axis: i.axis, description: i.description, severity: i.severity, direction: i.direction, metric: i.metric,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
