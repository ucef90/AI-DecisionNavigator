import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { CONSTRAINT_TYPE_LABELS, SEVERITY_LABELS, type ConstraintType, type SeverityLevel } from "@/types/atelier1";

const IMPACT_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  BLOCKING: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function ConstraintsPage(props: PageProps<"/projects/[id]/atelier/1/constraints">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Contraintes métier"
      livrableRef="§14 du livrable atelier 1"
      intent="Lister ce qui borne le projet : réglo, budget, calendrier, SI, organisation."
      pourquoi={[
        "Contraintes non explicitées = surprises pendant l'exécution.",
        "Elles conditionnent la faisabilité atelier 3.",
        "Les contraintes BLOCKING doivent être adressées avant POC.",
      ]}
      cherche={[
        "≥ 3 contraintes typées.",
        "Niveau d'impact (LOW → BLOCKING).",
        "Source identifiée (DPO, sponsor, DSI…).",
      ]}
    >
      <ItemList
        items={snap.constraints}
        empty="Aucune contrainte listée."
        render={(c) => (
          <div key={c.id} className={cn("rounded-md border p-3", IMPACT_COLOR[c.impactLevel as SeverityLevel])}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{c.description}</p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{CONSTRAINT_TYPE_LABELS[c.constraintType as ConstraintType] ?? c.constraintType}</Badge>
                <Badge variant="outline" className="text-[9px]">{SEVERITY_LABELS[c.impactLevel as SeverityLevel] ?? c.impactLevel}</Badge>
              </div>
            </div>
            {c.source ? <p className="mt-1 text-[11px] italic text-muted-foreground">Source : {c.source}</p> : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
