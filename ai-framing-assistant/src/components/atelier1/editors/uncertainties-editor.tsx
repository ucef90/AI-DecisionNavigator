"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UNCERTAINTY_SEVERITIES, UNCERTAINTY_STATUSES, UNCERTAINTY_STATUS_LABELS, type UncertaintySeverity, type UncertaintyStatus } from "@/types/atelier1";

export type UncertaintyRow = { id: string; topic: string; question: string; severity: string; status: string; ownerToAsk: string | null; resolution: string | null };

const SEV_BG = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function UncertaintiesEditor({ items, onCreate, onUpdate, onDelete }: {
  items: UncertaintyRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<UncertaintyRow>
      items={items}
      emptyMessage="Aucune zone floue. Liste ce que tu ne sais pas encore."
      addLabel="Ajouter une zone floue"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(u) => (
        <div className={cn("rounded-md border p-3 pr-20", SEV_BG[u.severity as UncertaintySeverity])}>
          <div className="text-sm font-semibold">{u.topic}</div>
          <p className="mt-1 text-xs">{u.question}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <Badge variant="outline">{u.severity}</Badge>
            <Badge variant="outline">{UNCERTAINTY_STATUS_LABELS[u.status as UncertaintyStatus] ?? u.status}</Badge>
            {u.ownerToAsk ? <Badge variant="outline">À demander : {u.ownerToAsk}</Badge> : null}
          </div>
          {u.resolution ? <p className="mt-2 text-[11px] italic text-emerald-700 dark:text-emerald-300">✓ {u.resolution}</p> : null}
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Sujet *" name="topic" defaultValue={item?.topic} required />
          <TextareaField label="Question ouverte *" name="question" defaultValue={item?.question ?? ""} />
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Sévérité" name="severity" defaultValue={item?.severity ?? "MEDIUM"} options={UNCERTAINTY_SEVERITIES.map((s) => ({ value: s, label: s }))} />
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "OPEN"} options={UNCERTAINTY_STATUSES.map((s) => ({ value: s, label: UNCERTAINTY_STATUS_LABELS[s] }))} />
            <Field label="À demander à" name="ownerToAsk" defaultValue={item?.ownerToAsk ?? ""} />
          </div>
          <TextareaField label="Résolution (si trouvée)" name="resolution" defaultValue={item?.resolution ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
