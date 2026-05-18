import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ScoreAxesEditor } from "@/components/atelier3/editors/score-axes-editor";
import { saveMaturityAssessment } from "@/lib/actions/atelier3";
import { loadAtelier3Snapshot, deriveMaturity } from "@/lib/engines/atelier3";

const AXES = [
  { name: "needClarity", label: "Clarté du besoin", axisKey: "needClarity" },
  { name: "workflowKnowledge", label: "Connaissance workflow", axisKey: "workflowKnowledge" },
  { name: "dataMaturity", label: "Maturité data", axisKey: "dataMaturity" },
  { name: "governanceMaturity", label: "Gouvernance", axisKey: "governanceMaturity" },
  { name: "stakeholderAlignment", label: "Alignement stakeholders", axisKey: "stakeholderAlignment" },
  { name: "realismLevel", label: "Réalisme", axisKey: "realismLevel" },
];

export default async function A3MaturityPage(props: PageProps<"/projects/[id]/atelier/3/maturity">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const m = snap.maturity;
  const derived = deriveMaturity(snap);

  async function action(formData: FormData) {
    "use server";
    await saveMaturityAssessment(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase C — Maturité & faisabilité"
      title="Maturité projet (auto-évaluation)"
      livrableRef="§14 du livrable atelier 3"
      intent="Auto-évaluation maturité (CDP) + maturité dérivée (moteur) — révèle les écarts."
      pourquoi={["Auto-éval seule = subjective. Moteur seul = aveugle au contexte.", "L'écart auto/dérivé révèle les angles morts."]}
      cherche={["Tous les axes auto-évalués (1-5).", "Notes d'auto-évaluation expliquées."]}
    >
      <div className="mb-4 rounded-md border border-foreground/15 bg-muted/30 p-3 text-xs">
        <strong>Maturité dérivée par le moteur :</strong> {derived.overall}
        <span className="ml-2 text-muted-foreground">
          (Besoin {derived.needClarity}/5, Workflow {derived.workflowKnowledge}/5, Data {derived.dataMaturity}/5,
          Gouv {derived.governanceMaturity}/5, Align {derived.stakeholderAlignment}/5, Réalisme {derived.realismLevel}/5)
        </span>
      </div>
      <ScoreAxesEditor
        axes={AXES}
        defaults={{
          needClarity: m?.needClarity ?? null,
          workflowKnowledge: m?.workflowKnowledge ?? null,
          dataMaturity: m?.dataMaturity ?? null,
          governanceMaturity: m?.governanceMaturity ?? null,
          stakeholderAlignment: m?.stakeholderAlignment ?? null,
          realismLevel: m?.realismLevel ?? null,
        }}
        notesName="selfAssessmentNotes"
        notesLabel="Notes d'auto-évaluation"
        notesDefaultValue={m?.selfAssessmentNotes ?? ""}
        action={action}
      />
    </SectionShell>
  );
}
