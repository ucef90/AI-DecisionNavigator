"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { OBJECTIVE_CATEGORIES, OBJECTIVE_CATEGORY_LABELS, type ObjectiveCategory } from "@/types/atelier1";

export type ObjectiveRow = { id: string; title: string; description: string | null; priority: number; category: string };

export function ObjectivesEditor({ items, onCreate, onUpdate, onDelete }: {
  items: ObjectiveRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<ObjectiveRow>
      items={items}
      emptyMessage="Aucun objectif. Liste les résultats attendus avec priorité 1-5."
      addLabel="Ajouter un objectif"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(o) => (
        <div className="rounded-md border border-border bg-background p-3 pr-20">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-foreground/10 text-[10px] font-bold">P{o.priority}</Badge>
                <span className="font-semibold">{o.title}</span>
              </div>
              {o.description ? <p className="mt-1 text-xs text-muted-foreground">{o.description}</p> : null}
            </div>
            <Badge variant="outline" className="text-[9px]">{OBJECTIVE_CATEGORY_LABELS[o.category as ObjectiveCategory] ?? o.category}</Badge>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Titre *" name="title" defaultValue={item?.title} required />
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Priorité (1 haute → 5 basse)" name="priority" type="number" min={1} max={5} defaultValue={item?.priority.toString() ?? "3"} />
            <SelectField label="Catégorie" name="category" defaultValue={item?.category ?? "OTHER"} options={OBJECTIVE_CATEGORIES.map((c) => ({ value: c, label: OBJECTIVE_CATEGORY_LABELS[c] }))} />
          </div>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
