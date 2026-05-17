import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { PriorityMatrix } from "@/components/visualizations/priority-matrix";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PRIORITY_QUADRANT_COLORS,
  PRIORITY_QUADRANT_LABELS,
  ROADMAP_PHASE_LABELS,
  classifyQuadrant,
  type PriorityQuadrant,
  type RoadmapPhase,
} from "@/types/atelier7";
import { computePriorityMatrix, loadAtelier7Snapshot } from "@/lib/engines/atelier7";

export default async function PrioritizationSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/prioritization">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();
  const items = computePriorityMatrix(snap);

  // Group by quadrant
  const byQuadrant: Record<PriorityQuadrant, typeof items> = {
    QUICK_WIN: [],
    MAJOR_PROJECT: [],
    FILL_IN: [],
    AVOID: [],
  };
  for (const it of items) {
    byQuadrant[classifyQuadrant(it.impact, it.complexity)].push(it);
  }

  return (
    <SectionShell
      phaseLabel="Phase C — Priorisation & roadmap"
      title="Matrice de priorisation (impact × complexité)"
      livrableRef="§3 du livrable atelier 7"
      intent="Visualiser les items de roadmap selon leur impact métier et leur complexité de mise en œuvre."
      pourquoi={[
        "La matrice révèle les quick wins (à faire tout de suite) vs. les projets stratégiques (à planifier).",
        "Elle évite l'erreur de démarrer par des items complexes à faible impact (zone 'À éviter').",
        "Elle alimente directement le séquencement de la roadmap.",
      ]}
      cherche={[
        "Les Quick wins (impact↑ / complexité↓) → POC.",
        "Les Projets stratégiques (impact↑ / complexité↑) → MVP/Pilote.",
        "Le remplissage (impact↓ / complexité↓) → Run.",
        "À éviter (impact↓ / complexité↑) → reporter ou supprimer.",
      ]}
    >
      <PriorityMatrix items={items.map((i) => ({ id: i.id, title: i.title, impact: i.impact, complexity: i.complexity }))} />

      <div className="mt-6 space-y-3">
        {(["QUICK_WIN", "MAJOR_PROJECT", "FILL_IN", "AVOID"] as const).map((q) => {
          const list = byQuadrant[q];
          if (list.length === 0) return null;
          return (
            <div key={q} className={cn("rounded-md border p-3", PRIORITY_QUADRANT_COLORS[q])}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider">
                {PRIORITY_QUADRANT_LABELS[q]} ({list.length})
              </div>
              <ul className="space-y-1 text-xs">
                {list.map((it) => (
                  <li key={it.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0 text-[9px]">I{it.impact}·C{it.complexity}</Badge>
                    <span className="flex-1">{it.title}</span>
                    <span className="shrink-0 text-[10px] opacity-70">{ROADMAP_PHASE_LABELS[it.phase as RoadmapPhase]}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
