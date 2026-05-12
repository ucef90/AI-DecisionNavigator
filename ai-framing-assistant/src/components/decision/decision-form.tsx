"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DecisionState } from "@/lib/actions/decision";
import { DECISIONS, DECISION_LABELS, type Decision } from "@/types";

export function DecisionForm({
  projectId,
  defaultDecision,
  action,
}: {
  projectId: string;
  defaultDecision: Decision;
  action: (
    prev: DecisionState | undefined,
    form: FormData,
  ) => Promise<DecisionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="decision">Décision retenue</Label>
        <select
          id="decision"
          name="decision"
          defaultValue={defaultDecision}
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
        <Label htmlFor="justification">Justification additionnelle (optionnel)</Label>
        <Textarea
          id="justification"
          name="justification"
          rows={4}
          placeholder="Ex. : Décision validée en COPIL, conditionnée à la mise en place d'une AIPD avant POC."
        />
      </div>

      <input type="hidden" name="_projectId" value={projectId} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Finalisation…" : "Finaliser la décision"}
        </Button>
      </div>
    </form>
  );
}
