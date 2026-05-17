"use client";

import { useState, useTransition } from "react";
import { Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_LEVELS, type PriorityLevel } from "@/types/atelier4";

const PRIO_CLASS: Record<PriorityLevel, string> = {
  STRATEGIC: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  HIGH: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  MEDIUM: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  LOW: "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
  DEPRIORITIZED: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

type Props = {
  initial: { level: PriorityLevel | ""; justification: string; notes: string };
  suggested: { level: PriorityLevel; rationale: string };
  onSave: (data: { level: PriorityLevel | ""; justification: string; notes: string }) => Promise<void>;
};

export function PriorityEditor({ initial, suggested, onSave }: Props) {
  const [level, setLevel] = useState<PriorityLevel | "">(initial.level);
  const [justification, setJustification] = useState(initial.justification);
  const [notes, setNotes] = useState(initial.notes);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const acceptSuggested = () => {
    setLevel(suggested.level);
    if (!justification.trim()) setJustification(suggested.rationale);
    setSaved(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-md border border-foreground/15 bg-muted/30 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground/60" />
          <div>
            <div className="font-semibold">
              Priorité suggérée : {PRIORITY_LABELS[suggested.level]}
            </div>
            <p className="text-xs text-muted-foreground">{suggested.rationale}</p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={acceptSuggested}>
          Accepter la suggestion
        </Button>
      </div>

      <section className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Niveau de priorité
        </label>
        <div className="grid gap-2 sm:grid-cols-5">
          {PRIORITY_LEVELS.map((p) => {
            const active = level === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setLevel(active ? "" : p);
                  setSaved(false);
                }}
                className={cn(
                  "rounded-md border px-3 py-3 text-xs font-medium transition",
                  active ? PRIO_CLASS[p] : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <div className="text-sm font-semibold">{PRIORITY_LABELS[p]}</div>
                <div className="mt-0.5 text-[10px] opacity-70">
                  {p === "STRATEGIC" && "Projet pilier"}
                  {p === "HIGH" && "À lancer"}
                  {p === "MEDIUM" && "POC à cadrer"}
                  {p === "LOW" && "Étude"}
                  {p === "DEPRIORITIZED" && "Reporter"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-1.5">
        <label className="text-xs font-semibold">Justification</label>
        <Textarea
          value={justification}
          onChange={(e) => {
            setJustification(e.target.value);
            setSaved(false);
          }}
          rows={4}
          placeholder={suggested.rationale}
        />
        <p className="text-[10px] text-muted-foreground">
          Pourquoi cette priorité ? (lien avec stratégie direction, ROI, contraintes calendrier...)
        </p>
      </section>

      <section className="space-y-1.5">
        <label className="text-xs font-semibold">Notes de comparaison (autres projets)</label>
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Optionnel : positionnement vs autres projets du portefeuille (ex. plus prioritaire que X car Y)."
        />
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {saved ? (
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span>
        ) : null}
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await onSave({ level, justification, notes });
              setSaved(true);
            })
          }
        >
          <Save className="mr-1.5 h-4 w-4" />
          Enregistrer la priorité
        </Button>
      </div>
    </div>
  );
}
