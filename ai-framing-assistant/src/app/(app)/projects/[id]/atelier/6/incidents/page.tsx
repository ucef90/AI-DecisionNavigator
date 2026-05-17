import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { INCIDENT_TYPE_LABELS, type IncidentType } from "@/types/atelier6";

const SEV_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function A6IncidentsPage(props: PageProps<"/projects/[id]/atelier/6/incidents">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Incidents"
      title="Playbook incidents IA"
      livrableRef="§8 du livrable atelier 6"
      intent="Pour chaque type d'incident IA : détection, escalade, actions correctives."
      pourquoi={["Sans playbook, panique en cas d'incident.", "Détection auto + escalade claire = limitation impact.", "Post-mortem = amélioration continue."]}
      cherche={["≥ 2 procédures (hallu, fuite data, classification…).", "Méthode de détection explicite.", "Chemin d'escalade nommé."]}
    >
      <ItemList
        items={snap.incidentProcedures}
        empty="Aucun playbook incident défini."
        render={(p) => (
          <div key={p.id} className={cn("rounded-md border p-3", SEV_COLOR[p.severity as keyof typeof SEV_COLOR])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{INCIDENT_TYPE_LABELS[p.incidentType as IncidentType] ?? p.incidentType}</span>
                  {p.postIncidentReview ? <Badge variant="outline" className="text-[9px]">+ Post-mortem</Badge> : null}
                </div>
                {p.detectionMethod ? <p className="mt-1 text-xs"><strong>Détection :</strong> {p.detectionMethod}</p> : null}
                {p.escalationPath ? <p className="mt-1 text-xs"><strong>Escalade :</strong> {p.escalationPath}</p> : null}
                {p.correctiveActions ? <p className="mt-1 text-xs"><strong>Actions :</strong> {p.correctiveActions}</p> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{p.severity}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
