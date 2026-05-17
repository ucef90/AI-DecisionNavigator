"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Save, ShieldAlert, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { A4GateCriterion } from "@/lib/engines/atelier4";

type GateVerdict = "NOT_READY" | "READY" | "OVERRIDE";

type Props = {
  criteria: A4GateCriterion[];
  currentVerdict: GateVerdict;
  decidedBy: string;
  overrideNotes: string;
  onSave: (data: {
    verdict: GateVerdict;
    decidedBy: string;
    overrideNotes: string;
  }) => Promise<void>;
};

export function GateEditor({
  criteria,
  currentVerdict,
  decidedBy: initialDecidedBy,
  overrideNotes: initialOverrideNotes,
  onSave,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [decidedBy, setDecidedBy] = useState(initialDecidedBy);
  const [overrideNotes, setOverrideNotes] = useState(initialOverrideNotes);

  const metCount = criteria.filter((c) => c.met).length;
  const allMet = metCount === criteria.length;

  const setVerdict = (v: GateVerdict) => {
    startTransition(async () => {
      await onSave({ verdict: v, decidedBy, overrideNotes });
      setSaved(true);
    });
  };

  return (
    <div className="space-y-5">
      {/* Banner verdict */}
      <div
        className={cn(
          "rounded-md border p-4",
          currentVerdict === "READY"
            ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            : currentVerdict === "OVERRIDE"
              ? "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
              : "border-foreground/20 bg-muted/30",
        )}
      >
        <div className="flex items-start gap-3">
          {currentVerdict === "READY" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
          ) : currentVerdict === "OVERRIDE" ? (
            <ShieldAlert className="mt-0.5 h-5 w-5" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5" />
          )}
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {currentVerdict === "READY"
                ? "Prêt pour l'atelier 5 (cartographie)"
                : currentVerdict === "OVERRIDE"
                  ? "Passage forcé (override)"
                  : "Pas encore prêt"}
            </div>
            <p className="text-xs opacity-80">
              {metCount} critère(s) sur {criteria.length} validé(s).
            </p>
          </div>
        </div>
      </div>

      {/* Criteria checklist */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          5 critères go/no-go
        </h3>
        <ul className="space-y-1.5">
          {criteria.map((c) => (
            <li
              key={c.id}
              className={cn(
                "flex items-start gap-3 rounded-md border px-3 py-2 text-sm",
                c.met
                  ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-border bg-background",
              )}
            >
              <span
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  c.met ? "bg-emerald-500" : "bg-muted",
                )}
              />
              <div className="flex-1">
                <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>
                  {c.label}
                </div>
                {!c.met && c.why ? (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{c.why}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Verdict actions */}
      <section className="space-y-3 rounded-md border border-border bg-background p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Verdict
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Décidé par</label>
            <Input
              value={decidedBy}
              onChange={(e) => {
                setDecidedBy(e.target.value);
                setSaved(false);
              }}
              placeholder="Ex. : Sponsor — Mme X · le 17/05/2026"
            />
          </div>
        </div>

        {!allMet ? (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Justification de l&apos;override</label>
            <Textarea
              value={overrideNotes}
              onChange={(e) => {
                setOverrideNotes(e.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Pourquoi passer à l'atelier 5 alors que tous les critères ne sont pas validés ? (risque assumé, contrainte calendrier, décision sponsor…)"
            />
            <p className="text-[10px] text-muted-foreground">
              Obligatoire pour OVERRIDE — documenter le risque pris.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          {saved ? (
            <span className="mr-auto text-xs text-emerald-700 dark:text-emerald-300">
              Sauvegardé.
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setVerdict("NOT_READY")}
          >
            Marquer non prêt
          </Button>
          {allMet ? (
            <Button type="button" disabled={pending} onClick={() => setVerdict("READY")}>
              <Save className="mr-1.5 h-4 w-4" />
              Valider le gate (READY)
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={pending || !overrideNotes.trim()}
              onClick={() => setVerdict("OVERRIDE")}
              className="border-amber-500/50"
            >
              <ShieldAlert className="mr-1.5 h-4 w-4" />
              Forcer le passage (OVERRIDE)
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
