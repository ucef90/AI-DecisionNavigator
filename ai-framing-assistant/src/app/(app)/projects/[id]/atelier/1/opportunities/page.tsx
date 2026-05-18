import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { OpportunitiesEditor } from "@/components/atelier1/editors/opportunities-editor";
import { addOpportunity, deleteOpportunity, updateOpportunity } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function OpportunitiesPage(props: PageProps<"/projects/[id]/atelier/1/opportunities">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addOpportunity(id, formData); }
  async function onUpdate(oid: string, formData: FormData) { "use server"; await updateOpportunity(id, oid, formData); }
  async function onDelete(oid: string) { "use server"; await deleteOpportunity(id, oid); }

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Opportunités d'amélioration"
      livrableRef="§16 du livrable atelier 1"
      intent="Identifier où simplifier, automatiser, fluidifier, mieux exploiter les données."
      pourquoi={[
        "Les opportunités sont les briques de la roadmap atelier 7.",
        "Estimation gain + effort = priorisation matrice impact/complexité.",
        "Elles confirment ou infirment les hypothèses IA.",
      ]}
      cherche={["≥ 3 opportunités catégorisées.", "Gain estimé en min/heures/€/%.", "Effort grossier (LOW/MEDIUM/HIGH)."]}
    >
      <OpportunitiesEditor
        items={snap.opportunities.map((o) => ({
          id: o.id, title: o.title, description: o.description, category: o.category, estimatedGain: o.estimatedGain, effort: o.effort,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
