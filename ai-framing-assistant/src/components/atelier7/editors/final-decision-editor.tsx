"use client";

import { useState, useTransition } from "react";
import { Save, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectField, TextareaField } from "@/components/atelier1/editors/form-fields";
import { DECISIONS, DECISION_LABELS, type Decision } from "@/types";
import { SPONSOR_DECISIONS, SPONSOR_DECISION_LABELS, type SponsorDecision } from "@/types/atelier7";

export type FinalDecisionDefaults = {
  finalDecision: Decision | "";
  decisionRationale: string;
  strongPointsText: string;
  weakPointsText: string;
  mainRisksText: string;
  roadmapSummary: string;
  industrializationStrategy: string;
  governanceStrategy: string;
  pilotageStrategy: string;
  sponsorDecision: SponsorDecision | "";
  sponsorName: string;
};

export type FinalDecisionSuggestion = {
  decision: Decision;
  rationale: string;
  strongPoints: string[];
  weakPoints: string[];
  mainRisks: string[];
};

export function FinalDecisionEditor({
  defaults,
  suggested,
  action,
}: {
  defaults: FinalDecisionDefaults;
  suggested: FinalDecisionSuggestion;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [finalDecision, setFinalDecision] = useState<Decision | "">(defaults.finalDecision);
  const [rationale, setRationale] = useState(defaults.decisionRationale);
  const [strong, setStrong] = useState(defaults.strongPointsText);
  const [weak, setWeak] = useState(defaults.weakPointsText);
  const [risks, setRisks] = useState(defaults.mainRisksText);

  const fillSuggested = () => {
    setFinalDecision(suggested.decision);
    setRationale(suggested.rationale);
    setStrong(suggested.strongPoints.join("\n"));
    setWeak(suggested.weakPoints.join("\n"));
    setRisks(suggested.mainRisks.join("\n"));
  };

  return (
    <form
      action={(formData) => {
        if (finalDecision) formData.set("finalDecision", finalDecision);
        formData.set("decisionRationale", rationale);
        formData.set("strongPoints", strong);
        formData.set("weakPoints", weak);
        formData.set("mainRisks", risks);
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

      <fieldset className="rounded-md border border-foreground/20 bg-muted/20 p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider">Décision finale</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Décision</label>
            <select
              value={finalDecision}
              onChange={(e) => setFinalDecision(e.target.value as Decision | "")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— Choisir —</option>
              {DECISIONS.map((d) => (
                <option key={d} value={d}>{DECISION_LABELS[d]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rationnel</label>
          <Textarea rows={3} value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Explique en 2-3 phrases pourquoi cette décision (score, conditions, contraintes)." />
        </div>
      </fieldset>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Points forts (un par ligne)</label>
          <Textarea rows={5} value={strong} onChange={(e) => setStrong(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Points faibles (un par ligne)</label>
          <Textarea rows={5} value={weak} onChange={(e) => setWeak(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Risques principaux (un par ligne)</label>
          <Textarea rows={5} value={risks} onChange={(e) => setRisks(e.target.value)} />
        </div>
      </div>

      <fieldset className="rounded-md border border-border bg-background p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stratégies (résumés exécutifs)</legend>
        <div className="space-y-2">
          <TextareaField label="Stratégie industrialisation" name="industrializationStrategy" defaultValue={defaults.industrializationStrategy} rows={2} />
          <TextareaField label="Stratégie gouvernance" name="governanceStrategy" defaultValue={defaults.governanceStrategy} rows={2} />
          <TextareaField label="Stratégie pilotage" name="pilotageStrategy" defaultValue={defaults.pilotageStrategy} rows={2} />
          <TextareaField label="Roadmap résumée (texte exécutif)" name="roadmapSummary" defaultValue={defaults.roadmapSummary} rows={2} />
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-foreground/20 bg-muted/20 p-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider">Validation sponsor</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <SelectField
            label="Décision sponsor"
            name="sponsorDecision"
            defaultValue={defaults.sponsorDecision || ""}
            options={[{ value: "", label: "— Non décidé —" }, ...SPONSOR_DECISIONS.map((s) => ({ value: s, label: SPONSOR_DECISION_LABELS[s] }))]}
          />
          <Field label="Nom du sponsor" name="sponsorName" defaultValue={defaults.sponsorName} placeholder="ex. Marie Dupont, Directrice métier" />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}><Save className="mr-1.5 h-4 w-4" />{pending ? "..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
