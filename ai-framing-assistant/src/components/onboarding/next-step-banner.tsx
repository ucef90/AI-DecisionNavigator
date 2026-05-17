import Link from "next/link";
import { ArrowRight, Compass, Trophy, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NextStep } from "@/lib/engines/next-step";

// Bannière "prochaine étape" — affichée en haut de la page projet.
// Lit le résultat de computeNextStep() et présente une CTA claire :
// titre, raison, bouton vers la bonne URL. Couleur selon le mode.

const MODE_COLORS = {
  DISCOVER: "border-sky-500/40 bg-gradient-to-br from-sky-50/60 to-background dark:from-sky-950/30",
  CONTINUE: "border-amber-500/40 bg-gradient-to-br from-amber-50/60 to-background dark:from-amber-950/30",
  GATE: "border-violet-500/40 bg-gradient-to-br from-violet-50/60 to-background dark:from-violet-950/30",
  DONE: "border-emerald-500/40 bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/30",
} as const;

const MODE_ICONS = {
  DISCOVER: Sparkles,
  CONTINUE: Compass,
  GATE: ShieldCheck,
  DONE: Trophy,
} as const;

const MODE_LABELS = {
  DISCOVER: "Démarrer ici",
  CONTINUE: "Continue ici",
  GATE: "Valider un gate",
  DONE: "Framework complet",
} as const;

export function NextStepBanner({ step }: { step: NextStep }) {
  const Icon = MODE_ICONS[step.mode];

  return (
    <div className={cn("rounded-xl border p-5 shadow-sm", MODE_COLORS[step.mode])}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-background/80 p-2 text-foreground/70">
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background/80 text-[10px] uppercase tracking-wider">
                {MODE_LABELS[step.mode]}
              </Badge>
              {step.atelier ? (
                <Badge variant="outline" className="bg-background/80 text-[10px]">
                  Atelier {step.atelier} / 7
                </Badge>
              ) : null}
              {step.overallProgress != null ? (
                <span className="text-[10px] text-muted-foreground">
                  {step.overallProgress}% du framework
                </span>
              ) : null}
            </div>
            <div className="text-base font-semibold">{step.title}</div>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <Link
          href={step.url}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
        >
          {step.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {step.overallProgress != null && step.overallProgress > 0 ? (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-background/40">
          <div
            className="h-full bg-foreground/70 transition-all"
            style={{ width: `${step.overallProgress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
