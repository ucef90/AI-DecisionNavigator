"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { ScoreScaleInfo } from "@/components/help/score-scale-info";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCORE_LEVELS, type ScoreValue } from "@/types/score-levels";
import {
  INDUSTRIALIZATION_STAGES,
  INDUSTRIALIZATION_STAGE_LABELS,
  INDUSTRIALIZATION_STATUSES,
  type IndustrializationStatus,
} from "@/types/atelier7";

const READINESS_OPTIONS = ([1, 2, 3, 4, 5] as ScoreValue[]).map((n) => ({
  value: String(n),
  label: `${n} — ${SCORE_LEVELS[n].label}`,
}));

export type IndustrializationRow = {
  id: string;
  stage: string;
  name: string;
  description: string | null;
  readinessLevel: number;
  status: string;
  exitCriteria: string | null;
  startTarget: Date | string | null;
  endTarget: Date | string | null;
};

const STATUS_COLOR: Record<IndustrializationStatus, string> = {
  NOT_STARTED: "border-border bg-muted/30",
  IN_PROGRESS: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  DONE: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
};

const STATUS_LABEL: Record<IndustrializationStatus, string> = {
  NOT_STARTED: "Non démarré",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
};

const dateValue = (d: Date | string | null): string => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isFinite(dt.getTime()) ? dt.toISOString().slice(0, 10) : "";
};

export function IndustrializationEditor({ items, onCreate, onUpdate, onDelete }: {
  items: IndustrializationRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <>
      <ScoreScaleInfo
        axes={[{ axisKey: "industrializationReadiness", label: "Readiness" }]}
        title="Comment évaluer le niveau de Readiness (1-5) ?"
      />
      <EditableList<IndustrializationRow>
      items={items}
      emptyMessage="Aucun stage industrialisation planifié. Définis POC → MVP → Pilote → Rollout → Run."
      addLabel="Ajouter un stage"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(s) => (
        <div className={cn("rounded-md border p-3 pr-20", STATUS_COLOR[s.status as IndustrializationStatus] ?? "border-border")}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[9px]">{INDUSTRIALIZATION_STAGE_LABELS[s.stage as keyof typeof INDUSTRIALIZATION_STAGE_LABELS] ?? s.stage}</Badge>
                <span className="font-semibold">{s.name}</span>
              </div>
              {s.description ? <p className="mt-1 text-xs">{s.description}</p> : null}
              {(s.startTarget || s.endTarget) ? (
                <p className="mt-1 text-[10px] opacity-70">
                  {dateValue(s.startTarget) || "—"} → {dateValue(s.endTarget) || "—"}
                </p>
              ) : null}
              {s.exitCriteria ? <p className="mt-1 text-[10px] italic"><strong>Critères de sortie :</strong> {s.exitCriteria}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">Readiness {s.readinessLevel}/5</Badge>
              <Badge variant="outline" className="text-[9px]">{STATUS_LABEL[s.status as IndustrializationStatus] ?? s.status}</Badge>
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Nom *" name="name" defaultValue={item?.name ?? ""} required placeholder="ex. POC sur cas d'usage X" />
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Stage" name="stage" defaultValue={item?.stage ?? "POC"} options={INDUSTRIALIZATION_STAGES.map((st) => ({ value: st, label: INDUSTRIALIZATION_STAGE_LABELS[st] }))} />
            <SelectField label="Readiness (1-5)" name="readinessLevel" defaultValue={String(item?.readinessLevel ?? 1)} options={READINESS_OPTIONS} hint="1 = pas démarré. 3 = POC validé, MVP en construction. 5 = run continu, industrialisé." />
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "NOT_STARTED"} options={INDUSTRIALIZATION_STATUSES.map((st) => ({ value: st, label: STATUS_LABEL[st] ?? st }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Date début cible" name="startTarget" type="date" defaultValue={dateValue(item?.startTarget ?? null)} />
            <Field label="Date fin cible" name="endTarget" type="date" defaultValue={dateValue(item?.endTarget ?? null)} />
          </div>
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} rows={2} />
          <TextareaField label="Critères de sortie" name="exitCriteria" defaultValue={item?.exitCriteria ?? ""} rows={2} placeholder="ex. KPI X atteint sur 1 mois, validation sponsor" />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
    </>
  );
}
