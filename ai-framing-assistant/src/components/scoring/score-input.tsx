"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { HelpHint } from "@/components/ui/help-hint";
import { getHint } from "@/lib/field-hints";
import { SCORE_LEVELS, hintForAxis, type ScoreValue } from "@/types/score-levels";

// Composant universel de notation 1..5 avec :
//   - 5 boutons-pastilles cliquables (badge + label)
//   - libellé d'aide CONTEXTUEL au niveau survolé/sélectionné
//     (utilise SCORE_LEVEL_HINTS keyé par "axis")
//   - état "auto-calculé" stylé en pointillé pour signaler à
//     l'utilisateur qu'il regarde un score dérivé qu'il peut
//     surcharger.
//
// Utilisation typique :
//   <ScoreInput
//     axis="dataQuality"
//     label="Qualité données"
//     value={score?.dataQuality ?? null}
//     auto={score?.autoFlags?.dataQuality}
//     onChange={(v) => save({ dataQuality: v, autoFlags: { ...flags, dataQuality: false } })}
//   />

export type ScoreInputProps = {
  /** Identifiant de l'axe — utilisé pour récupérer les hints contextuels */
  axis: string;
  label: string;
  /** Optionnel : sur-titre court (ex. "Atelier 1") */
  caption?: string;
  /** Score actuel (null = non noté) */
  value: number | null;
  /** Le score a-t-il été calculé automatiquement ? */
  auto?: boolean;
  /** Callback de changement */
  onChange?: (value: ScoreValue) => void;
  /** Désactive l'édition (lecture seule) */
  readOnly?: boolean;
  /** Affichage compact (sur dashboards) */
  compact?: boolean;
  /** Le bouton "auto" qui recalcule depuis le snapshot */
  onResetToAuto?: () => void;
  /** Bulle d'aide affichée via "(i)" à côté du label (auto-lookup par nom de champ si omis) */
  hint?: string;
  /** Nom du champ pour l'auto-lookup dans FIELD_HINTS */
  name?: string;
};

export function ScoreInput({
  axis,
  label,
  caption,
  value,
  auto,
  onChange,
  readOnly,
  compact,
  onResetToAuto,
  hint,
  name,
}: ScoreInputProps) {
  const helpText = hint ?? (name ? getHint(name) : undefined) ?? getHint(axis);
  const [hovered, setHovered] = useState<ScoreValue | null>(null);
  const focusValue = hovered ?? ((value ?? null) as ScoreValue | null);
  const showHint = focusValue != null;
  const hintText = focusValue ? hintForAxis(axis, focusValue) : null;
  const focusMeta = focusValue ? SCORE_LEVELS[focusValue] : null;

  return (
    <div
      className={cn(
        "rounded-md border bg-background p-3",
        auto ? "border-dashed border-foreground/20" : "border-border",
        compact ? "" : "space-y-2",
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          {caption ? (
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {caption}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{label}</h4>
            {helpText ? <HelpHint hint={helpText} /> : null}
            {auto ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Auto
              </span>
            ) : null}
            {!auto && value != null ? (
              <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/70">
                Manuel
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {auto && onResetToAuto ? null : !auto && onResetToAuto ? (
            <button
              type="button"
              onClick={onResetToAuto}
              className="text-[10px] underline underline-offset-2 hover:text-foreground/80"
            >
              Revenir à l&apos;auto
            </button>
          ) : null}
          {focusMeta ? (
            <div
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                focusMeta.classes,
              )}
            >
              {focusMeta.value} · {focusMeta.label}
            </div>
          ) : (
            <div className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Non noté
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {([1, 2, 3, 4, 5] as ScoreValue[]).map((n) => {
          const meta = SCORE_LEVELS[n];
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={readOnly}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(n)}
              onBlur={() => setHovered(null)}
              onClick={() => !readOnly && onChange?.(n)}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-0 rounded-md border text-[10px] transition",
                selected
                  ? meta.classes
                  : "border-border text-muted-foreground hover:border-foreground/30",
                readOnly && "cursor-not-allowed opacity-70",
              )}
              aria-label={`${n} - ${meta.label}`}
            >
              <div className={cn("text-sm font-semibold tabular-nums", selected ? "" : "text-foreground/80")}>
                {n}
              </div>
              <div className="leading-tight">{meta.label}</div>
            </button>
          );
        })}
      </div>

      {showHint && hintText ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          <span className="font-semibold text-foreground/80">{focusMeta?.label}.</span>{" "}
          {hintText}
        </p>
      ) : (
        <p className="text-[11px] italic text-muted-foreground">
          Survole un niveau pour voir l&apos;indicateur correspondant.
        </p>
      )}
    </div>
  );
}
