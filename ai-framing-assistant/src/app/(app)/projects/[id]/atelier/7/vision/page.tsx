import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { VisionEditor } from "@/components/atelier7/editors/vision-editor";
import { safeJSON } from "@/components/common/data-block";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { saveStrategicVision } from "@/lib/actions/atelier7";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

export default async function VisionSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/vision">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();
  const v = snap.vision;

  async function action(formData: FormData) { "use server"; await saveStrategicVision(id, formData); }

  return (
    <SectionShell
      phaseLabel="Phase B — Vision & architecture"
      title="Vision stratégique"
      livrableRef="§1 du livrable atelier 7"
      intent="Énoncé de vision, objectifs stratégiques, valeur business attendue."
      pourquoi={[
        "C'est l'énoncé qui rallie sponsor + équipes + direction.",
        "Sans vision claire, le projet dérive au gré des opportunités techniques.",
        "C'est aussi le pitch d'entrée du dossier COPIL.",
      ]}
      cherche={[
        "Une vision MÉTIER (pas techno).",
        "Des objectifs stratégiques mesurables (3-5 max).",
        "Une valeur business chiffrée si possible (ROI, gain).",
        "Des critères de succès SMART.",
      ]}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <KpiCard label="Score valeur business" value={`${v?.businessValueScore ?? 0}/5`} tone={(v?.businessValueScore ?? 0) >= 4 ? "good" : "warn"} />
        <KpiCard label="Score transformation" value={`${v?.transformationScore ?? 0}/5`} tone={(v?.transformationScore ?? 0) >= 4 ? "good" : "warn"} />
      </div>

      <VisionEditor
        defaults={{
          visionStatement: v?.visionStatement ?? "",
          businessValue: v?.businessValue ?? "",
          strategicObjectivesText: safeJSON<string[]>(v?.strategicObjectives, []).join("\n"),
          transformationGoalsText: safeJSON<string[]>(v?.transformationGoals, []).join("\n"),
          successCriteriaText: safeJSON<string[]>(v?.successCriteria, []).join("\n"),
          businessValueScore: v?.businessValueScore ?? null,
          transformationScore: v?.transformationScore ?? null,
        }}
        action={action}
      />
    </SectionShell>
  );
}
