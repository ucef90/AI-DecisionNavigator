"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { HelpHint } from "@/components/ui/help-hint";
import { getHint } from "@/lib/field-hints";
import { DOC_COMPLEXITY_LABELS, DOC_COMPLEXITY_LEVELS, DOC_EXPLOITABILITIES, DOC_EXPLOITABILITY_LABELS, DOC_STRUCTURE_LABELS, DOC_STRUCTURE_LEVELS } from "@/types/atelier3";

function CB({ label, name }: { label: string; name: string }) {
  const h = getHint(name);
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      {h ? <HelpHint hint={h} /> : null}
    </span>
  );
}

export type DocumentAnalysisDefaults = {
  documentsExist: boolean;
  formats: string;       // comma-separated
  structureLevel: string;
  exploitability: string;
  interpretationNeeded: boolean;
  estimatedVolume: string;
  ocrNeeded: boolean;
  nlpNeeded: boolean;
  ragNeeded: boolean;
  complexityLevel: string;
  notes: string;
};

export function DocumentAnalysisEditor({ defaults, action }: { defaults: DocumentAnalysisDefaults; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(formData) => { startTransition(async () => { await action(formData); setSaved(true); setTimeout(() => setSaved(false), 2500); }); }} className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="documentsExist" defaultChecked={defaults.documentsExist} />
        <CB label="Des documents sont concernés par le projet" name="documentsExist" />
      </label>

      <Field label="Formats (séparés par ,)" name="formats" defaultValue={defaults.formats} placeholder="PDF, DOCX, JPG (scan), Email HTML" />
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField label="Structure" name="structureLevel" defaultValue={defaults.structureLevel || "MIXED"} options={DOC_STRUCTURE_LEVELS.map((v) => ({ value: v, label: DOC_STRUCTURE_LABELS[v] }))} />
        <SelectField label="Exploitabilité" name="exploitability" defaultValue={defaults.exploitability || "MODERATE"} options={DOC_EXPLOITABILITIES.map((v) => ({ value: v, label: DOC_EXPLOITABILITY_LABELS[v] }))} />
        <SelectField label="Complexité" name="complexityLevel" defaultValue={defaults.complexityLevel || "MEDIUM"} options={DOC_COMPLEXITY_LEVELS.map((v) => ({ value: v, label: DOC_COMPLEXITY_LABELS[v] }))} />
      </div>
      <Field label="Volume estimé" name="estimatedVolume" defaultValue={defaults.estimatedVolume} placeholder="ex. 3000 docs/mois" />

      <fieldset className="rounded-md border border-border bg-background p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Technos nécessaires</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><Checkbox name="interpretationNeeded" defaultChecked={defaults.interpretationNeeded} /> <CB label="Interprétation humaine nécessaire" name="interpretationNeeded" /></label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="ocrNeeded" defaultChecked={defaults.ocrNeeded} /> <CB label="OCR (PDF / scans)" name="ocrNeeded" /></label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="nlpNeeded" defaultChecked={defaults.nlpNeeded} /> <CB label="NLP (compréhension texte)" name="nlpNeeded" /></label>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="ragNeeded" defaultChecked={defaults.ragNeeded} /> <CB label="RAG (recherche augmentée)" name="ragNeeded" /></label>
        </div>
      </fieldset>

      <TextareaField label="Notes" name="notes" defaultValue={defaults.notes} rows={3} />

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}><Save className="mr-1.5 h-4 w-4" />{pending ? "..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
