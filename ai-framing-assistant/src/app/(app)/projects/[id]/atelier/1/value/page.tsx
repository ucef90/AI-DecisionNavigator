import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { BusinessNeedEditor } from "@/components/atelier1/editors/business-need-editor";
import { saveBusinessNeed } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ValuePage(props: PageProps<"/projects/[id]/atelier/1/value">) {
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
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="Valeur attendue"
      livrableRef="§12 du livrable atelier 1"
      intent="Décrire la valeur métier attendue : gain temps, qualité, satisfaction, conformité, pilotage."
      pourquoi={[
        "La valeur attendue justifie l'investissement projet.",
        "Sans valeur claire, le scoring atelier 4 (axe valeur métier) sera faible.",
        "C'est le pitch sponsor : « voici pourquoi ça en vaut la peine ».",
      ]}
      cherche={[
        "Une description sur plusieurs axes (ops, qualité, expérience, pilotage).",
        "Chiffrage si possible (ROI, ETP libéré, NPS visé).",
      ]}
    >
      <BusinessNeedEditor
        variant="value"
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
