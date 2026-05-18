import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RegulatoryEditor } from "@/components/atelier3/editors/regulatory-editor";
import { safeJSON } from "@/components/common/data-block";
import { saveRegulatoryAnalysis } from "@/lib/actions/atelier3";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3RegulatoryPage(props: PageProps<"/projects/[id]/atelier/3/regulatory">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const r = snap.regulatoryAnalysis;

  async function action(formData: FormData) {
    "use server";
    await saveRegulatoryAnalysis(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase B — Compléments d'analyse"
      title="Analyse réglementaire"
      livrableRef="§11 du livrable atelier 3"
      intent="RGPD, EU AI Act, obligations légales — pré-requis avant POC IA."
      pourquoi={[
        "EU AI Act : applicable. Tier mal classé = projet rejeté.",
        "RGPD : minimisation, droits personnes, durée conservation.",
        "DPO non consulté = risque CRITIQUE si données personnelles.",
      ]}
      cherche={["DPO consulté.", "EU AI Act tier défini.", "Obligations légales listées."]}
    >
      <RegulatoryEditor
        defaults={{
          rgpdApplicable: r?.rgpdApplicable ?? true,
          sensitiveDataConcerned: r?.sensitiveDataConcerned ?? false,
          legalObligationsText: safeJSON<string[]>(r?.legalObligations, []).join("\n"),
          auditRequired: r?.auditRequired ?? false,
          dpoConsulted: r?.dpoConsulted ?? false,
          cnilConsultation: r?.cnilConsultation ?? false,
          euAiActTier: r?.euAiActTier ?? "NONE",
          euAiActJustification: r?.euAiActJustification ?? "",
          notes: r?.notes ?? "",
        }}
        action={action}
      />
    </SectionShell>
  );
}
