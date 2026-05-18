import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { BusinessNeedEditor } from "@/components/atelier1/editors/business-need-editor";
import { saveBusinessNeed } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ReformulationPage(props: PageProps<"/projects/[id]/atelier/1/reformulation">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const bn = snap.businessNeed;

  async function action(formData: FormData) {
    "use server";
    await saveBusinessNeed(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase A — Contexte & reformulation"
      title="Reformulation du besoin"
      livrableRef="§2 du livrable atelier 1"
      intent="Transformer une demande vague (souvent orientée techno) en problème métier mesurable."
      pourquoi={[
        "« Nous voulons de l'IA » n'est pas un besoin métier — c'est une solution imposée.",
        "La reformulation oblige à décrire le PROBLÈME, pas la techno.",
        "Sans reformulation propre, le scoring atelier 4 sera flou.",
      ]}
      cherche={[
        "Une formulation SANS mention de techno (IA, LLM, chatbot…).",
        "Description du problème, de l'impact, de l'objectif mesurable.",
        "Au moins 60 caractères pour donner un sens.",
      ]}
      exemples={{
        mauvais: "Nous voulons mettre en place de l'IA pour automatiser les emails.",
        bon: "Réduire le délai de traitement des emails entrants de 18 à 5 jours et améliorer la classification (passer de 88% à 95% de routage correct).",
      }}
    >
      <BusinessNeedEditor
        variant="reformulation"
        defaults={{
          initialRequest: bn?.initialRequest ?? "",
          reformulatedNeed: bn?.reformulatedNeed ?? "",
          expectedValue: bn?.expectedValue ?? "",
          expectedOutcome: bn?.expectedOutcome ?? "",
          usersImpacted: bn?.usersImpacted ?? "",
          problemStatement: bn?.problemStatement ?? "",
          currentImpactSummary: bn?.currentImpactSummary ?? "",
          expectedResultSummary: bn?.expectedResultSummary ?? "",
        }}
        action={action}
      />
    </SectionShell>
  );
}
