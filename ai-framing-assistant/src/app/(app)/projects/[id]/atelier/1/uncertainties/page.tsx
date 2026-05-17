import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { UNCERTAINTY_STATUS_LABELS, type UncertaintyStatus, type UncertaintySeverity } from "@/types/atelier1";

const SEV_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function UncertaintiesPage(props: PageProps<"/projects/[id]/atelier/1/uncertainties">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Zones floues & incertitudes"
      livrableRef="§10 du livrable atelier 1"
      intent="Lister ce qu'on NE SAIT PAS encore — et qui peut faire dérailler le projet."
      pourquoi={[
        "Une hypothèse est une affirmation à vérifier ; une incertitude est une question ouverte.",
        "Les incertitudes critiques bloquent l'atelier 7 si non résolues.",
        "Mieux vaut une incertitude assumée qu'un trou silencieux.",
      ]}
      cherche={[
        "≥ 3 incertitudes formulées en questions.",
        "Sévérité (impact sur la décision).",
        "Responsable et échéance pour résoudre.",
      ]}
    >
      <ItemList
        items={snap.uncertainties}
        empty="Aucune zone floue identifiée."
        render={(u) => (
          <div key={u.id} className={cn("rounded-md border p-3", SEV_COLOR[u.severity as UncertaintySeverity])}>
            <div className="text-sm font-semibold">{u.topic}</div>
            <p className="mt-1 text-xs">{u.question}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <Badge variant="outline">{u.severity}</Badge>
              <Badge variant="outline">{UNCERTAINTY_STATUS_LABELS[u.status as UncertaintyStatus] ?? u.status}</Badge>
              {u.ownerToAsk ? <Badge variant="outline">À demander : {u.ownerToAsk}</Badge> : null}
              {u.dueBy ? <Badge variant="outline">Avant {new Date(u.dueBy).toISOString().slice(0, 10)}</Badge> : null}
            </div>
            {u.resolution ? <p className="mt-2 text-[11px] italic text-emerald-700 dark:text-emerald-300">✓ Résolu : {u.resolution}</p> : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
