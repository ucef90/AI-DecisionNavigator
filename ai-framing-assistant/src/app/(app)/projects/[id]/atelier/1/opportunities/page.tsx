import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { OPPORTUNITY_CATEGORY_LABELS, type OpportunityCategory } from "@/types/atelier1";

export default async function OpportunitiesPage(props: PageProps<"/projects/[id]/atelier/1/opportunities">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase C — Diagnostic"
      title="Opportunités d'amélioration"
      livrableRef="§16 du livrable atelier 1"
      intent="Identifier où simplifier, automatiser, fluidifier, mieux exploiter les données."
      pourquoi={[
        "Les opportunités sont les briques de la roadmap atelier 7.",
        "Estimation gain + effort = priorisation matrice impact/complexité.",
        "Elles confirment ou infirment les hypothèses IA.",
      ]}
      cherche={[
        "Au moins 3 opportunités catégorisées.",
        "Gain estimé en min/heures/€/%.",
        "Effort grossier (LOW/MEDIUM/HIGH).",
      ]}
    >
      <ItemList
        items={snap.opportunities}
        empty="Aucune opportunité listée."
        render={(o) => (
          <div key={o.id} className="rounded-md border border-emerald-500/30 bg-emerald-50/30 p-3 dark:bg-emerald-950/15">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{o.title}</div>
                {o.description ? <p className="mt-1 text-xs text-muted-foreground">{o.description}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{OPPORTUNITY_CATEGORY_LABELS[o.category as OpportunityCategory] ?? o.category}</Badge>
                {o.effort ? <Badge variant="outline" className="text-[9px]">Effort {o.effort}</Badge> : null}
              </div>
            </div>
            {o.estimatedGain ? (
              <div className="mt-2 text-xs"><strong>Gain estimé :</strong> {o.estimatedGain}</div>
            ) : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
