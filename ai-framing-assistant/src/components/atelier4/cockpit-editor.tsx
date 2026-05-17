"use client";

import { useState, useTransition } from "react";
import { Sparkles, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreInput } from "@/components/scoring/score-input";
import { cn } from "@/lib/utils";
import { SCORECARD_AXIS_LABELS, type ScorecardAxis } from "@/types/atelier4";
import type { ScoreValue } from "@/types/score-levels";

export type CockpitAxisRow = {
  axis: ScorecardAxis;
  auto: ScoreValue;
  autoRationale: string;
  effective: ScoreValue;
  isOverride: boolean;
  manualJustification?: string;
};

type Props = {
  projectId: string;
  rows: CockpitAxisRow[];
  // Server actions
  patch: (
    axis: ScorecardAxis,
    payload: { value: ScoreValue | null; isAuto?: boolean; justification?: string | null },
  ) => Promise<void>;
  acceptAllAuto: () => Promise<void>;
};

export function CockpitEditor({ projectId, rows, patch, acceptAllAuto }: Props) {
  const [pending, startTransition] = useTransition();
  const [expandedAxis, setExpandedAxis] = useState<ScorecardAxis | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.axis, r.manualJustification ?? ""])),
  );

  // L'auto-accept est utile en première visite : un clic et tous les
  // scores auto-calculés sont matérialisés en base.
  const hasAnyOverride = rows.some((r) => r.isOverride);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-foreground/20 bg-muted/30 p-3 text-sm">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground/60" />
          <div>
            <div className="font-semibold">11 axes auto-calculés depuis ateliers 1 à 3</div>
            <p className="text-xs text-muted-foreground">
              Chaque score est calculé par le moteur à partir de la donnée disponible.
              Tu peux <strong>surcharger</strong> un axe en cliquant sur un niveau différent —
              une note manuelle apparaît. La justification est <strong>fortement recommandée</strong>
              pour les overrides.
            </p>
          </div>
        </div>
        {!hasAnyOverride ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(acceptAllAuto)}
          >
            Sauvegarder les scores auto
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const expanded = expandedAxis === row.axis;
          const draft = drafts[row.axis] ?? "";
          return (
            <div key={row.axis} className="space-y-2">
              <ScoreInput
                axis={row.axis}
                label={SCORECARD_AXIS_LABELS[row.axis]}
                value={row.effective}
                auto={!row.isOverride}
                onChange={(v) =>
                  startTransition(() =>
                    patch(row.axis, {
                      value: v,
                      isAuto: false,
                    }),
                  )
                }
                onResetToAuto={
                  row.isOverride
                    ? () =>
                        startTransition(() =>
                          patch(row.axis, { value: row.auto, isAuto: true, justification: null }),
                        )
                    : undefined
                }
              />
              <div className="rounded-md border border-dashed border-border bg-background/60 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Auto :</span>{" "}
                    {row.auto}/5 — {row.autoRationale}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedAxis(expanded ? null : row.axis)}
                    className="flex shrink-0 items-center gap-1 text-[10px] underline underline-offset-2"
                  >
                    <Pencil className="h-3 w-3" />
                    {row.manualJustification ? "Modifier" : "Justifier"}
                  </button>
                </div>
                {row.manualJustification && !expanded ? (
                  <div className="mt-1 rounded bg-muted px-2 py-1 text-foreground/80">
                    « {row.manualJustification} »
                  </div>
                ) : null}
                {expanded ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={draft}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [row.axis]: e.target.value }))
                      }
                      rows={2}
                      placeholder={`Pourquoi ${row.effective}/5 pour ${SCORECARD_AXIS_LABELS[row.axis].toLowerCase()} ?`}
                      className="text-xs"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setExpandedAxis(null);
                          setDrafts((d) => ({ ...d, [row.axis]: row.manualJustification ?? "" }));
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          startTransition(() =>
                            patch(row.axis, {
                              value: row.effective,
                              isAuto: row.isOverride ? false : true,
                              justification: draft,
                            }),
                          );
                          setExpandedAxis(null);
                        }}
                      >
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* placeholder pour usage projectId si jamais on rajoute un lien — évite warning unused */}
      <div className={cn("hidden", projectId && "")} />
    </div>
  );
}
