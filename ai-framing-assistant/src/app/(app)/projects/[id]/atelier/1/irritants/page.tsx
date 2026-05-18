import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { IrritantsEditor } from "@/components/atelier1/editors/irritants-editor";
import { addIrritant, deleteIrritant, updateIrritant } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function IrritantsPage(props: PageProps<"/projects/[id]/atelier/1/irritants">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addIrritant(id, formData); }
  async function onUpdate(itemId: string, formData: FormData) { "use server"; await updateIrritant(id, itemId, formData); }
  async function onDelete(itemId: string) { "use server"; await deleteIrritant(id, itemId); }

  const totalTime = snap.irritants.reduce((s, i) => s + (i.estimatedTimeWastedMinPerDay ?? 0), 0);

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Irritants & points de friction"
      livrableRef="§4 + §15 du livrable (fusionnés)"
      intent="Lister les frictions opérationnelles concrètes, chiffrées si possible."
      pourquoi={[
        "Les irritants sont la matière première du projet — c'est ce qu'on cherche à réduire.",
        "Sans chiffrage (min/jour), pas de ROI possible.",
        "Catégoriser permet d'identifier les patterns récurrents (lecture, double saisie…).",
      ]}
      cherche={[
        "Au moins 3 irritants avec sévérité.",
        "Temps perdu estimé par jour quand pertinent.",
        "Catégorie typée (pas juste « divers »).",
      ]}
    >
      {totalTime > 0 ? (
        <div className="mb-4 rounded-md border border-rose-500/30 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
          <strong>{totalTime} min/jour perdus</strong> = {Math.round(totalTime / 60 * 10) / 10}h/jour/agent au total estimé.
        </div>
      ) : null}
      <IrritantsEditor
        items={snap.irritants.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          severity: i.severity,
          impactedActor: i.impactedActor,
          frequency: i.frequency,
          estimatedTimeWastedMinPerDay: i.estimatedTimeWastedMinPerDay,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
