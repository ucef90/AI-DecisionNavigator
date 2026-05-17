import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";
import { OPPORTUNITY_CATEGORY_LABELS, type OpportunityCategory } from "@/types/atelier1";

export default async function A3OpportunitiesPage(props: PageProps<"/projects/[id]/atelier/3/opportunities">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase D — Synthèses & opportunités"
      title="Opportunités"
      livrableRef="§17 — récap atelier 1"
      intent="Consolidation des opportunités identifiées en atelier 1."
      pourquoi={["Atelier 3 consolide pour préparer roadmap atelier 7.", "Pas de re-saisie — édition dans atelier 1."]}
      cherche={["Au moins 3 opportunités catégorisées.", "Gain estimé."]}
    >
      <Link href={`/projects/${id}/atelier/1/opportunities`} className="mb-3 inline-block text-xs underline">← Éditer (atelier 1)</Link>
      <ItemList
        items={snap.opportunities}
        empty="Aucune opportunité."
        render={(o) => (
          <div key={o.id} className="rounded-md border border-emerald-500/30 bg-emerald-50/30 p-3 dark:bg-emerald-950/15">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{o.title}</div>
                {o.estimatedGain ? <p className="mt-1 text-xs"><strong>Gain :</strong> {o.estimatedGain}</p> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{OPPORTUNITY_CATEGORY_LABELS[o.category as OpportunityCategory] ?? o.category}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
