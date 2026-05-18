"use client";

import { useState, useTransition } from "react";
import { Save, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { HelpHint } from "@/components/ui/help-hint";
import { getHint } from "@/lib/field-hints";

function FLabel({ label, name }: { label: string; name: string }) {
  const h = getHint(name);
  return (
    <label className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>{label}</span>
      {h ? <HelpHint hint={h} /> : null}
    </label>
  );
}

export type SynthesisDefaults = {
  overallStatement: string;
  industrializationReadiness: boolean;
  strongPointsText: string; // one per line
  weakPointsText: string;
  priorityActionsText: string;
};

export type SynthesisSuggested = {
  overallStatement: string;
  industrializationReadiness: boolean;
  strongPoints: string[];
  weakPoints: string[];
  priorityActions: string[];
};

export function A6SynthesisEditor({
  defaults,
  suggested,
  action,
}: {
  defaults: SynthesisDefaults;
  suggested: SynthesisSuggested;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [overallStatement, setOverallStatement] = useState(defaults.overallStatement);
  const [industrialization, setIndustrialization] = useState(defaults.industrializationReadiness);
  const [strong, setStrong] = useState(defaults.strongPointsText);
  const [weak, setWeak] = useState(defaults.weakPointsText);
  const [actions, setActions] = useState(defaults.priorityActionsText);

  const fillSuggested = () => {
    setOverallStatement(suggested.overallStatement);
    setIndustrialization(suggested.industrializationReadiness);
    setStrong(suggested.strongPoints.join("\n"));
    setWeak(suggested.weakPoints.join("\n"));
    setActions(suggested.priorityActions.join("\n"));
  };

  return (
    <form
      action={(formData) => {
        formData.set("overallStatement", overallStatement);
        formData.set("strongPoints", strong);
        formData.set("weakPoints", weak);
        formData.set("priorityActions", actions);
        if (industrialization) formData.set("industrializationReadiness", "on");
        else formData.delete("industrializationReadiness");
        startTransition(async () => {
          await action(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
      className="space-y-4"
    >
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={fillSuggested}>
          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
          Pré-remplir avec la suggestion moteur
        </Button>
      </div>

      <div className="space-y-1">
        <FLabel label="Statement gouvernance (vision globale)" name="overallStatement" />
        <Textarea
          rows={3}
          value={overallStatement}
          onChange={(e) => setOverallStatement(e.target.value)}
          placeholder="ex. Gouvernance solide (72/100) — passage à l'industrialisation envisageable."
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={industrialization}
          onCheckedChange={(c) => setIndustrialization(Boolean(c))}
        />
        Industrialisation envisageable
        {getHint("industrializationReadiness") ? <HelpHint hint={getHint("industrializationReadiness")!} /> : null}
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <FLabel label="Points forts (un par ligne)" name="strongPoints" />
          <Textarea
            rows={5}
            value={strong}
            onChange={(e) => setStrong(e.target.value)}
            placeholder={"Gouvernance (RACI) (78/100)\nMonitoring & supervision (72/100)"}
          />
        </div>
        <div className="space-y-1">
          <FLabel label="Points faibles (un par ligne)" name="weakPoints" />
          <Textarea
            rows={5}
            value={weak}
            onChange={(e) => setWeak(e.target.value)}
            placeholder={"Sécurité (35/100)\nConformité (32/100)"}
          />
        </div>
        <div className="space-y-1">
          <FLabel label="Actions prioritaires (une par ligne)" name="priorityActions" />
          <Textarea
            rows={5}
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            placeholder={"Définir le RACI...\nCompléter la checklist RGPD..."}
          />
        </div>
      </div>

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
