"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScoringState } from "@/lib/actions/scoring";
import {
  SCORING_AXES,
  SCORING_AXIS_LABELS,
  type AxisScore,
} from "@/lib/engines/scoring";
import { DECISIONS, DECISION_LABELS, type Decision } from "@/types";

export type ScoringFormDefaults = {
  axes: AxisScore[]; // auto-computed defaults
  recommendation: Decision;
  justification: string;
};

const NOTE_LABELS: Record<1 | 2 | 3, string> = {
  1: "1 — Critique",
  2: "2 — Moyen",
  3: "3 — Maîtrisé",
};

export function ScoringForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: ScoringState | undefined,
    form: FormData,
  ) => Promise<ScoringState>;
  defaults: ScoringFormDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold">6 axes de scoring</h3>
          <FieldHint>
            Notes auto-calculées par le moteur depuis tes réponses du wizard.
            Tu peux les surcharger : chaque axe doit rester noté de 1 à 3.
          </FieldHint>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCORING_AXES.map((axisId) => {
            const axis = defaults.axes.find((a) => a.id === axisId)!;
            return (
              <div
                key={axisId}
                className="rounded-md border border-border bg-background p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor={axisId}
                    className="text-sm font-medium"
                  >
                    {SCORING_AXIS_LABELS[axisId]}
                  </Label>
                  <select
                    id={axisId}
                    name={axisId}
                    defaultValue={String(axis.value)}
                    className="h-8 w-32 shrink-0 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {NOTE_LABELS[n as 1 | 2 | 3]}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {axis.rationale}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Confiance moteur : {axis.confidence.toLowerCase()}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="recommendation">Recommandation</Label>
          <FieldHint>
            Auto-déduite du total selon SPEC §177 (≥15 → GO, ≥10 → POC, ≥6
            → étude, sinon NO GO). Tu peux la surcharger.
          </FieldHint>
        </div>
        <select
          id="recommendation"
          name="recommendation"
          defaultValue={defaults.recommendation}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          {DECISIONS.map((d) => (
            <option key={d} value={d}>
              {DECISION_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="justification">Justification</Label>
          <FieldHint>
            Texte libre. Sera repris dans la fiche de décision et la note de cadrage.
          </FieldHint>
        </div>
        <Textarea
          id="justification"
          name="justification"
          rows={5}
          defaultValue={defaults.justification}
          placeholder="Ex. : Maturité data faible — préférer un POC sur un sous-périmètre…"
        />
      </div>

      <input type="hidden" name="_projectId" value={projectId} />
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer & voir la décision →"}
        </Button>
      </div>
    </form>
  );
}
