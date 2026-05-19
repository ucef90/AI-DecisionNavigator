"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { SCORE_LEVELS, SCORE_LEVEL_HINTS, type ScoreValue } from "@/types/score-levels";

// Panneau d'aide rétractable expliquant l'échelle 1-5 utilisée par un
// formulaire de scoring. À placer en haut d'une section avec des champs
// 1-5 (impact, complexité, readiness…). Compact par défaut, déploie
// la grille complète au clic.

export function ScoreScaleInfo({
  axes,
  title = "Comment remplir les scores 1-5 ?",
  defaultOpen = false,
}: {
  axes: { axisKey: string; label: string }[];
  title?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-3 rounded-md border border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-sky-900 dark:text-sky-100"
      >
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          {title}
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-sky-500/30 px-3 py-3 text-xs">
          <p className="leading-snug text-sky-950 dark:text-sky-100">
            Chaque niveau correspond à un état <em>observable</em> du projet. Choisis le niveau
            qui décrit le mieux la situation actuelle — pas l'idéal visé.
          </p>

          {/* Grille générique 1-5 (label + sens court) */}
          <div className="grid gap-2 sm:grid-cols-5">
            {([1, 2, 3, 4, 5] as ScoreValue[]).map((n) => {
              const meta = SCORE_LEVELS[n];
              return (
                <div
                  key={n}
                  className={cn(
                    "rounded-md border p-2",
                    meta.classes,
                  )}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider">
                    {n} — {meta.label}
                  </div>
                  <p className="mt-1 text-[10px] leading-snug">{meta.generic}</p>
                </div>
              );
            })}
          </div>

          {/* Détail par axe : ce qu'on regarde pour cet axe spécifique */}
          {axes.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-900/80 dark:text-sky-100/80">
                Indicateurs par axe
              </div>
              {axes.map((axis) => {
                const hints = SCORE_LEVEL_HINTS[axis.axisKey];
                if (!hints) return null;
                return (
                  <div key={axis.axisKey} className="rounded-md border border-sky-500/20 bg-background/60 p-2">
                    <div className="mb-1 text-[11px] font-semibold">{axis.label}</div>
                    <div className="grid gap-1 sm:grid-cols-5">
                      {([1, 2, 3, 4, 5] as ScoreValue[]).map((n) => (
                        <div key={n} className="text-[10px] leading-snug">
                          <span className={cn("inline-block rounded-sm px-1 mr-1 font-bold", SCORE_LEVELS[n].classes)}>
                            {n}
                          </span>
                          {hints[n]}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
