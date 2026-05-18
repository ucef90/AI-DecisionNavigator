"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScoreInput } from "@/components/scoring/score-input";
import { TextareaField } from "@/components/atelier1/editors/form-fields";
import type { ScoreValue } from "@/types/score-levels";

// Éditeur générique pour les sections multi-axes 1-5 (maturity, feasibility).
// Le ScoreInput est contrôlé en local (state), le reste du formulaire
// (notes, lists) est en form natif. Au submit on injecte les scores
// dans le FormData avant de l'envoyer à l'action.

export type AxisDef = { name: string; label: string; axisKey: string };

export function ScoreAxesEditor({
  axes,
  defaults,
  notesName,
  notesLabel,
  notesDefaultValue,
  action,
  extraAfter,
}: {
  axes: AxisDef[];
  defaults: Record<string, number | null>;
  notesName: string;
  notesLabel: string;
  notesDefaultValue: string;
  action: (formData: FormData) => Promise<void>;
  extraAfter?: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, number | null>>(() => {
    const init: Record<string, number | null> = {};
    for (const a of axes) init[a.name] = defaults[a.name] ?? null;
    return init;
  });

  return (
    <form
      action={(formData) => {
        // Injection des scores dans FormData
        for (const a of axes) {
          const v = values[a.name];
          if (v != null) formData.set(a.name, String(v));
        }
        startTransition(async () => {
          await action(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {axes.map((a) => (
          <ScoreInput
            key={a.name}
            axis={a.axisKey}
            label={a.label}
            value={values[a.name]}
            onChange={(v: ScoreValue) => setValues((p) => ({ ...p, [a.name]: v }))}
            compact
          />
        ))}
      </div>

      {extraAfter}

      <TextareaField label={notesLabel} name={notesName} defaultValue={notesDefaultValue} rows={3} />

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}><Save className="mr-1.5 h-4 w-4" />{pending ? "..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
