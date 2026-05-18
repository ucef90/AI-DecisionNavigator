"use client";

import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Petit "(i)" cliquable/au survol — affiche une bulle d'aide
// concise (1-2 phrases) à côté d'un label de champ.
//
// Utilise le TooltipProvider monté au niveau du (app) layout.

export function HelpHint({
  hint,
  side = "top",
  className,
}: {
  hint: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  if (!hint) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            tabIndex={-1}
            aria-label={hint}
            className={cn(
              "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
              className,
            )}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        }
      />
      <TooltipContent side={side} className="max-w-xs whitespace-normal text-left leading-snug">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

// Helper combiné — label + (i) — pour les cas où le composant ne
// passe pas par Field/SelectField/TextareaField (ScoreInput, etc.)
export function HintedLabel({
  label,
  hint,
  className,
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{label}</span>
      {hint ? <HelpHint hint={hint} /> : null}
    </span>
  );
}
