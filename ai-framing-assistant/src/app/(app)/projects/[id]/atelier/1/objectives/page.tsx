import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { OBJECTIVE_CATEGORY_LABELS, type ObjectiveCategory } from "@/types/atelier1";

export default async function ObjectivesPage(props: PageProps<"/projects/[id]/atelier/1/objectives">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const sorted = [...snap.objectives].sort((a, b) => a.priority - b.priority);

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="Objectifs métier"
      livrableRef="§7 du livrable atelier 1"
      intent="Lister les résultats attendus avec priorité (1 = top, 5 = bas)."
      pourquoi={[
        "Les objectifs vont conditionner le scoring atelier 4 (axe valeur métier).",
        "La priorisation explicite évite que tout soit « important » (donc rien).",
        "Ils sont la base de la décision finale atelier 7.",
      ]}
      cherche={[
        "Au moins 3 objectifs catégorisés.",
        "Priorité 1-2 pour les vrais leviers.",
        "Lien explicite vers un KPI cible quand possible.",
      ]}
    >
      <ItemList
        items={sorted}
        empty="Aucun objectif listé."
        render={(o) => (
          <div key={o.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-foreground/10 text-[10px] font-bold">P{o.priority}</Badge>
                  <span className="font-semibold">{o.title}</span>
                </div>
                {o.description ? <p className="mt-1 text-xs text-muted-foreground">{o.description}</p> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{OBJECTIVE_CATEGORY_LABELS[o.category as ObjectiveCategory] ?? o.category}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
