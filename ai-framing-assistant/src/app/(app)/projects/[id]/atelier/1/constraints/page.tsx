import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ConstraintsEditor } from "@/components/atelier1/editors/constraints-editor";
import { addConstraint, deleteConstraint, updateConstraint } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ConstraintsPage(props: PageProps<"/projects/[id]/atelier/1/constraints">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addConstraint(id, formData); }
  async function onUpdate(cid: string, formData: FormData) { "use server"; await updateConstraint(id, cid, formData); }
  async function onDelete(cid: string) { "use server"; await deleteConstraint(id, cid); }

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Contraintes métier"
      livrableRef="§14 du livrable atelier 1"
      intent="Lister ce qui borne le projet : réglo, budget, calendrier, SI, organisation."
      pourquoi={[
        "Contraintes non explicitées = surprises pendant l'exécution.",
        "Elles conditionnent la faisabilité atelier 3.",
        "Les contraintes BLOCKING doivent être adressées avant POC.",
      ]}
      cherche={["≥ 3 contraintes typées.", "Niveau d'impact (LOW → BLOCKING).", "Source identifiée."]}
    >
      <ConstraintsEditor
        items={snap.constraints.map((c) => ({
          id: c.id, constraintType: c.constraintType, description: c.description, impactLevel: c.impactLevel, source: c.source,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
