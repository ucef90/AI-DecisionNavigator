"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField } from "@/components/atelier1/editors/form-fields";
import { Badge } from "@/components/ui/badge";
import { KPI_CATEGORIES, KPI_CATEGORY_LABELS, KPI_FREQUENCIES, KPI_FREQUENCY_LABELS, type KpiCategory, type KpiFrequency } from "@/types/atelier6";

export type MonitoringKpiRow = { id: string; name: string; category: string; unit: string | null; targetValue: string | null; alertThreshold: string | null; frequency: string; responsibleRole: string | null };

export function MonitoringEditor({ items, onCreate, onUpdate, onDelete }: {
  items: MonitoringKpiRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<MonitoringKpiRow>
      items={items}
      emptyMessage="Aucun KPI à monitorer. Définis performance, qualité, dérive, incidents."
      addLabel="Ajouter un KPI à monitorer"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(k) => (
        <div className="rounded-md border border-border bg-background p-3 pr-20">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{k.name}</div>
              <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                <span>{KPI_FREQUENCY_LABELS[k.frequency as KpiFrequency] ?? k.frequency}</span>
                {k.responsibleRole ? <span>· {k.responsibleRole}</span> : null}
              </div>
              {k.alertThreshold ? <div className="mt-1 text-[10px] text-rose-700 dark:text-rose-300">⚠ Alerte si {k.alertThreshold}</div> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{KPI_CATEGORY_LABELS[k.category as KpiCategory] ?? k.category}</Badge>
              {k.targetValue ? <Badge variant="outline" className="text-[9px]">🎯 {k.targetValue}{k.unit ?? ""}</Badge> : null}
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Nom *" name="name" defaultValue={item?.name ?? ""} required placeholder="ex. Taux de classification correcte" />
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Catégorie" name="category" defaultValue={item?.category ?? "PERFORMANCE"} options={KPI_CATEGORIES.map((c) => ({ value: c, label: KPI_CATEGORY_LABELS[c] }))} />
            <Field label="Unité" name="unit" defaultValue={item?.unit ?? ""} placeholder="ex. %, min, n" />
            <SelectField label="Fréquence" name="frequency" defaultValue={item?.frequency ?? "DAILY"} options={KPI_FREQUENCIES.map((f) => ({ value: f, label: KPI_FREQUENCY_LABELS[f] }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Valeur cible" name="targetValue" defaultValue={item?.targetValue ?? ""} placeholder="ex. 95" />
            <Field label="Seuil alerte" name="alertThreshold" defaultValue={item?.alertThreshold ?? ""} placeholder="ex. < 90" />
            <Field label="Responsable" name="responsibleRole" defaultValue={item?.responsibleRole ?? ""} />
          </div>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
