import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ActorsEditor } from "@/components/atelier1/editors/actors-editor";
import { addActor, deleteActor, updateActor } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ActorsPage(props: PageProps<"/projects/[id]/atelier/1/actors">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addActor(id, formData); }
  async function onUpdate(actorId: string, formData: FormData) { "use server"; await updateActor(id, actorId, formData); }
  async function onDelete(actorId: string) { "use server"; await deleteActor(id, actorId); }

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Acteurs & utilisateurs"
      livrableRef="§6 du livrable atelier 1"
      intent="Cartographier tous les acteurs : usagers, agents, managers, IT, gouvernance."
      pourquoi={[
        "Sans cartographie acteurs, on ne sait pas pour qui on conçoit.",
        "L'identification des acteurs révèle les douleurs et les gains par catégorie.",
        "Indispensable pour le RACI atelier 6 et le change management atelier 7.",
      ]}
      cherche={[
        "Au moins 3 catégories d'acteurs (USER, AGENT, MANAGER…).",
        "Volume estimé (nb de personnes).",
        "Douleur actuelle et gain attendu par acteur.",
      ]}
    >
      <ActorsEditor
        items={snap.actors.map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          role: a.role,
          volume: a.volume,
          involvement: a.involvement,
          currentPain: a.currentPain,
          expectedGain: a.expectedGain,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
