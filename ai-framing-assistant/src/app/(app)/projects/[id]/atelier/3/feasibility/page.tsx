import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ScoreAxesEditor } from "@/components/atelier3/editors/score-axes-editor";
import { safeJSON } from "@/components/common/data-block";
import { SelectField } from "@/components/atelier1/editors/form-fields";
import { Textarea } from "@/components/ui/textarea";
import { A3_OVERALL_FEASIBILITIES, A3_OVERALL_FEASIBILITY_LABELS } from "@/types/atelier3";
import { saveFeasibilityAssessment } from "@/lib/actions/atelier3";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

const AXES = [
  { name: "technicallyFeasible", label: "Faisabilité technique", axisKey: "technicallyFeasible" },
  { name: "organizationallyFeasible", label: "Faisabilité organisationnelle", axisKey: "organizationallyFeasible" },
  { name: "regulatorilyFeasible", label: "Faisabilité réglementaire", axisKey: "regulatorilyFeasible" },
  { name: "resourcesAvailable", label: "Ressources disponibles", axisKey: "resourcesAvailable" },
  { name: "dataAvailable", label: "Données disponibles", axisKey: "dataAvailable" },
];

export default async function A3FeasibilityPage(props: PageProps<"/projects/[id]/atelier/3/feasibility">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const f = snap.feasibility;

  async function action(formData: FormData) {
    "use server";
    await saveFeasibilityAssessment(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase C — Maturité & faisabilité"
      title="Faisabilité globale"
      livrableRef="§15 du livrable atelier 3"
      intent="Évaluer la faisabilité sur 5 axes + lister bloquants et leviers."
      pourquoi={["Le maillon faible détermine la faisabilité globale.", "Atelier 4 (axe faisabilité) consomme directement ces scores."]}
      cherche={["Tous les axes scorés (1-5).", "Bloquants/leviers explicites.", "Verdict global cohérent."]}
    >
      <ScoreAxesEditor
        axes={AXES}
        defaults={{
          technicallyFeasible: f?.technicallyFeasible ?? null,
          organizationallyFeasible: f?.organizationallyFeasible ?? null,
          regulatorilyFeasible: f?.regulatorilyFeasible ?? null,
          resourcesAvailable: f?.resourcesAvailable ?? null,
          dataAvailable: f?.dataAvailable ?? null,
        }}
        notesName="notes"
        notesLabel="Notes"
        notesDefaultValue={f?.notes ?? ""}
        action={action}
        extraAfter={
          <div className="space-y-3">
            <SelectField
              label="Verdict global de faisabilité"
              name="overallFeasibility"
              defaultValue={f?.overallFeasibility ?? "MEDIUM"}
              options={A3_OVERALL_FEASIBILITIES.map((v) => ({ value: v, label: A3_OVERALL_FEASIBILITY_LABELS[v] }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bloquants (un par ligne)</label>
                <Textarea name="blockingFactors" rows={3} defaultValue={safeJSON<string[]>(f?.blockingFactors, []).join("\n")} placeholder={"ex. API CRM à exposer\nHistorique étiquetage à constituer"} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Leviers (un par ligne)</label>
                <Textarea name="enablers" rows={3} defaultValue={safeJSON<string[]>(f?.enablers, []).join("\n")} placeholder={"ex. Sponsor engagé\nÉquipe data interne disponible"} />
              </div>
            </div>
          </div>
        }
      />
    </SectionShell>
  );
}
