import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { QualificationEditor } from "@/components/atelier1/editors/qualification-editor";
import { saveQualification } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function QualificationPage(props: PageProps<"/projects/[id]/atelier/1/qualification">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const q = snap.qualification;

  async function action(formData: FormData) {
    "use server";
    await saveQualification(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase A — Contexte & reformulation"
      title="Fiche de qualification"
      livrableRef="§1 du livrable atelier 1"
      intent="Identifier rapidement le contexte du projet : qui, pourquoi, déclencheurs."
      pourquoi={[
        "Sans qualification, on ne sait pas qui pilote ni d'où vient la demande.",
        "Les drivers révèlent l'urgence réelle (réglementation, surcharge, dégradation service…).",
        "C'est la première page du dossier COPIL.",
      ]}
      cherche={[
        "Direction et sponsor identifiés nommément.",
        "Un déclencheur factuel (événement, KPI, plainte).",
        "Au moins 2-3 drivers cochés.",
      ]}
    >
      <QualificationEditor
        defaults={{
          directionConcerned: q?.directionConcerned ?? "",
          businessOwner: q?.businessOwner ?? "",
          triggerEvent: q?.triggerEvent ?? "",
          priorityReason: q?.priorityReason ?? "",
          strategicAlignment: q?.strategicAlignment ?? "",
          regulatoryPressure: q?.regulatoryPressure ?? false,
          operationalOverload: q?.operationalOverload ?? false,
          serviceDegradation: q?.serviceDegradation ?? false,
          driverVolumeIncrease: q?.driverVolumeIncrease ?? false,
          driverResourceShortage: q?.driverResourceShortage ?? false,
          driverFrequentErrors: q?.driverFrequentErrors ?? false,
          driverPoorUserExperience: q?.driverPoorUserExperience ?? false,
          driverManualWorkflow: q?.driverManualWorkflow ?? false,
          driverLowTraceability: q?.driverLowTraceability ?? false,
          driverHighDelays: q?.driverHighDelays ?? false,
        }}
        action={action}
      />
    </SectionShell>
  );
}
