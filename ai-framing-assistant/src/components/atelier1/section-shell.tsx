import { Lightbulb, AlertTriangle, Compass, BookOpen } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

// Patron réutilisé par les 19 sections atelier 1.
//
// Chaque section a la même structure :
//   - badge "Phase X" + titre + intent
//   - "Pourquoi cette section ?" (pédagogie)
//   - "Ce qu'on cherche" (méthodologie)
//   - "Pièges fréquents" (warnings)
//   - workspace (formulaire / liste / éditeur)
//   - aiCoach (slot optionnel pour bouton LLM)
//   - footer (action save + navigation)

export type SectionShellProps = {
  phaseLabel: string;        // "Phase A — Contexte"
  title: string;             // "Fiche de qualification"
  livrableRef: string;       // "§1 du livrable"
  intent: string;            // one-liner d'objectif
  pourquoi: string[];        // raisons (pédagogie)
  cherche: string[];         // ce que l'on cherche (méthodologie)
  pieges?: string[];         // anti-patterns à éviter
  exemples?: { bon?: string; mauvais?: string }; // exemples optionnels
  children: ReactNode;       // workspace
  aside?: ReactNode;         // optional secondary block (preview, mini-carte…)
};

export function SectionShell({
  phaseLabel,
  title,
  livrableRef,
  intent,
  pourquoi,
  cherche,
  pieges,
  exemples,
  children,
  aside,
}: SectionShellProps) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {phaseLabel}
          </Badge>
          <span>·</span>
          <span>{livrableRef}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{intent}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <PedagoCard
          icon={<Lightbulb className="h-4 w-4" />}
          title="Pourquoi cette section ?"
          tone="amber"
          items={pourquoi}
        />
        <PedagoCard
          icon={<Compass className="h-4 w-4" />}
          title="Ce qu'on cherche"
          tone="sky"
          items={cherche}
        />
      </div>

      {pieges && pieges.length > 0 ? (
        <PedagoCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Pièges fréquents à éviter"
          tone="rose"
          items={pieges}
        />
      ) : null}

      {exemples && (exemples.bon || exemples.mauvais) ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {exemples.mauvais ? (
            <ExampleCard tone="rose" label="Mauvais" body={exemples.mauvais} />
          ) : null}
          {exemples.bon ? (
            <ExampleCard tone="emerald" label="Bon" body={exemples.bon} />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,18rem)]">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          {children}
        </div>
        {aside ? <div className="space-y-3">{aside}</div> : null}
      </div>
    </article>
  );
}

const TONE_BG = {
  amber: "border-amber-500/30 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
  sky: "border-sky-500/30 bg-sky-50/70 text-sky-950 dark:bg-sky-950/30 dark:text-sky-100",
  rose: "border-rose-500/30 bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:text-rose-100",
  emerald: "border-emerald-500/30 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100",
} as const;

type Tone = keyof typeof TONE_BG;

function PedagoCard({
  icon,
  title,
  tone,
  items,
}: {
  icon: ReactNode;
  title: string;
  tone: Tone;
  items: string[];
}) {
  return (
    <section className={`rounded-lg border px-4 py-3 ${TONE_BG[tone]}`}>
      <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {icon}
        {title}
      </header>
      <ul className="mt-2 space-y-1 text-sm leading-snug">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExampleCard({ tone, label, body }: { tone: Tone; label: string; body: string }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${TONE_BG[tone]}`}>
      <header className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
        <BookOpen className="h-3 w-3" />
        Exemple — {label}
      </header>
      <p className="mt-1.5 text-sm italic">{body}</p>
    </div>
  );
}
