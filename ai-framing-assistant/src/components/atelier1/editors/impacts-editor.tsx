"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IMPACT_AXES, IMPACT_AXIS_LABELS, IMPACT_SEVERITIES, IMPACT_SEVERITY_LABELS, IMPACT_DIRECTIONS, type ImpactAxis, type ImpactSeverity } from "@/types/atelier1";

export type ImpactRow = { id: string; axis: string; description: string; severity: string; direction: string; metric: string | null };

const SEV_BG = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function ImpactsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: ImpactRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<ImpactRow>
      items={items}
      emptyMessage="Aucun impact. Chiffre les conséquences des irritants par axe."
      addLabel="Ajouter un impact"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(i) => (
        <div className={cn("rounded-md border p-3 pr-20", SEV_BG[i.severity as ImpactSeverity])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{IMPACT_AXIS_LABELS[i.axis as ImpactAxis] ?? i.axis}</div>
              <p className="mt-1 text-xs">{i.description}</p>
              {i.metric ? <Badge variant="outline" className="mt-2 text-[10px]">📊 {i.metric}</Badge> : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-[9px]">{IMPACT_SEVERITY_LABELS[i.severity as ImpactSeverity]}</Badge>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Axe" name="axis" defaultValue={item?.axis ?? "AGENT"} options={IMPACT_AXES.map((a) => ({ value: a, label: IMPACT_AXIS_LABELS[a] }))} />
            <SelectField label="Sévérité" name="severity" defaultValue={item?.severity ?? "MEDIUM"} options={IMPACT_SEVERITIES.map((s) => ({ value: s, label: IMPACT_SEVERITY_LABELS[s] }))} />
            <SelectField label="Direction" name="direction" defaultValue={item?.direction ?? "NEGATIVE"} options={IMPACT_DIRECTIONS.map((d) => ({ value: d, label: d === "NEGATIVE" ? "Négatif (actuel)" : "Positif (cible)" }))} />
          </div>
          <TextareaField label="Description *" name="description" defaultValue={item?.description ?? ""} />
          <Field label="Métrique chiffrée (ex. +30% temps, 2 plaintes/mois)" name="metric" defaultValue={item?.metric ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
