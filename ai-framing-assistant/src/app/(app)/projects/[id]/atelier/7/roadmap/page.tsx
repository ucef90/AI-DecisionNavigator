import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RoadmapEditor } from "@/components/atelier7/editors/roadmap-editor";
import { GanttChart, type GanttItem } from "@/components/visualizations/gantt-chart";
import { addRoadmapItem, deleteRoadmapItem, updateRoadmapItem } from "@/lib/actions/atelier7";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";
import { type RoadmapPhase } from "@/types/atelier7";

export default async function RoadmapSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/roadmap">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addRoadmapItem(id, formData); }
  async function onUpdate(iid: string, formData: FormData) { "use server"; await updateRoadmapItem(id, iid, formData); }
  async function onDelete(iid: string) { "use server"; await deleteRoadmapItem(id, iid); }

  const ganttItems: GanttItem[] = snap.roadmapItems.map((i) => ({
    id: i.id,
    title: i.title,
    phase: i.phase as RoadmapPhase,
    effortMonths: i.effortMonths ?? 1,
    status: i.status as GanttItem["status"],
    impact: i.impact,
    complexity: i.complexity,
  }));
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
        "Des owners désignés.",
      ]}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
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

      {snap.roadmapItems.length > 0 ? (
        <div className="mb-4 rounded-md border border-border bg-background p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gantt</h3>
          <GanttChart items={ganttItems} />
        </div>
      ) : null}

      <RoadmapEditor
        items={snap.roadmapItems.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          phase: i.phase,
          impact: i.impact,
          complexity: i.complexity,
          effortMonths: i.effortMonths,
          itemType: i.itemType,
          status: i.status,
          ownerRole: i.ownerRole,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
