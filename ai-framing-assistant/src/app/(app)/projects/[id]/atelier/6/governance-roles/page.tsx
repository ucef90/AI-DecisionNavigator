import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RaciMatrix, type RaciEntry } from "@/components/visualizations/raci-matrix";
import { EmptyState } from "@/components/common/data-block";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { type RaciType } from "@/types/atelier6";

export default async function A6GovRolesPage(props: PageProps<"/projects/[id]/atelier/6/governance-roles">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  const actors = Array.from(new Set(snap.governanceRoles.map((r) => r.actorRole))).sort();
  const scopes = Array.from(new Set(snap.governanceRoles.map((r) => r.scope)));
  const entries: RaciEntry[] = snap.governanceRoles.map((r) => ({
    actorRole: r.actorRole,
    scope: r.scope,
    responsibility: r.responsibilityType as RaciType,
  }));

  return (
    <SectionShell
      phaseLabel="Phase B — Rôles & validations"
      title="Matrice RACI gouvernance"
      livrableRef="§1 du livrable atelier 6"
      intent="Pour chaque scope (pilotage, sécurité, RGPD…), qui est Responsable / Accountable / Consulté / Informé."
      pourquoi={["Sans RACI, responsabilités floues = personne ne valide.", "1 A (Accountable) par scope = règle d'or.", "Atelier 7 (industrialisation) suppose RACI complet."]}
      cherche={["≥ 4 scopes définis.", "Toujours 1 R + 1 A par scope.", "DPO + RSSI + Sponsor présents."]}
    >
      {snap.governanceRoles.length === 0 ? <EmptyState message="Aucun rôle RACI défini." /> : (
        <div className="rounded-md border border-border bg-background p-4">
          <RaciMatrix actors={actors} scopes={scopes} entries={entries} />
        </div>
      )}
    </SectionShell>
  );
}
