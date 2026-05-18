"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONSTRAINT_TYPES, CONSTRAINT_TYPE_LABELS, SEVERITY_LEVELS, SEVERITY_LABELS, type ConstraintType, type SeverityLevel } from "@/types/atelier1";

export type ConstraintRow = { id: string; constraintType: string; description: string; impactLevel: string; source: string | null };

const SEV_BG = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  BLOCKING: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function ConstraintsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: ConstraintRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<ConstraintRow>
      items={items}
      emptyMessage="Aucune contrainte. Liste réglo, budget, calendrier, SI, organisation."
      addLabel="Ajouter une contrainte"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(c) => (
        <div className={cn("rounded-md border p-3 pr-20", SEV_BG[c.impactLevel as SeverityLevel])}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">{c.description}</p>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{CONSTRAINT_TYPE_LABELS[c.constraintType as ConstraintType] ?? c.constraintType}</Badge>
              <Badge variant="outline" className="text-[9px]">{SEVERITY_LABELS[c.impactLevel as SeverityLevel] ?? c.impactLevel}</Badge>
            </div>
          </div>
          {c.source ? <p className="mt-1 text-[11px] italic text-muted-foreground">Source : {c.source}</p> : null}
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Type" name="constraintType" defaultValue={item?.constraintType ?? "OTHER"} options={CONSTRAINT_TYPES.map((t) => ({ value: t, label: CONSTRAINT_TYPE_LABELS[t] }))} />
            <SelectField label="Impact" name="impactLevel" defaultValue={item?.impactLevel ?? "MEDIUM"} options={SEVERITY_LEVELS.map((s) => ({ value: s, label: SEVERITY_LABELS[s] }))} />
          </div>
          <TextareaField label="Description *" name="description" defaultValue={item?.description ?? ""} />
          <Field label="Source (DPO, sponsor, DSI…)" name="source" defaultValue={item?.source ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
