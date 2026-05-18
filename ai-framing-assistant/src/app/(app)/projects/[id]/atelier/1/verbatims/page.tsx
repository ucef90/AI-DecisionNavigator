import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { VerbatimsEditor } from "@/components/atelier1/editors/verbatims-editor";
import { addVerbatim, deleteVerbatim, updateVerbatim } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function VerbatimsPage(props: PageProps<"/projects/[id]/atelier/1/verbatims">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addVerbatim(id, formData); }
  async function onUpdate(vid: string, formData: FormData) { "use server"; await updateVerbatim(id, vid, formData); }
  async function onDelete(vid: string) { "use server"; await deleteVerbatim(id, vid); }

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Voix du terrain (verbatim)"
      livrableRef="Ajout méthodologique"
      intent="Citations brutes d'usagers et agents — donne de la crédibilité au COPIL."
      pourquoi={[
        "Les chiffres convainquent, les verbatim émeuvent — le COPIL a besoin des deux.",
        "Un verbatim agent vaut mille pages de diagnostic.",
        "Source : interview, observation terrain, plaintes écrites.",
      ]}
      cherche={["2-5 verbatims représentatifs.", "Source clairement identifiée.", "Thème (délai, charge, qualité…)."]}
    >
      <VerbatimsEditor
        items={snap.verbatims.map((v) => ({
          id: v.id, quote: v.quote, speakerRole: v.speakerRole, speakerName: v.speakerName, source: v.source, sentiment: v.sentiment, theme: v.theme,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
