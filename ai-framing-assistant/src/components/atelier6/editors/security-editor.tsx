"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SECURITY_DOMAINS, SECURITY_DOMAIN_LABELS, SECURITY_STATUSES, SECURITY_STATUS_COLORS, SECURITY_STATUS_LABELS, type SecurityDomain, type SecurityStatus } from "@/types/atelier6";

export type SecurityRow = { id: string; domain: string; name: string; status: string; description: string | null; responsibleRole: string | null };

export function SecurityEditor({ items, onCreate, onUpdate, onDelete }: {
  items: SecurityRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<SecurityRow>
      items={items}
      emptyMessage="Aucun contrôle sécurité. Définis SSO/MFA, RBAC, chiffrement, logs, monitoring…"
      addLabel="Ajouter un contrôle"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(c) => (
        <div className={cn("rounded-md border p-3 pr-20", SECURITY_STATUS_COLORS[c.status as SecurityStatus])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{c.name}</div>
              {c.description ? <p className="mt-1 text-xs">{c.description}</p> : null}
              {c.responsibleRole ? <p className="mt-1 text-[11px] italic text-muted-foreground">Responsable : {c.responsibleRole}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px]">{SECURITY_DOMAIN_LABELS[c.domain as SecurityDomain] ?? c.domain}</Badge>
              <Badge variant="outline" className="text-[9px]">{SECURITY_STATUS_LABELS[c.status as SecurityStatus] ?? c.status}</Badge>
            </div>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <Field label="Nom du contrôle *" name="name" defaultValue={item?.name ?? ""} required placeholder="ex. SSO + MFA pour tous les accès" />
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Domaine" name="domain" defaultValue={item?.domain ?? "AUTH"} options={SECURITY_DOMAINS.map((d) => ({ value: d, label: SECURITY_DOMAIN_LABELS[d] }))} />
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "PLANNED"} options={SECURITY_STATUSES.map((s) => ({ value: s, label: SECURITY_STATUS_LABELS[s] }))} />
          </div>
          <Field label="Responsable" name="responsibleRole" defaultValue={item?.responsibleRole ?? ""} />
          <TextareaField label="Description" name="description" defaultValue={item?.description ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
