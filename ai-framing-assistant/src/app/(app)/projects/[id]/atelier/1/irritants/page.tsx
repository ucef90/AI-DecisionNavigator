import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { IRRITANT_CATEGORY_LABELS, SEVERITY_LABELS, type IrritantCategory, type SeverityLevel } from "@/types/atelier1";

const SEV_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  BLOCKING: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function IrritantsPage(props: PageProps<"/projects/[id]/atelier/1/irritants">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const totalTime = snap.irritants.reduce((s, i) => s + (i.estimatedTimeWastedMinPerDay ?? 0), 0);

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Irritants & points de friction"
      livrableRef="§4 + §15 du livrable (fusionnés)"
      intent="Lister les frictions opérationnelles concrètes, chiffrées si possible."
      pourquoi={[
        "Les irritants sont la matière première du projet — c'est ce qu'on cherche à réduire.",
        "Sans chiffrage (min/jour), pas de ROI possible.",
        "Catégoriser permet d'identifier les patterns récurrents (lecture, double saisie…).",
      ]}
      cherche={[
        "Au moins 3 irritants avec sévérité.",
        "Temps perdu estimé par jour quand pertinent.",
        "Catégorie typée (pas juste « divers »).",
      ]}
    >
      {totalTime > 0 ? (
        <div className="mb-4 rounded-md border border-rose-500/30 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
          <strong>{totalTime} min/jour perdus</strong> = {Math.round(totalTime / 60 * 10) / 10}h/jour/agent au total estimé.
        </div>
      ) : null}
      <ItemList
        items={snap.irritants}
        empty="Aucun irritant identifié."
        render={(i) => (
          <div key={i.id} className={cn("rounded-md border p-3", SEV_COLOR[i.severity as SeverityLevel] ?? "border-border")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-semibold">{i.title}</div>
                {i.description ? <p className="mt-1 text-xs text-muted-foreground">{i.description}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{SEVERITY_LABELS[i.severity as SeverityLevel] ?? i.severity}</Badge>
                <Badge variant="outline" className="text-[9px]">{IRRITANT_CATEGORY_LABELS[i.category as IrritantCategory] ?? i.category}</Badge>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {i.impactedActor ? <span><strong>Acteur :</strong> {i.impactedActor}</span> : null}
              {i.frequency ? <span><strong>Fréquence :</strong> {i.frequency}</span> : null}
              {i.estimatedTimeWastedMinPerDay ? <span><strong>{i.estimatedTimeWastedMinPerDay} min/jour</strong></span> : null}
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
