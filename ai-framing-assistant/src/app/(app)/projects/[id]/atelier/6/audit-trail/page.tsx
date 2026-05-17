import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";

export default async function A6AuditTrailPage(props: PageProps<"/projects/[id]/atelier/6/audit-trail">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const logsControl = snap.securityControls.find((c) => c.domain === "LOGS");
  const monitoringControl = snap.securityControls.find((c) => c.domain === "MONITORING");

  return (
    <SectionShell
      phaseLabel="Phase D — Conformité & audit"
      title="Auditabilité & traçabilité"
      livrableRef="§6 du livrable atelier 6"
      intent="Garantir qu'on peut auditer toutes les décisions IA, accès, validations."
      pourquoi={["Sans logs, pas de réponse à un audit RGPD/CNIL.", "Traçabilité = défense légale en cas de litige.", "Décisions IA = explicabilité requise."]}
      cherche={["LOGS : status IN_PLACE ou TESTED.", "MONITORING : alerts SIEM.", "Historique : décisions IA, validations, accès."]}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={cn("rounded-md border p-4", logsControl?.status === "IN_PLACE" || logsControl?.status === "TESTED" ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20")}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Logs & journalisation</div>
            <div className="mt-1 text-lg font-semibold">{logsControl?.status ?? "Non défini"}</div>
            {logsControl?.name ? <p className="mt-1 text-xs">{logsControl.name}</p> : null}
          </div>
          <div className={cn("rounded-md border p-4", monitoringControl?.status === "IN_PLACE" || monitoringControl?.status === "TESTED" ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20")}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monitoring sécurité</div>
            <div className="mt-1 text-lg font-semibold">{monitoringControl?.status ?? "Non défini"}</div>
            {monitoringControl?.name ? <p className="mt-1 text-xs">{monitoringControl.name}</p> : null}
          </div>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Éléments à tracer</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm">
            <li>Décisions IA (entrée, sortie, score de confiance)</li>
            <li>Validations humaines (validateur, timestamp, motif)</li>
            <li>Accès aux données (utilisateur, ressource, action)</li>
            <li>Incidents et leur traitement</li>
            <li>Modifications de configuration / paramètres modèle</li>
          </ul>
        </div>

        <Link href={`/projects/${id}/atelier/6/security`} className="inline-block text-xs underline">
          ← Configurer les contrôles LOGS / MONITORING (Sécurité)
        </Link>
      </div>
    </SectionShell>
  );
}
