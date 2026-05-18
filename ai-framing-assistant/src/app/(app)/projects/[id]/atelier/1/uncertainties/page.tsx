import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { UncertaintiesEditor } from "@/components/atelier1/editors/uncertainties-editor";
import { addUncertainty, deleteUncertainty, updateUncertainty } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function UncertaintiesPage(props: PageProps<"/projects/[id]/atelier/1/uncertainties">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addUncertainty(id, formData); }
  async function onUpdate(uid: string, formData: FormData) { "use server"; await updateUncertainty(id, uid, formData); }
  async function onDelete(uid: string) { "use server"; await deleteUncertainty(id, uid); }

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Zones floues & incertitudes"
      livrableRef="§10 du livrable atelier 1"
      intent="Lister ce qu'on NE SAIT PAS encore — et qui peut faire dérailler le projet."
      pourquoi={[
        "Une hypothèse est une affirmation à vérifier ; une incertitude est une question ouverte.",
        "Les incertitudes critiques bloquent l'atelier 7 si non résolues.",
      ]}
      cherche={["≥ 3 incertitudes formulées en questions.", "Sévérité explicite.", "Responsable et résolution si trouvée."]}
    >
      <UncertaintiesEditor
        items={snap.uncertainties.map((u) => ({
          id: u.id, topic: u.topic, question: u.question, severity: u.severity, status: u.status, ownerToAsk: u.ownerToAsk, resolution: u.resolution,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
