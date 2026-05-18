"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { EU_AI_ACT_TIERS, EU_AI_ACT_TIER_LABELS } from "@/types/atelier3";

export type RegulatoryDefaults = {
  rgpdApplicable: boolean;
  sensitiveDataConcerned: boolean;
  legalObligationsText: string; // one per line
  auditRequired: boolean;
  dpoConsulted: boolean;
  cnilConsultation: boolean;
  euAiActTier: string;
  euAiActJustification: string;
  notes: string;
};

export function RegulatoryEditor({ defaults, action }: { defaults: RegulatoryDefaults; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(formData) => { startTransition(async () => { await action(formData); setSaved(true); setTimeout(() => setSaved(false), 2500); }); }} className="space-y-4">
      <fieldset className="rounded-md border border-border bg-background p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicabilité réglementaire</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><Checkbox name="rgpdApplicable" defaultChecked={defaults.rgpdApplicable} /> RGPD applicable</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="sensitiveDataConcerned" defaultChecked={defaults.sensitiveDataConcerned} /> Données sensibles concernées</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="auditRequired" defaultChecked={defaults.auditRequired} /> Audit requis</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="dpoConsulted" defaultChecked={defaults.dpoConsulted} /> ✓ DPO consulté</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="cnilConsultation" defaultChecked={defaults.cnilConsultation} /> Consultation CNIL</label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <SelectField label="EU AI Act — Tier" name="euAiActTier" defaultValue={defaults.euAiActTier || "NONE"} options={EU_AI_ACT_TIERS.map((v) => ({ value: v, label: EU_AI_ACT_TIER_LABELS[v] }))} />
        <TextareaField label="Justification du tier" name="euAiActJustification" defaultValue={defaults.euAiActJustification} rows={2} />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Obligations légales (une par ligne)</label>
        <Textarea name="legalObligations" rows={4} defaultValue={defaults.legalObligationsText} placeholder={"RGPD — Art. 5 minimisation\nRGPD — Art. 13-14 information\n..."} />
      </div>

      <TextareaField label="Notes" name="notes" defaultValue={defaults.notes} rows={2} />

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}><Save className="mr-1.5 h-4 w-4" />{pending ? "..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
