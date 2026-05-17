import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function QualificationPage(props: PageProps<"/projects/[id]/atelier/1/qualification">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const q = snap.qualification;

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
      {!q ? <EmptyState message="Fiche de qualification non remplie." /> : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DataBlock title="Direction concernée" body={q.directionConcerned} />
            <DataBlock title="Sponsor métier" body={q.businessOwner} />
          </div>
          <DataBlock title="Déclencheur" body={q.triggerEvent} />
          <DataBlock title="Pourquoi prioritaire" body={q.priorityReason} />
          <DataBlock title="Alignement stratégique" body={q.strategicAlignment} />

          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Drivers identifiés
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {q.regulatoryPressure ? <Badge variant="outline">Pression réglementaire</Badge> : null}
              {q.operationalOverload ? <Badge variant="outline">Surcharge opérationnelle</Badge> : null}
              {q.serviceDegradation ? <Badge variant="outline">Dégradation service</Badge> : null}
              {q.driverVolumeIncrease ? <Badge variant="outline">Hausse volumétrie</Badge> : null}
              {q.driverResourceShortage ? <Badge variant="outline">Manque ressources</Badge> : null}
              {q.driverFrequentErrors ? <Badge variant="outline">Erreurs fréquentes</Badge> : null}
              {q.driverPoorUserExperience ? <Badge variant="outline">Mauvaise expérience</Badge> : null}
              {q.driverManualWorkflow ? <Badge variant="outline">Workflow manuel</Badge> : null}
              {q.driverLowTraceability ? <Badge variant="outline">Faible traçabilité</Badge> : null}
              {q.driverHighDelays ? <Badge variant="outline">Délais élevés</Badge> : null}
            </div>
          </div>

          {q.workshopParticipants ? (
            <div className="rounded-md border border-border bg-background p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Participants atelier
                {q.workshopDate ? ` — ${new Date(q.workshopDate).toISOString().slice(0, 10)}` : ""}
              </h3>
              <ul className="space-y-1 text-sm">
                {safeJSON<{ name: string; role: string }[]>(q.workshopParticipants, []).map((p, i) => (
                  <li key={i}>• <strong>{p.name}</strong> — {p.role}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
