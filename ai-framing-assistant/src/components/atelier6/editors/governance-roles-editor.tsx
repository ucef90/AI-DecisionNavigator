"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RACI_COLORS, RACI_LABELS, RACI_TYPES, type RaciType } from "@/types/atelier6";

export type RaciRow = { id: string; scope: string; actorRole: string; responsibilityType: string; actorName: string | null; description: string | null };

export function GovernanceRolesEditor({ items, onCreate, onUpdate, onDelete }: {
  items: RaciRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<RaciRow>
      items={items}
      emptyMessage="Aucune entrée RACI. Définis qui est R/A/C/I sur chaque scope clé."
      addLabel="Ajouter une entrée RACI"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(r) => (
        <div className="rounded-md border border-border bg-background p-3 pr-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", RACI_COLORS[r.responsibilityType as RaciType])}>{r.responsibilityType}</span>
            <span className="font-semibold">{r.actorRole}</span>
            <span className="text-xs text-muted-foreground">→</span>
            <Badge variant="outline" className="text-[10px]">{r.scope}</Badge>
          </div>
          {r.actorName ? <p className="mt-1 text-xs text-muted-foreground">{r.actorName}</p> : null}
          {r.description ? <p className="mt-1 text-xs">{r.description}</p> : null}
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Scope * (ex. Conformité RGPD)" name="scope" defaultValue={item?.scope ?? ""} required />
            <SelectField label="R / A / C / I" name="responsibilityType" defaultValue={item?.responsibilityType ?? "R"} options={RACI_TYPES.map((r) => ({ value: r, label: `${r} — ${RACI_LABELS[r]}` }))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Rôle * (ex. DPO, RSSI)" name="actorRole" defaultValue={item?.actorRole ?? ""} required />
            <Field label="Nom (optionnel)" name="actorName" defaultValue={item?.actorName ?? ""} />
          </div>
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
