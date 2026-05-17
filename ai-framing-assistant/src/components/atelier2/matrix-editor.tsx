"use client";

import { useState, useTransition } from "react";
import { Trash2, Sparkles, Plus, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TASK_NATURES,
  TASK_NATURE_LABELS,
  TASK_VERDICTS,
  TASK_VERDICT_COLORS,
  TASK_VERDICT_LABELS,
  type TaskNature,
  type TaskVerdict,
} from "@/types/atelier2";

// Editor for the IA-vs-auto matrix.
// One row per task. Verdict is changed by clicking one of the 4
// colored chips (AUTOMATION / AI / HUMAN / HYBRID). Complexity is
// a 1..5 slider. Justification is a textarea. Edits are persisted
// via Server Actions (passed as props from the parent page).

export type MatrixTask = {
  id: string;
  taskName: string;
  nature: string;
  verdict: string;
  complexity: number;
  justification: string | null;
};

type Props = {
  projectId: string;
  tasks: MatrixTask[];
  hasWorkflowSteps: boolean;
  // Server actions
  onUpdate: (taskId: string, patch: Partial<MatrixTask>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onSeed: () => Promise<{ created: number }>;
  // The create form submits via a separate <form>
  createAction: (formData: FormData) => void;
};

export function MatrixEditor({
  projectId,
  tasks,
  hasWorkflowSteps,
  onUpdate,
  onDelete,
  onSeed,
  createAction,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(tasks.length === 0);

  const verdictCounts = TASK_VERDICTS.reduce(
    (acc, v) => {
      acc[v] = tasks.filter((t) => t.verdict === v).length;
      return acc;
    },
    {} as Record<TaskVerdict, number>,
  );

  return (
    <div className="space-y-4">
      {/* Top summary — vue d'ensemble par verdict */}
      <div className="grid gap-2 sm:grid-cols-4">
        {TASK_VERDICTS.map((v) => (
          <div
            key={v}
            className={cn(
              "rounded-md border px-3 py-2 text-xs",
              TASK_VERDICT_COLORS[v],
            )}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-80">
              {TASK_VERDICT_LABELS[v]}
            </div>
            <div className="text-lg font-semibold tabular-nums">{verdictCounts[v]}</div>
          </div>
        ))}
      </div>

      {/* Seed depuis l'atelier 1 */}
      {hasWorkflowSteps && tasks.length === 0 ? (
        <div className="flex items-start gap-3 rounded-md border border-dashed border-foreground/30 bg-muted/30 p-4 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground/60" />
          <div className="flex-1">
            <div className="font-semibold">Pré-remplissage depuis l&apos;atelier 1</div>
            <p className="text-xs text-muted-foreground">
              Tu as déjà cartographié le workflow AS-IS à l&apos;atelier 1. Je peux
              importer les étapes ici pour démarrer la matrice — tu n&apos;auras plus qu&apos;à
              qualifier chaque étape (auto / IA / humain / hybride).
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-2"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const { created } = await onSeed();
                  setSeedNotice(
                    created === 0
                      ? "Aucune nouvelle tâche importée."
                      : `${created} tâche(s) importée(s) du workflow atelier 1.`,
                  );
                });
              }}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Importer les étapes
            </Button>
            {seedNotice ? (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{seedNotice}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Tasks list */}
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              pending={pending}
              onUpdate={(patch) => startTransition(() => onUpdate(task.id, patch))}
              onDelete={() => startTransition(() => onDelete(task.id))}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          Aucune tâche dans la matrice — commence par en ajouter une.
        </p>
      )}

      {/* Create row */}
      {showCreate ? (
        <form action={createAction} className="space-y-3 rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-foreground/60" />
            <h4 className="text-sm font-semibold">Nouvelle tâche</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem_8rem]">
            <Input name="taskName" placeholder="Ex. : Lecture des emails entrants" required />
            <select
              name="nature"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="OTHER"
            >
              {TASK_NATURES.map((n) => (
                <option key={n} value={n}>
                  {TASK_NATURE_LABELS[n]}
                </option>
              ))}
            </select>
            <select
              name="verdict"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="HUMAN"
            >
              {TASK_VERDICTS.map((v) => (
                <option key={v} value={v}>
                  {TASK_VERDICT_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <Textarea
              name="justification"
              rows={2}
              placeholder="Pourquoi ce verdict ? (règles fixes → auto, compréhension texte → IA…)"
            />
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Complexité (1-5)
              </label>
              <Input type="number" name="complexity" min={1} max={5} defaultValue={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              Annuler
            </Button>
            <Button type="submit" size="sm">
              Ajouter la tâche
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Ajouter une tâche
        </Button>
      )}
    </div>
  );
}

function TaskRow({
  task,
  pending,
  onUpdate,
  onDelete,
}: {
  task: MatrixTask;
  pending: boolean;
  onUpdate: (patch: Partial<MatrixTask>) => void;
  onDelete: () => void;
}) {
  const [justif, setJustif] = useState(task.justification ?? "");

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-medium">{task.taskName}</div>
            <Badge variant="outline" className="text-[10px]">
              {TASK_NATURE_LABELS[task.nature as TaskNature] ?? task.nature}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TASK_VERDICTS.map((v) => {
              const active = task.verdict === v;
              return (
                <button
                  key={v}
                  type="button"
                  disabled={pending || active}
                  onClick={() => onUpdate({ verdict: v })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition",
                    active ? TASK_VERDICT_COLORS[v] : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {TASK_VERDICT_LABELS[v]}
                </button>
              );
            })}
          </div>
          <Textarea
            value={justif}
            onChange={(e) => setJustif(e.target.value)}
            onBlur={() => {
              if (justif !== (task.justification ?? "")) onUpdate({ justification: justif });
            }}
            rows={2}
            placeholder="Justifie le verdict (règles fixes ? compréhension texte ? interprétation humaine ?)"
            className="text-xs"
          />
        </div>
        <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Complexité
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = task.complexity === n;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={pending || active}
                    onClick={() => onUpdate({ complexity: n })}
                    className={cn(
                      "h-6 w-6 rounded border text-[11px] font-medium",
                      active ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted",
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="self-end rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Supprimer la tâche"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
