import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { RECOMMENDATION_LAYER_LABELS, type RecommendationLayer } from "@/types/atelier2";

const PRIORITY_COLOR = {
  CORE: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  RECOMMENDED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  OPTIONAL: "border-border bg-muted/20",
};

export default async function A2RecommendationsPage(props: PageProps<"/projects/[id]/atelier/2/recommendations">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Gouvernance"
      title="Recommandations technologiques"
      livrableRef="§14 du livrable atelier 2"
      intent="Recommandations consolidées par couche (orchestration, intelligence, gouvernance…)."
      pourquoi={[
        "Vue par couche permet à la DSI de découper le projet techniquement.",
        "Priorité CORE / RECOMMENDED / OPTIONAL séquence l'effort.",
        "Base directe pour la roadmap atelier 7.",
      ]}
      cherche={[
        "≥ 3 recommandations CORE.",
        "Couverture des 6 couches (orchestration, ingestion, intelligence, UI, gouvernance, stockage).",
        "Technos justifiées (pas par mode).",
      ]}
    >
      <ItemList
        items={snap.techRecommendations}
        empty="Aucune recommandation listée."
        render={(r) => (
          <div key={r.id} className={`rounded-md border p-3 ${PRIORITY_COLOR[r.priority as keyof typeof PRIORITY_COLOR] ?? "border-border"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{RECOMMENDATION_LAYER_LABELS[r.layer as RecommendationLayer] ?? r.layer}</Badge>
                  <Badge variant="outline" className="text-[9px]">{r.priority}</Badge>
                </div>
                <p className="mt-2 text-sm">{r.recommendation}</p>
                {r.rationale ? <p className="mt-1 text-xs italic text-muted-foreground">{r.rationale}</p> : null}
                {r.technologies ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {safeJSON<string[]>(r.technologies, []).map((t, i) => <Badge key={i} variant="outline" className="text-[9px]">{t}</Badge>)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
