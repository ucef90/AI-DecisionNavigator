import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/data-block";
import { deriveRecommendations, loadAtelier3Snapshot } from "@/lib/engines/atelier3";

const PRIORITY_COLOR = {
  CORE: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  RECOMMENDED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  OPTIONAL: "border-border bg-muted/20",
};

export default async function A3RecommendationsPage(props: PageProps<"/projects/[id]/atelier/3/recommendations">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const recs = deriveRecommendations(snap);

  return (
    <SectionShell
      phaseLabel="Phase D — Synthèses & opportunités"
      title="Recommandations (auto-dérivées)"
      livrableRef="§18 du livrable atelier 3"
      intent="Recommandations consultant générées automatiquement par le moteur."
      pourquoi={["Détectées en croisant maturité dérivée + atelier 2 + risques.", "8 patterns scannés.", "Action immédiate pour les CORE."]}
      cherche={["Pas de CORE non adressée.", "Cohérence avec la décision atelier 4."]}
    >
      {recs.length === 0 ? <EmptyState message="Aucune recommandation auto-dérivée." /> : (
        <div className="space-y-2">
          {recs.map((r) => (
            <div key={r.id} className={cn("rounded-md border p-3", PRIORITY_COLOR[r.priority] ?? "border-border")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <p className="mt-1 text-xs">{r.detail}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[9px]">{r.priority}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
