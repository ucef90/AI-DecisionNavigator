"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { EFFORT_LEVELS, OPPORTUNITY_CATEGORIES, OPPORTUNITY_CATEGORY_LABELS, type OpportunityCategory } from "@/types/atelier1";

export type OpportunityRow = { id: string; title: string; description: string | null; category: string; estimatedGain: string | null; effort: string };

export function OpportunitiesEditor({ items, onCreate, onUpdate, onDelete }: {
  items: OpportunityRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<OpportunityRow>
      items={items}
      emptyMessage="Aucune opportunité. Identifie les améliorations possibles."
      addLabel="Ajouter une opportunité"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(o) => (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-50/30 p-3 pr-20 dark:bg-emerald-950/15">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{o.title}</div>
              {o.description ? <p className="mt-1 text-xs text-muted-foreground">{o.description}</p> : null}
              {o.estimatedGain ? <div className="mt-2 text-xs"><strong>Gain estimé :</strong> {o.estimatedGain}</div> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{OPPORTUNITY_CATEGORY_LABELS[o.category as OpportunityCategory] ?? o.category}</Badge>
              <Badge variant="outline" className="text-[9px]">Effort {o.effort}</Badge>
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Titre *" name="title" defaultValue={item?.title} required />
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} />
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Catégorie" name="category" defaultValue={item?.category ?? "OTHER"} options={OPPORTUNITY_CATEGORIES.map((c) => ({ value: c, label: OPPORTUNITY_CATEGORY_LABELS[c] }))} />
            <Field label="Gain estimé" name="estimatedGain" defaultValue={item?.estimatedGain ?? ""} placeholder="ex. 30 min/agent/jour" />
            <SelectField label="Effort" name="effort" defaultValue={item?.effort ?? "MEDIUM"} options={EFFORT_LEVELS.map((e) => ({ value: e, label: e }))} />
          </div>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
