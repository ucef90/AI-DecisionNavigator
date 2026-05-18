"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ASSUMPTION_STATUSES, ASSUMPTION_STATUS_LABELS, ASSUMPTION_TYPES, ASSUMPTION_TYPE_LABELS, RISK_LEVELS, RISK_LEVEL_LABELS, type AssumptionStatus, type AssumptionType, type RiskLevel } from "@/types/atelier1";

export type AssumptionRow = { id: string; statement: string; assumptionType: string; riskIfWrong: string; status: string; validationPlan: string | null };

const STATUS_BG = {
  UNVERIFIED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  IN_PROGRESS: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20",
  VALIDATED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  INVALIDATED: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export function AssumptionsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: AssumptionRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<AssumptionRow>
      items={items}
      emptyMessage="Aucune hypothèse. Explicite ce que tu tiens pour acquis."
      addLabel="Ajouter une hypothèse"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(a) => (
        <div className={cn("rounded-md border p-3 pr-20", STATUS_BG[a.status as AssumptionStatus])}>
          <p className="text-sm">{a.statement}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <Badge variant="outline">{ASSUMPTION_TYPE_LABELS[a.assumptionType as AssumptionType] ?? a.assumptionType}</Badge>
            <Badge variant="outline">Risque si fausse : {RISK_LEVEL_LABELS[a.riskIfWrong as RiskLevel] ?? a.riskIfWrong}</Badge>
            <Badge variant="outline">{ASSUMPTION_STATUS_LABELS[a.status as AssumptionStatus] ?? a.status}</Badge>
          </div>
          {a.validationPlan ? <p className="mt-2 text-[11px] italic text-muted-foreground">Vérification : {a.validationPlan}</p> : null}
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <TextareaField label="Hypothèse *" name="statement" defaultValue={item?.statement ?? ""} />
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Type" name="assumptionType" defaultValue={item?.assumptionType ?? "BUSINESS"} options={ASSUMPTION_TYPES.map((t) => ({ value: t, label: ASSUMPTION_TYPE_LABELS[t] }))} />
            <SelectField label="Risque si fausse" name="riskIfWrong" defaultValue={item?.riskIfWrong ?? "MEDIUM"} options={RISK_LEVELS.map((r) => ({ value: r, label: RISK_LEVEL_LABELS[r] }))} />
            <SelectField label="Statut" name="status" defaultValue={item?.status ?? "UNVERIFIED"} options={ASSUMPTION_STATUSES.map((s) => ({ value: s, label: ASSUMPTION_STATUS_LABELS[s] }))} />
          </div>
          <TextareaField label="Plan de vérification" name="validationPlan" defaultValue={item?.validationPlan ?? ""} />
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
