import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { KPI_MEASURE_STATUS_LABELS, type KpiMeasureStatus } from "@/types/atelier1";

const STATUS_COLOR = {
  NOT_MEASURED: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  ESTIMATED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  MEASURED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
} as const;

export default async function KpisPage(props: PageProps<"/projects/[id]/atelier/1/kpis">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const measured = snap.kpis.filter((k) => k.measureStatus === "MEASURED").length;

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="KPI baseline"
      livrableRef="§8 du livrable atelier 1"
      intent="Mesurer la valeur ACTUELLE des KPI — sans baseline, pas de ROI possible."
      pourquoi={[
        "Un projet sans baseline = un projet impossible à évaluer après.",
        "Le sponsor demandera toujours « combien on a gagné ? » — il faut une référence.",
        "Cible (target) sans actuelle (current) = vœu pieux.",
      ]}
      cherche={[
        "Au moins 1 KPI marqué MEASURED.",
        "Valeur actuelle + valeur cible + source.",
        "KPI alignés avec les objectifs.",
      ]}
    >
      <div className="mb-4 text-sm">
        <strong>{measured}/{snap.kpis.length}</strong> KPI réellement mesurés (les autres sont estimés ou non mesurés).
      </div>
      <ItemList
        items={snap.kpis}
        empty="Aucun KPI défini."
        render={(k) => (
          <div key={k.id} className={cn("rounded-md border p-3", STATUS_COLOR[k.measureStatus as KpiMeasureStatus])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{k.name}</div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  <span><strong>Actuel :</strong> {k.currentValue ?? "—"} {k.unit ?? ""}</span>
                  <span><strong>Cible :</strong> {k.targetValue ?? "—"} {k.unit ?? ""}</span>
                  {k.source ? <span><strong>Source :</strong> {k.source}</span> : null}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{KPI_MEASURE_STATUS_LABELS[k.measureStatus as KpiMeasureStatus] ?? k.measureStatus}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
