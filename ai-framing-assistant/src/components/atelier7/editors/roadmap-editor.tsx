"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { ScoreScaleInfo } from "@/components/help/score-scale-info";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCORE_LEVELS, type ScoreValue } from "@/types/score-levels";
import {
  ROADMAP_ITEM_TYPES,
  ROADMAP_ITEM_TYPE_LABELS,
  ROADMAP_PHASES,
  ROADMAP_PHASE_COLORS,
  ROADMAP_PHASE_LABELS,
  ROADMAP_STATUSES,
  type RoadmapItemType,
  type RoadmapPhase,
} from "@/types/atelier7";

// Options 1..5 enrichies avec le label de niveau (Inexistant, Embryonnaire…)
// pour rendre lisible le sens du score directement dans le dropdown.
const SCORE_OPTIONS = ([1, 2, 3, 4, 5] as ScoreValue[]).map((n) => ({
  value: String(n),
  label: `${n} — ${SCORE_LEVELS[n].label}`,
}));

export type RoadmapRow = {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  impact: number;
  complexity: number;
  effortMonths: number | null;
  itemType: string;
  status: string;
  ownerRole: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planifié",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
  CANCELLED: "Annulé",
};

export function RoadmapEditor({ items, onCreate, onUpdate, onDelete }: {
  items: RoadmapRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <>
      <ScoreScaleInfo
        axes={[
          { axisKey: "roadmapImpact", label: "Impact" },
          { axisKey: "roadmapComplexity", label: "Complexité" },
        ]}
        title="Comment remplir Impact (1-5) et Complexité (1-5) ?"
      />
      <EditableList<RoadmapRow>
      items={items}
      emptyMessage="Roadmap vide. Ajoute des items par phase POC → MVP → Pilote → Rollout → Run."
      addLabel="Ajouter un item roadmap"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(i) => (
        <div className="rounded-md border border-border bg-background p-3 pr-20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", ROADMAP_PHASE_COLORS[i.phase as RoadmapPhase])} />
                <span className="font-semibold">{i.title}</span>
              </div>
              {i.description ? <p className="mt-1 text-xs text-muted-foreground">{i.description}</p> : null}
              {i.ownerRole ? <p className="mt-1 text-[10px] italic text-muted-foreground">Owner : {i.ownerRole}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{ROADMAP_PHASE_LABELS[i.phase as RoadmapPhase] ?? i.phase}</Badge>
              <Badge variant="outline" className="text-[9px]">{ROADMAP_ITEM_TYPE_LABELS[i.itemType as RoadmapItemType] ?? i.itemType}</Badge>
              <Badge variant="outline" className="text-[9px]">I{i.impact}·C{i.complexity}{i.effortMonths != null ? ` · ${i.effortMonths}m` : ""}</Badge>
              <Badge variant="outline" className="text-[9px]">{STATUS_LABELS[i.status] ?? i.status}</Badge>
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Titre *" name="title" defaultValue={item?.title ?? ""} required placeholder="ex. POC sur 1 cas d'usage prioritaire" />
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} rows={2} />
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Phase" name="phase" defaultValue={item?.phase ?? "PHASE_0_POC"} options={ROADMAP_PHASES.map((p) => ({ value: p, label: ROADMAP_PHASE_LABELS[p] }))} />
            <SelectField label="Type" name="itemType" defaultValue={item?.itemType ?? "STRATEGIC"} options={ROADMAP_ITEM_TYPES.map((t) => ({ value: t, label: ROADMAP_ITEM_TYPE_LABELS[t] }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <SelectField label="Impact (1-5)" name="impact" defaultValue={String(item?.impact ?? 3)} options={SCORE_OPTIONS} hint="Voir le panneau d'aide en haut. 5 = transformation visible, ROI fort, vitrine. 1 = gain marginal." />
            <SelectField label="Complexité (1-5)" name="complexity" defaultValue={String(item?.complexity ?? 3)} options={SCORE_OPTIONS} hint="5 = refonte avec multiples intégrations et risques. 1 = périmètre simple, peu de dépendances." />
            <Field label="Effort (mois)" name="effortMonths" type="number" min={0} max={60} defaultValue={item?.effortMonths != null ? String(item.effortMonths) : ""} />
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "PLANNED"} options={ROADMAP_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] ?? s }))} />
          </div>
          <Field label="Owner" name="ownerRole" defaultValue={item?.ownerRole ?? ""} placeholder="ex. CDP, RSSI, Architecte" />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
    </>
  );
}
