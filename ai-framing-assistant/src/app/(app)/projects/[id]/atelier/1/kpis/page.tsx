import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { KpisEditor } from "@/components/atelier1/editors/kpis-editor";
import { addKpi, deleteKpi, updateKpi } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function KpisPage(props: PageProps<"/projects/[id]/atelier/1/kpis">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addKpi(id, formData); }
  async function onUpdate(itemId: string, formData: FormData) { "use server"; await updateKpi(id, itemId, formData); }
  async function onDelete(itemId: string) { "use server"; await deleteKpi(id, itemId); }

  const measured = snap.kpis.filter((k) => k.measureStatus === "MEASURED").length;

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="KPI baseline"
      livrableRef="§8 du livrable atelier 1"
      intent="Mesurer la valeur ACTUELLE des KPI — sans baseline, pas de ROI possible."
      pourquoi={[
        "Un projet sans baseline = un projet impossible à évaluer après.",
        "Le sponsor demandera toujours « combien on a gagné ? » — il faut une référence.",
        "Cible (target) sans actuelle (current) = vœu pieux.",
      ]}
      cherche={[
        "Au moins 1 KPI marqué MEASURED.",
        "Valeur actuelle + valeur cible + source.",
        "KPI alignés avec les objectifs.",
      ]}
    >
      <div className="mb-4 text-sm">
        <strong>{measured}/{snap.kpis.length}</strong> KPI réellement mesurés.
      </div>
      <KpisEditor
        items={snap.kpis.map((k) => ({
          id: k.id,
          name: k.name,
          unit: k.unit,
          currentValue: k.currentValue,
          targetValue: k.targetValue,
          source: k.source,
          measureStatus: k.measureStatus,
          notes: k.notes,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
