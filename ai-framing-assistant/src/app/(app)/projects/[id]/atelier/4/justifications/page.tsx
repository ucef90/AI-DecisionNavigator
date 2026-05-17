import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ItemList } from "@/components/common/data-block";
import { SCORECARD_AXIS_LABELS, type ScorecardAxis } from "@/types/atelier4";
import { computeAutoScorecard, loadAtelier4Snapshot } from "@/lib/engines/atelier4";

export default async function A4JustificationsPage(props: PageProps<"/projects/[id]/atelier/4/justifications">) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();
  const results = computeAutoScorecard(snap);

  return (
    <SectionShell
      phaseLabel="Phase A — Cockpit scoring"
      title="Justifications par axe"
      livrableRef="§2 du livrable atelier 4"
      intent="Vue lecture seule des justifications (auto + manuelles) pour les 11 axes."
      pourquoi={["Le COPIL veut savoir POURQUOI chaque score.", "Justifications faibles = scoring contestable.", "Vue résumée pour passage en revue."]}
      cherche={["Tous les axes ≤ 2 ont une justification manuelle.", "Justifications factuelles."]}
    >
      <Link href={`/projects/${id}/atelier/4/cockpit`} className="mb-3 inline-block text-xs underline">← Éditer dans le cockpit</Link>
      <ItemList
        items={results}
        empty="Pas de scorecard."
        render={(r) => (
          <div key={r.axis} className={cn("rounded-md border p-3", r.effective <= 2 ? "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20" : r.effective === 3 ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20" : "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{SCORECARD_AXIS_LABELS[r.axis as ScorecardAxis] ?? r.axis}</span>
                  <Badge variant="outline" className="text-[9px]">{r.effective}/5</Badge>
                  {r.isOverride ? <Badge variant="outline" className="text-[9px]">Manuel</Badge> : <Badge variant="outline" className="text-[9px]">Auto</Badge>}
                </div>
                <p className="mt-2 text-xs"><strong>Auto :</strong> {r.autoRationale}</p>
                {r.manualJustification ? <p className="mt-1 text-xs"><strong>Manuel :</strong> « {r.manualJustification} »</p> : null}
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
