"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextareaField } from "@/components/atelier1/editors/form-fields";
import { ScoreInput } from "@/components/scoring/score-input";
import { ScoreScaleInfo } from "@/components/help/score-scale-info";
import { HelpHint } from "@/components/ui/help-hint";
import { getHint } from "@/lib/field-hints";
import type { ScoreValue } from "@/types/score-levels";

function FLabel({ label, name }: { label: string; name: string }) {
  const h = getHint(name);
  return (
    <label className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>{label}</span>
      {h ? <HelpHint hint={h} /> : null}
    </label>
  );
}

export type VisionDefaults = {
  visionStatement: string;
  businessValue: string;
  strategicObjectivesText: string; // one per line
  transformationGoalsText: string;
  successCriteriaText: string;
  businessValueScore: number | null;
  transformationScore: number | null;
};

export function VisionEditor({ defaults, action }: { defaults: VisionDefaults; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [bvScore, setBvScore] = useState<number | null>(defaults.businessValueScore);
  const [trScore, setTrScore] = useState<number | null>(defaults.transformationScore);

  return (
    <form
      action={(formData) => {
        if (bvScore != null) formData.set("businessValueScore", String(bvScore));
        if (trScore != null) formData.set("transformationScore", String(trScore));
        startTransition(async () => {
          await action(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
      className="space-y-4"
    >
      <TextareaField label="Énoncé de vision (métier, pas techno)" name="visionStatement" defaultValue={defaults.visionStatement} rows={3} placeholder="ex. Faire de notre service email l'expérience de référence du secteur..." />
      <TextareaField label="Valeur business attendue (chiffrée si possible)" name="businessValue" defaultValue={defaults.businessValue} rows={3} placeholder="ex. -30% délai de traitement, +20% satisfaction client" />

      <ScoreScaleInfo
        axes={[
          { axisKey: "businessValue", label: "Valeur business" },
          { axisKey: "transformation", label: "Transformation" },
        ]}
        title="Comment scorer Valeur business (1-5) et Transformation (1-5) ?"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <ScoreInput axis="businessValue" name="businessValueScore" label="Score valeur business" value={bvScore} onChange={(v: ScoreValue) => setBvScore(v)} compact />
        <ScoreInput axis="transformation" name="transformationScore" label="Score transformation" value={trScore} onChange={(v: ScoreValue) => setTrScore(v)} compact />
      </div>

      <div className="space-y-1">
        <FLabel label="Objectifs stratégiques (un par ligne)" name="strategicObjectives" />
        <Textarea name="strategicObjectives" rows={4} defaultValue={defaults.strategicObjectivesText} placeholder={"Réduire le délai moyen de réponse à 24h\nIndustrialiser le traitement de 80% des emails"} />
      </div>

      <div className="space-y-1">
        <FLabel label="Objectifs de transformation (un par ligne)" name="transformationGoals" />
        <Textarea name="transformationGoals" rows={3} defaultValue={defaults.transformationGoalsText} placeholder={"Désiloter données métier et IA\nFormation agents au pilotage IA"} />
      </div>

      <div className="space-y-1">
        <FLabel label="Critères de succès SMART (un par ligne)" name="successCriteria" />
        <Textarea name="successCriteria" rows={3} defaultValue={defaults.successCriteriaText} placeholder={"Délai moyen réponse < 24h à 6 mois\nTaux d'adoption agents > 80%"} />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}><Save className="mr-1.5 h-4 w-4" />{pending ? "..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
