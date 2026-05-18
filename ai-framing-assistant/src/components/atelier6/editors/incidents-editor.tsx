"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { INCIDENT_TYPES, INCIDENT_TYPE_LABELS, type IncidentType } from "@/types/atelier6";

export type IncidentRow = { id: string; incidentType: string; severity: string; detectionMethod: string | null; escalationPath: string | null; correctiveActions: string | null; postIncidentReview: boolean };

const SEV_BG = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function IncidentsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: IncidentRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<IncidentRow>
      items={items}
      emptyMessage="Aucun playbook incident. Définis hallucination, fuite data, classification…"
      addLabel="Ajouter un playbook"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(p) => (
        <div className={cn("rounded-md border p-3 pr-20", SEV_BG[p.severity as keyof typeof SEV_BG])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{INCIDENT_TYPE_LABELS[p.incidentType as IncidentType] ?? p.incidentType}</span>
                {p.postIncidentReview ? <Badge variant="outline" className="text-[9px]">+ Post-mortem</Badge> : null}
              </div>
              {p.detectionMethod ? <p className="mt-1 text-xs"><strong>Détection :</strong> {p.detectionMethod}</p> : null}
              {p.escalationPath ? <p className="mt-1 text-xs"><strong>Escalade :</strong> {p.escalationPath}</p> : null}
              {p.correctiveActions ? <p className="mt-1 text-xs"><strong>Actions :</strong> {p.correctiveActions}</p> : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-[9px]">{p.severity}</Badge>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Type d'incident" name="incidentType" defaultValue={item?.incidentType ?? "OTHER"} options={INCIDENT_TYPES.map((t) => ({ value: t, label: INCIDENT_TYPE_LABELS[t] }))} />
            <SelectField label="Sévérité" name="severity" defaultValue={item?.severity ?? "MEDIUM"} options={["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => ({ value: s, label: s }))} />
          </div>
          <TextareaField label="Méthode de détection" name="detectionMethod" defaultValue={item?.detectionMethod ?? ""} />
          <TextareaField label="Chemin d'escalade" name="escalationPath" defaultValue={item?.escalationPath ?? ""} />
          <TextareaField label="Actions correctives" name="correctiveActions" defaultValue={item?.correctiveActions ?? ""} />
          <label className="flex items-center gap-2 text-xs">
            <Checkbox name="postIncidentReview" defaultChecked={item?.postIncidentReview ?? false} />
            Post-mortem obligatoire
          </label>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
