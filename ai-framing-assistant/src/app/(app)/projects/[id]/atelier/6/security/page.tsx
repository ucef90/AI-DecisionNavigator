import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeSecurityCoverage, loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { SECURITY_DOMAIN_LABELS, SECURITY_STATUS_COLORS, SECURITY_STATUS_LABELS, type SecurityDomain, type SecurityStatus } from "@/types/atelier6";

export default async function A6SecurityPage(props: PageProps<"/projects/[id]/atelier/6/security">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const coverage = computeSecurityCoverage(snap);

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

      <ItemList
        items={snap.securityControls}
        empty="Aucun contrôle sécurité listé."
        render={(c) => (
          <div key={c.id} className={cn("rounded-md border p-3", SECURITY_STATUS_COLORS[c.status as SecurityStatus])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{c.name}</div>
                {c.description ? <p className="mt-1 text-xs">{c.description}</p> : null}
                {c.responsibleRole ? <p className="mt-1 text-[11px] italic text-muted-foreground">Responsable : {c.responsibleRole}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{SECURITY_DOMAIN_LABELS[c.domain as SecurityDomain] ?? c.domain}</Badge>
                <Badge variant="outline" className="text-[9px]">{SECURITY_STATUS_LABELS[c.status as SecurityStatus] ?? c.status}</Badge>
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
