import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { GovernanceRolesEditor } from "@/components/atelier6/editors/governance-roles-editor";
import { RaciMatrix, type RaciEntry } from "@/components/visualizations/raci-matrix";
import { addGovernanceRole, deleteGovernanceRole, updateGovernanceRole } from "@/lib/actions/atelier6";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { type RaciType } from "@/types/atelier6";

export default async function A6GovRolesPage(props: PageProps<"/projects/[id]/atelier/6/governance-roles">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addGovernanceRole(id, formData); }
  async function onUpdate(rid: string, formData: FormData) { "use server"; await updateGovernanceRole(id, rid, formData); }
  async function onDelete(rid: string) { "use server"; await deleteGovernanceRole(id, rid); }

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
      {snap.governanceRoles.length > 0 ? (
        <div className="mb-4 rounded-md border border-border bg-background p-4">
          <RaciMatrix actors={actors} scopes={scopes} entries={entries} />
        </div>
      ) : null}

      <GovernanceRolesEditor
        items={snap.governanceRoles.map((r) => ({
          id: r.id,
          scope: r.scope,
          actorRole: r.actorRole,
          responsibilityType: r.responsibilityType,
          actorName: r.actorName,
          description: r.description,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
