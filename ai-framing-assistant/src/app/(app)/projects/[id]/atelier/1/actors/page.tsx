import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { ACTOR_CATEGORY_LABELS, ACTOR_INVOLVEMENT_LABELS, type ActorCategory, type ActorInvolvement } from "@/types/atelier1";

export default async function ActorsPage(props: PageProps<"/projects/[id]/atelier/1/actors">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Acteurs & utilisateurs"
      livrableRef="§6 du livrable atelier 1"
      intent="Cartographier tous les acteurs : usagers, agents, managers, IT, gouvernance."
      pourquoi={[
        "Sans cartographie acteurs, on ne sait pas pour qui on conçoit.",
        "L'identification des acteurs révèle les douleurs et les gains par catégorie.",
        "Indispensable pour le RACI atelier 6 et le change management atelier 7.",
      ]}
      cherche={[
        "Au moins 3 catégories d'acteurs (USER, AGENT, MANAGER…).",
        "Volume estimé (nb de personnes).",
        "Douleur actuelle et gain attendu par acteur.",
      ]}
    >
      <ItemList
        items={snap.actors}
        empty="Aucun acteur cartographié."
        render={(a) => (
          <div key={a.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{a.name}</span>
              <Badge variant="outline" className="text-[10px]">{ACTOR_CATEGORY_LABELS[a.category as ActorCategory] ?? a.category}</Badge>
              {a.involvement ? <Badge variant="outline" className="text-[10px]">{ACTOR_INVOLVEMENT_LABELS[a.involvement as ActorInvolvement] ?? a.involvement}</Badge> : null}
              {a.volume ? <Badge variant="outline" className="text-[10px]">{a.volume} personne(s)</Badge> : null}
            </div>
            {a.role ? <p className="mt-1 text-xs text-muted-foreground">{a.role}</p> : null}
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
              {a.currentPain ? (
                <div className="rounded bg-rose-50/40 px-2 py-1 dark:bg-rose-950/20"><strong>Douleur :</strong> {a.currentPain}</div>
              ) : null}
              {a.expectedGain ? (
                <div className="rounded bg-emerald-50/40 px-2 py-1 dark:bg-emerald-950/20"><strong>Gain attendu :</strong> {a.expectedGain}</div>
              ) : null}
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
