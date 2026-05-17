import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { IMPACT_AXIS_LABELS, IMPACT_SEVERITY_LABELS, type ImpactAxis, type ImpactSeverity } from "@/types/atelier1";

const SEV_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function ImpactsPage(props: PageProps<"/projects/[id]/atelier/1/impacts">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Impacts opérationnels"
      livrableRef="§5 du livrable atelier 1"
      intent="Mesurer les conséquences des irritants : sur agents, usagers, organisation, finance."
      pourquoi={[
        "Les impacts justifient le ROI du projet auprès du sponsor.",
        "Ils révèlent l'urgence réelle (regulatory > satisfaction > coût…).",
        "Chiffrer les impacts crée des points de comparaison post-projet.",
      ]}
      cherche={[
        "Au moins 3 impacts sur 3 axes différents.",
        "Chiffrage quand possible (% , nb, €).",
        "Niveau de sévérité critique/élevé pour les vrais leviers.",
      ]}
    >
      <ItemList
        items={snap.impacts}
        empty="Aucun impact mesuré."
        render={(i) => (
          <div key={i.id} className={cn("rounded-md border p-3", SEV_COLOR[i.severity as ImpactSeverity] ?? "border-border")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-semibold">{IMPACT_AXIS_LABELS[i.axis as ImpactAxis] ?? i.axis}</div>
                <p className="mt-1 text-xs">{i.description}</p>
                {i.metric ? <Badge variant="outline" className="mt-2 text-[10px]">📊 {i.metric}</Badge> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{IMPACT_SEVERITY_LABELS[i.severity as ImpactSeverity] ?? i.severity}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
