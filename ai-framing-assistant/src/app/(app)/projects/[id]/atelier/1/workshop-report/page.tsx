import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, ListBlock, safeJSON, EmptyState } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function WorkshopReportPage(props: PageProps<"/projects/[id]/atelier/1/workshop-report">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const w = snap.workshopReport;

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Compte-rendu d'atelier"
      livrableRef="§17 du livrable atelier 1"
      intent="Trace officielle de l'atelier : participants, décisions, actions, risques identifiés."
      pourquoi={[
        "Indispensable pour la traçabilité projet et l'onboarding nouvelles personnes.",
        "Aligne tous les acteurs sur ce qui a été dit/décidé.",
        "Sert d'audit trail pour la gouvernance atelier 6.",
      ]}
      cherche={[
        "Participants nommés avec leur rôle.",
        "Décisions actées + actions avec owner et échéance.",
        "Zones à approfondir explicitement listées.",
      ]}
    >
      {!w ? <EmptyState message="Compte-rendu non rédigé." /> : (
        <div className="space-y-4">
          {w.workshopDate ? (
            <Badge variant="outline">Atelier du {new Date(w.workshopDate).toISOString().slice(0, 10)}</Badge>
          ) : null}

          {w.participants ? (
            <div className="rounded-md border border-border bg-background p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participants</h3>
              <ul className="space-y-1 text-sm">
                {safeJSON<{ name: string; role: string }[]>(w.participants, []).map((p, i) => (
                  <li key={i}>• <strong>{p.name}</strong> — {p.role}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <DataBlock title="Objectifs de l'atelier" body={w.objectives} />
          <ListBlock title="Sujets abordés" items={safeJSON<string[]>(w.topicsCovered, [])} />
          <DataBlock title="Points importants identifiés" body={w.keyFindings} />
          <DataBlock title="Risques identifiés" body={w.identifiedRisks} />
          <DataBlock title="Décisions prises" body={w.decisionsMade} />
          <DataBlock title="Zones à approfondir" body={w.openTopics} />

          {w.actionsToTake ? (
            <div className="rounded-md border border-border bg-background p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions à mener</h3>
              <ul className="space-y-1 text-sm">
                {safeJSON<{ action: string; owner: string; due: string }[]>(w.actionsToTake, []).map((a, i) => (
                  <li key={i}>• <strong>{a.action}</strong> — {a.owner} <em>(d&apos;ici {a.due})</em></li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
