"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { KPI_MEASURE_STATUSES, KPI_MEASURE_STATUS_LABELS, type KpiMeasureStatus } from "@/types/atelier1";

export type KpiRow = {
  id: string;
  name: string;
  unit: string | null;
  currentValue: string | null;
  targetValue: string | null;
  source: string | null;
  measureStatus: string;
  notes: string | null;
};

const STATUS_BG = {
  NOT_MEASURED: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  ESTIMATED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  MEASURED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
} as const;

export function KpisEditor({ items, onCreate, onUpdate, onDelete }: {
  items: KpiRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<KpiRow>
      items={items}
      emptyMessage="Aucun KPI baseline. Mesure la valeur ACTUELLE pour pouvoir mesurer le gain plus tard."
      addLabel="Ajouter un KPI"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(k) => (
        <div className={cn("rounded-md border p-3 pr-20", STATUS_BG[k.measureStatus as KpiMeasureStatus] ?? "border-border")}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{k.name}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <span><strong>Actuel :</strong> {k.currentValue ?? "—"} {k.unit ?? ""}</span>
                <span><strong>Cible :</strong> {k.targetValue ?? "—"} {k.unit ?? ""}</span>
                {k.source ? <span><strong>Source :</strong> {k.source}</span> : null}
              </div>
              {k.notes ? <p className="mt-1 text-[11px] italic text-muted-foreground">{k.notes}</p> : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-[9px]">{KPI_MEASURE_STATUS_LABELS[k.measureStatus as KpiMeasureStatus] ?? k.measureStatus}</Badge>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
            <Field label="Nom du KPI *" name="name" defaultValue={item?.name ?? ""} required />
            <Field label="Unité (min, %, j…)" name="unit" defaultValue={item?.unit ?? ""} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Valeur actuelle" name="currentValue" defaultValue={item?.currentValue ?? ""} />
            <Field label="Valeur cible" name="targetValue" defaultValue={item?.targetValue ?? ""} />
            <SelectField label="Statut mesure" name="measureStatus" defaultValue={item?.measureStatus ?? "NOT_MEASURED"} options={KPI_MEASURE_STATUSES.map((s) => ({ value: s, label: KPI_MEASURE_STATUS_LABELS[s] }))} />
          </div>
          <Field label="Source" name="source" defaultValue={item?.source ?? ""} />
          <TextareaField label="Notes" name="notes" defaultValue={item?.notes ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <select name={name} defaultValue={defaultValue} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function TextareaField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Textarea name={name} rows={2} defaultValue={defaultValue} className="text-xs" />
    </div>
  );
}
