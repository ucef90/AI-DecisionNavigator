"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PROCESS_STEP_MODES, PROCESS_STEP_MODE_LABELS, PROCESS_STEP_TYPES, PROCESS_STEP_TYPE_LABELS, type ProcessStepMode, type ProcessStepType } from "@/types/atelier1";

export type StepRow = {
  id: string;
  order: number;
  name: string;
  actor: string | null;
  mode: string;
  stepType: string;
  durationMin: number | null;
  tools: string | null;
};

const MODE_BG = {
  MANUAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  SEMI_AUTOMATED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  AUTOMATED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
} as const;

export function ProcessStepsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: StepRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  function parseTools(json: string | null): string[] {
    if (!json) return [];
    try { return JSON.parse(json) as string[]; } catch { return []; }
  }

  return (
    <EditableList<StepRow>
      items={items}
      emptyMessage="Workflow non cartographié. Décris les étapes dans l'ordre (1, 2, 3...)."
      addLabel="Ajouter une étape"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(s) => (
        <div className={cn("rounded-md border p-3 pr-20", MODE_BG[s.mode as ProcessStepMode] ?? "border-border")}>
          <div className="flex items-start gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">{s.order}</span>
            <div className="flex-1">
              <div className="font-semibold">{s.name}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[9px]">{PROCESS_STEP_TYPE_LABELS[s.stepType as ProcessStepType] ?? s.stepType}</Badge>
                <Badge variant="outline" className="text-[9px]">{PROCESS_STEP_MODE_LABELS[s.mode as ProcessStepMode] ?? s.mode}</Badge>
                {s.actor ? <Badge variant="outline" className="text-[9px]">{s.actor}</Badge> : null}
                {s.durationMin ? <Badge variant="outline" className="text-[9px]">{s.durationMin}min</Badge> : null}
                {parseTools(s.tools).map((t) => <Badge key={t} variant="outline" className="text-[9px]">🛠 {t}</Badge>)}
              </div>
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Nom de l'étape *" name="name" defaultValue={item?.name ?? ""} required />
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Acteur" name="actor" defaultValue={item?.actor ?? ""} />
            <SelectField label="Mode" name="mode" defaultValue={item?.mode ?? "MANUAL"} options={PROCESS_STEP_MODES.map((m) => ({ value: m, label: PROCESS_STEP_MODE_LABELS[m] }))} />
            <SelectField label="Type" name="stepType" defaultValue={item?.stepType ?? "TREATMENT"} options={PROCESS_STEP_TYPES.map((m) => ({ value: m, label: PROCESS_STEP_TYPE_LABELS[m] }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Durée (min)" name="durationMin" type="number" defaultValue={item?.durationMin?.toString() ?? ""} />
            <Field label="Outils (séparés par ,)" name="tools" defaultValue={parseTools(item?.tools ?? null).join(", ")} />
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
