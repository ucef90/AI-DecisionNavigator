import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { SecurityEditor } from "@/components/atelier6/editors/security-editor";
import { cn } from "@/lib/utils";
import { addSecurityControl, deleteSecurityControl, updateSecurityControl } from "@/lib/actions/atelier6";
import { computeSecurityCoverage, loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { SECURITY_DOMAIN_LABELS, type SecurityDomain } from "@/types/atelier6";

export default async function A6SecurityPage(props: PageProps<"/projects/[id]/atelier/6/security">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const coverage = computeSecurityCoverage(snap);

  async function onCreate(formData: FormData) { "use server"; await addSecurityControl(id, formData); }
  async function onUpdate(cid: string, formData: FormData) { "use server"; await updateSecurityControl(id, cid, formData); }
  async function onDelete(cid: string) { "use server"; await deleteSecurityControl(id, cid); }

  return (
    <SectionShell
      phaseLabel="Phase C — Risques & sécurité"
      title="Sécurité & accès"
      livrableRef="§4 du livrable atelier 6"
      intent="Contrôles techniques : AUTH, RBAC, chiffrement, logs, monitoring..."
      pourquoi={["Sécurité par défaut = projet IA solide.", "Logs et audit trail = pré-requis gouvernance.", "RBAC = principe moindre privilège."]}
      cherche={["≥ 6 domaines couverts (sur 8).", "Statut IN_PLACE ou TESTED majoritaire."]}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {coverage.map((c) => (
          <div key={c.domain} className={cn("rounded-md border p-2 text-center text-xs",
            c.status === "ACTIVE" ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20" :
            c.status === "PARTIAL" ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20" :
            "border-dashed border-border bg-background",
          )}>
            <div className="font-semibold">{SECURITY_DOMAIN_LABELS[c.domain as SecurityDomain]}</div>
            <div className="mt-1">{c.active}/{c.controls}</div>
          </div>
        ))}
      </div>

      <SecurityEditor
        items={snap.securityControls.map((c) => ({
          id: c.id,
          domain: c.domain,
          name: c.name,
          status: c.status,
          description: c.description,
          responsibleRole: c.responsibleRole,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
