import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ObjectivesEditor } from "@/components/atelier1/editors/objectives-editor";
import { addObjective, deleteObjective, updateObjective } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ObjectivesPage(props: PageProps<"/projects/[id]/atelier/1/objectives">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addObjective(id, formData); }
  async function onUpdate(oid: string, formData: FormData) { "use server"; await updateObjective(id, oid, formData); }
  async function onDelete(oid: string) { "use server"; await deleteObjective(id, oid); }

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="Objectifs métier"
      livrableRef="§7 du livrable atelier 1"
      intent="Lister les résultats attendus avec priorité (1 = top, 5 = bas)."
      pourquoi={[
        "Les objectifs vont conditionner le scoring atelier 4 (axe valeur métier).",
        "La priorisation explicite évite que tout soit « important » (donc rien).",
        "Ils sont la base de la décision finale atelier 7.",
      ]}
      cherche={["Au moins 3 objectifs catégorisés.", "Priorité 1-2 pour les vrais leviers.", "Lien explicite vers un KPI cible quand possible."]}
    >
      <ObjectivesEditor
        items={[...snap.objectives].sort((a, b) => a.priority - b.priority).map((o) => ({
          id: o.id, title: o.title, description: o.description, priority: o.priority, category: o.category,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
