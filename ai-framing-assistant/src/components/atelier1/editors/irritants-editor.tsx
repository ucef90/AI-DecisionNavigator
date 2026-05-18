"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IRRITANT_CATEGORIES, IRRITANT_CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_LEVELS, type IrritantCategory, type SeverityLevel } from "@/types/atelier1";

export type IrritantRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  impactedActor: string | null;
  frequency: string | null;
  estimatedTimeWastedMinPerDay: number | null;
};

const SEV_BG = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  BLOCKING: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function IrritantsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: IrritantRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<IrritantRow>
      items={items}
      emptyMessage="Aucun irritant identifié. Liste les frictions opérationnelles concrètes."
      addLabel="Ajouter un irritant"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(i) => (
        <div className={cn("rounded-md border p-3 pr-20", SEV_BG[i.severity as SeverityLevel] ?? "border-border")}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-semibold">{i.title}</div>
              {i.description ? <p className="mt-1 text-xs text-muted-foreground">{i.description}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{SEVERITY_LABELS[i.severity as SeverityLevel] ?? i.severity}</Badge>
              <Badge variant="outline" className="text-[9px]">{IRRITANT_CATEGORY_LABELS[i.category as IrritantCategory] ?? i.category}</Badge>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {i.impactedActor ? <span><strong>Acteur :</strong> {i.impactedActor}</span> : null}
            {i.frequency ? <span><strong>Fréq :</strong> {i.frequency}</span> : null}
            {i.estimatedTimeWastedMinPerDay ? <span><strong>{i.estimatedTimeWastedMinPerDay} min/jour</strong></span> : null}
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Titre *" name="title" defaultValue={item?.title ?? ""} required />
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} />
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Catégorie" name="category" defaultValue={item?.category ?? "OTHER"} options={IRRITANT_CATEGORIES.map((c) => ({ value: c, label: IRRITANT_CATEGORY_LABELS[c] }))} />
            <SelectField label="Sévérité" name="severity" defaultValue={item?.severity ?? "MEDIUM"} options={SEVERITY_LEVELS.map((c) => ({ value: c, label: SEVERITY_LABELS[c] }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Acteur impacté" name="impactedActor" defaultValue={item?.impactedActor ?? ""} />
            <Field label="Fréquence" name="frequency" defaultValue={item?.frequency ?? ""} />
            <Field label="Min/jour perdus" name="estimatedTimeWastedMinPerDay" type="number" defaultValue={item?.estimatedTimeWastedMinPerDay?.toString() ?? ""} />
          </div>
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
