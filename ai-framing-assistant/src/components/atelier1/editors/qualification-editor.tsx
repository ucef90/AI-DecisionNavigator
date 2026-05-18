"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export type QualificationDefaults = {
  directionConcerned: string;
  businessOwner: string;
  triggerEvent: string;
  priorityReason: string;
  strategicAlignment: string;
  regulatoryPressure: boolean;
  operationalOverload: boolean;
  serviceDegradation: boolean;
  driverVolumeIncrease: boolean;
  driverResourceShortage: boolean;
  driverFrequentErrors: boolean;
  driverPoorUserExperience: boolean;
  driverManualWorkflow: boolean;
  driverLowTraceability: boolean;
  driverHighDelays: boolean;
};

export function QualificationEditor({ defaults, action }: { defaults: QualificationDefaults; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(formData) => {
      startTransition(async () => {
        await action(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      });
    }} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Direction concernée" name="directionConcerned" defaultValue={defaults.directionConcerned} placeholder="ex. Direction Relation Citoyenne" />
        <Field label="Sponsor / Responsable métier" name="businessOwner" defaultValue={defaults.businessOwner} placeholder="ex. Mme Dupont, Resp. accueil" />
      </div>
      <TextareaField label="Déclencheur" name="triggerEvent" defaultValue={defaults.triggerEvent} placeholder="Quel événement a fait monter ce besoin ?" />
      <TextareaField label="Pourquoi prioritaire" name="priorityReason" defaultValue={defaults.priorityReason} />
      <TextareaField label="Alignement stratégique" name="strategicAlignment" defaultValue={defaults.strategicAlignment} />

      <fieldset className="rounded-md border border-border bg-background p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drivers (à cocher)</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <CheckField label="Pression réglementaire" name="regulatoryPressure" defaultChecked={defaults.regulatoryPressure} />
          <CheckField label="Surcharge opérationnelle" name="operationalOverload" defaultChecked={defaults.operationalOverload} />
          <CheckField label="Dégradation service" name="serviceDegradation" defaultChecked={defaults.serviceDegradation} />
          <CheckField label="Hausse volumétrie" name="driverVolumeIncrease" defaultChecked={defaults.driverVolumeIncrease} />
          <CheckField label="Manque ressources" name="driverResourceShortage" defaultChecked={defaults.driverResourceShortage} />
          <CheckField label="Erreurs fréquentes" name="driverFrequentErrors" defaultChecked={defaults.driverFrequentErrors} />
          <CheckField label="Mauvaise expérience" name="driverPoorUserExperience" defaultChecked={defaults.driverPoorUserExperience} />
          <CheckField label="Workflow manuel" name="driverManualWorkflow" defaultChecked={defaults.driverManualWorkflow} />
          <CheckField label="Faible traçabilité" name="driverLowTraceability" defaultChecked={defaults.driverLowTraceability} />
          <CheckField label="Délais élevés" name="driverHighDelays" defaultChecked={defaults.driverHighDelays} />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}>
          <Save className="mr-1.5 h-4 w-4" />
          {pending ? "..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
function TextareaField({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Textarea name={name} rows={2} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
function CheckField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <Checkbox name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}
