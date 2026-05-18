"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextareaField } from "./form-fields";

export type BusinessNeedDefaults = {
  initialRequest: string;
  reformulatedNeed: string;
  expectedValue: string;
  expectedOutcome: string;
  usersImpacted: string;
  problemStatement: string;
  currentImpactSummary: string;
  expectedResultSummary: string;
};

type Variant = "reformulation" | "value" | "synthesis";

export function BusinessNeedEditor({
  defaults,
  variant,
  action,
}: {
  defaults: BusinessNeedDefaults;
  variant: Variant;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Champs à afficher selon le variant
  const fields = (() => {
    if (variant === "reformulation") {
      return [
        { name: "initialRequest", label: "Demande initiale (telle qu'exprimée)", value: defaults.initialRequest, rows: 3 },
        { name: "reformulatedNeed", label: "Besoin reformulé (sans techno)", value: defaults.reformulatedNeed, rows: 4 },
        { name: "usersImpacted", label: "Utilisateurs impactés", value: defaults.usersImpacted, rows: 2 },
      ];
    }
    if (variant === "value") {
      return [
        { name: "expectedValue", label: "Valeur métier attendue", value: defaults.expectedValue, rows: 3 },
        { name: "expectedOutcome", label: "Résultat attendu chiffré", value: defaults.expectedOutcome, rows: 3 },
      ];
    }
    return [
      { name: "problemStatement", label: "Énoncé du problème métier (synthèse)", value: defaults.problemStatement, rows: 3 },
      { name: "currentImpactSummary", label: "Impact actuel (résumé)", value: defaults.currentImpactSummary, rows: 3 },
      { name: "expectedResultSummary", label: "Résultat attendu (résumé)", value: defaults.expectedResultSummary, rows: 3 },
    ];
  })();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
      className="space-y-4"
    >
      {/* Hidden : les autres champs non affichés doivent être préservés */}
      {(["initialRequest", "reformulatedNeed", "expectedValue", "expectedOutcome", "usersImpacted", "problemStatement", "currentImpactSummary", "expectedResultSummary"] as const)
        .filter((k) => !fields.some((f) => f.name === k))
        .map((k) => (
          <input key={k} type="hidden" name={k} value={defaults[k]} />
        ))}

      {fields.map((f) => (
        <TextareaField key={f.name} label={f.label} name={f.name} defaultValue={f.value} rows={f.rows} />
      ))}

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
