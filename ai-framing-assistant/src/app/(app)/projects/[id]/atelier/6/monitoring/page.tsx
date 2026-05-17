import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ItemList, EmptyState } from "@/components/common/data-block";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { KPI_CATEGORY_LABELS, KPI_FREQUENCY_LABELS, type KpiCategory, type KpiFrequency } from "@/types/atelier6";

const CAT_COLOR: Record<KpiCategory, string> = {
  PERFORMANCE: "border-sky-500/40",
  QUALITY: "border-emerald-500/40",
  DRIFT: "border-violet-500/40",
  SECURITY: "border-amber-500/40",
  INCIDENT: "border-rose-500/40",
  USAGE: "border-border",
};

export default async function A6MonitoringPage(props: PageProps<"/projects/[id]/atelier/6/monitoring">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Monitoring"
      title="Monitoring & supervision IA"
      livrableRef="§7 du livrable atelier 6"
      intent="KPI à surveiller en production : performance, qualité, dérive, incidents."
      pourquoi={["Sans monitoring, on déploie aveuglément.", "Dérive modèle = silencieuse sans alerte sur score de confiance.", "Atelier 7 (industrialisation) suppose monitoring défini."]}
      cherche={["≥ 3 KPI couvrant performance + qualité + dérive.", "Seuils d'alerte définis.", "Responsable nommé."]}
    >
      {snap.monitoringKpis.length === 0 ? <EmptyState message="Aucun KPI monitoring défini." /> : (
        <ItemList
          items={snap.monitoringKpis}
          empty=""
          render={(k) => (
            <div key={k.id} className={cn("rounded-md border p-3", CAT_COLOR[k.category as KpiCategory] ?? "border-border")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{k.name}</div>
                  <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                    <span>{KPI_FREQUENCY_LABELS[k.frequency as KpiFrequency] ?? k.frequency}</span>
                    {k.responsibleRole ? <span>· {k.responsibleRole}</span> : null}
                  </div>
                  {k.alertThreshold ? <div className="mt-1 text-[10px] text-rose-700 dark:text-rose-300">⚠ Alerte si {k.alertThreshold}</div> : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[9px]">{KPI_CATEGORY_LABELS[k.category as KpiCategory] ?? k.category}</Badge>
                  {k.targetValue ? <Badge variant="outline" className="text-[9px]">🎯 {k.targetValue}{k.unit ?? ""}</Badge> : null}
                </div>
              </div>
            </div>
          )}
        />
      )}
    </SectionShell>
  );
}
