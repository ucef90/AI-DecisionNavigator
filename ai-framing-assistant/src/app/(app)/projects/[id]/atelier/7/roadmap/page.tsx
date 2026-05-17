import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { GanttChart, type GanttItem } from "@/components/visualizations/gantt-chart";
import { Badge } from "@/components/ui/badge";
import {
  ROADMAP_PHASES,
  ROADMAP_PHASE_LABELS,
  ROADMAP_ITEM_TYPE_LABELS,
  type RoadmapPhase,
  type RoadmapItemType,
} from "@/types/atelier7";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

export default async function RoadmapSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/roadmap">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const ganttItems: GanttItem[] = snap.roadmapItems.map((i) => ({
    id: i.id,
    title: i.title,
    phase: i.phase as RoadmapPhase,
    effortMonths: i.effortMonths ?? 1,
    status: i.status as GanttItem["status"],
    impact: i.impact,
    complexity: i.complexity,
  }));

  const byPhase = new Map<RoadmapPhase, typeof snap.roadmapItems>();
  for (const ph of ROADMAP_PHASES) byPhase.set(ph, []);
  for (const it of snap.roadmapItems) {
    byPhase.get(it.phase as RoadmapPhase)?.push(it);
  }
  const totalEffort = snap.roadmapItems.reduce((s, i) => s + (i.effortMonths ?? 0), 0);

  return (
    <SectionShell
      phaseLabel="Phase C — Priorisation & roadmap"
      title="Roadmap transformation"
      livrableRef="§4 du livrable atelier 7"
      intent="Planning macro par phases (POC → Run) avec items, durées et dépendances."
      pourquoi={[
        "La roadmap matérialise comment passer de l'idée à l'industrialisation.",
        "Elle sert d'engagement vis-à-vis du sponsor et de la DSI.",
        "Elle révèle les chemins critiques et les dépendances.",
      ]}
      cherche={[
        "Une progression logique POC → MVP → Pilote → Rollout → Run.",
        "Des durées réalistes par item (1-6 mois typiquement).",
        "Des dépendances explicites entre items.",
        "Des owners désignés.",
      ]}
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{snap.roadmapItems.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Items</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{totalEffort}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mois d&apos;effort cumulés</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">
              {snap.roadmapItems.filter((i) => i.status === "IN_PROGRESS").length}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">En cours</div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gantt
          </h3>
          <GanttChart items={ganttItems} />
        </div>

        <div className="space-y-3">
          {ROADMAP_PHASES.map((phase) => {
            const list = byPhase.get(phase) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={phase} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {ROADMAP_PHASE_LABELS[phase]}
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    {list.reduce((s, i) => s + (i.effortMonths ?? 0), 0)} mois
                  </Badge>
                </div>
                <ul className="space-y-1.5">
                  {list.map((it) => (
                    <li key={it.id} className="flex flex-col gap-1 rounded border border-border bg-muted/30 px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{it.title}</span>
                        <span className="flex shrink-0 gap-1">
                          <Badge variant="outline" className="text-[9px]">{ROADMAP_ITEM_TYPE_LABELS[it.itemType as RoadmapItemType]}</Badge>
                          <Badge variant="outline" className="text-[9px]">{it.effortMonths ?? "?"}m</Badge>
                          <Badge variant="outline" className="text-[9px]">I{it.impact}·C{it.complexity}</Badge>
                        </span>
                      </div>
                      {it.description ? <p className="text-muted-foreground">{it.description}</p> : null}
                      {it.ownerRole ? <p className="text-[10px] italic text-muted-foreground">Owner : {it.ownerRole}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
