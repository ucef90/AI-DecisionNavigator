import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { IncidentsEditor } from "@/components/atelier6/editors/incidents-editor";
import { addIncidentProcedure, deleteIncidentProcedure, updateIncidentProcedure } from "@/lib/actions/atelier6";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";

export default async function A6IncidentsPage(props: PageProps<"/projects/[id]/atelier/6/incidents">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addIncidentProcedure(id, formData); }
  async function onUpdate(pid: string, formData: FormData) { "use server"; await updateIncidentProcedure(id, pid, formData); }
  async function onDelete(pid: string) { "use server"; await deleteIncidentProcedure(id, pid); }

  return (
    <SectionShell
      phaseLabel="Phase E — Incidents"
      title="Playbook incidents IA"
      livrableRef="§8 du livrable atelier 6"
      intent="Pour chaque type d'incident IA : détection, escalade, actions correctives."
      pourquoi={["Sans playbook, panique en cas d'incident.", "Détection auto + escalade claire = limitation impact.", "Post-mortem = amélioration continue."]}
      cherche={["≥ 2 procédures (hallu, fuite data, classification…).", "Méthode de détection explicite.", "Chemin d'escalade nommé."]}
    >
      <IncidentsEditor
        items={snap.incidentProcedures.map((p) => ({
          id: p.id,
          incidentType: p.incidentType,
          severity: p.severity,
          detectionMethod: p.detectionMethod,
          escalationPath: p.escalationPath,
          correctiveActions: p.correctiveActions,
          postIncidentReview: p.postIncidentReview,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
