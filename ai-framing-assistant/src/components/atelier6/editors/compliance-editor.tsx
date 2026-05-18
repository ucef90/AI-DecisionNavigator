"use client";

import { EditableList, EditFormFooter } from "@/components/atelier1/editors/editable-list";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPLIANCE_FRAMEWORKS, COMPLIANCE_FRAMEWORK_LABELS, COMPLIANCE_STATUSES, COMPLIANCE_STATUS_COLORS, COMPLIANCE_STATUS_LABELS, type ComplianceFramework, type ComplianceStatus } from "@/types/atelier6";

export type ComplianceRow = { id: string; framework: string; requirementCode: string | null; requirement: string; status: string; evidence: string | null; responsibleRole: string | null };

export function ComplianceEditor({ items, onCreate, onUpdate, onDelete }: {
  items: ComplianceRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<ComplianceRow>
      items={items}
      emptyMessage="Aucun item de conformité. Liste obligations RGPD, EU AI Act, ISO 27001…"
      addLabel="Ajouter un item de conformité"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(c) => (
        <div className={cn("rounded-md border p-3 pr-20", COMPLIANCE_STATUS_COLORS[c.status as ComplianceStatus])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{COMPLIANCE_FRAMEWORK_LABELS[c.framework as ComplianceFramework] ?? c.framework}</Badge>
                {c.requirementCode ? <Badge variant="outline" className="text-[9px]">{c.requirementCode}</Badge> : null}
              </div>
              <p className="mt-1 text-sm">{c.requirement}</p>
              {c.evidence ? <p className="mt-1 text-[11px] italic text-muted-foreground">Preuve : {c.evidence}</p> : null}
              {c.responsibleRole ? <p className="mt-1 text-[10px] text-muted-foreground">Responsable : {c.responsibleRole}</p> : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-[9px]">{COMPLIANCE_STATUS_LABELS[c.status as ComplianceStatus] ?? c.status}</Badge>
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <SelectField label="Framework" name="framework" defaultValue={item?.framework ?? "RGPD"} options={COMPLIANCE_FRAMEWORKS.map((f) => ({ value: f, label: COMPLIANCE_FRAMEWORK_LABELS[f] }))} />
            <Field label="Code (optionnel)" name="requirementCode" defaultValue={item?.requirementCode ?? ""} placeholder="ex. Art. 5" />
          </div>
          <TextareaField label="Exigence *" name="requirement" defaultValue={item?.requirement ?? ""} rows={2} />
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "PARTIAL"} options={COMPLIANCE_STATUSES.map((s) => ({ value: s, label: COMPLIANCE_STATUS_LABELS[s] }))} />
            <Field label="Responsable" name="responsibleRole" defaultValue={item?.responsibleRole ?? ""} />
          </div>
          <Field label="Preuve / évidence" name="evidence" defaultValue={item?.evidence ?? ""} placeholder="ex. AIPD validée par DPO" />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
