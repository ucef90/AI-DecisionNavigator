import Link from "next/link";
import { AlertTriangle, Info, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LiveSignal, GateCriterion } from "@/lib/engines/atelier1";

// Right rail. Shows two things:
//   1. Live signals the engine just detected (warnings about
//      methodology, missing evidence, solution bias, etc.)
//   2. The atelier-2 gate criteria — visible from every section
//      so the CDP always knows what's still missing to graduate.

type Props = {
  projectId: string;
  signals: LiveSignal[];
  gate: GateCriterion[];
  gateVerdict: "NOT_READY" | "READY" | "OVERRIDE" | null;
};

const LEVEL_ICON = {
  INFO: Info,
  WARNING: AlertTriangle,
  BLOCKER: ShieldAlert,
} as const;

const LEVEL_BG = {
  INFO: "border-sky-500/30 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  WARNING:
    "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  BLOCKER:
    "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
} as const;

export function AtelierLivePanel({ projectId, signals, gate, gateVerdict }: Props) {
  const metCount = gate.filter((c) => c.met).length;

  return (
    <aside className="space-y-5 text-sm">
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Signaux live
          </h3>
        </header>
        {signals.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Aucun signal détecté pour le moment. Continue à remplir l&apos;atelier.
          </p>
        ) : (
          <ul className="space-y-2">
            {signals.map((sig) => {
              const Icon = LEVEL_ICON[sig.level];
              return (
                <li
                  key={sig.id}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs leading-snug",
                    LEVEL_BG[sig.level],
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold">{sig.title}</div>
                      {sig.detail ? <p className="opacity-90">{sig.detail}</p> : null}
                      {sig.sectionHint ? (
                        <Link
                          href={`/projects/${projectId}/atelier/1/${sig.sectionHint}`}
                          className="inline-block text-[11px] font-medium underline underline-offset-2"
                        >
                          Aller à la section →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate atelier 2
          </h3>
          <Badge
            variant={
              gateVerdict === "READY" || gateVerdict === "OVERRIDE"
                ? "default"
                : metCount === gate.length
                  ? "default"
                  : "outline"
            }
          >
            {metCount}/{gate.length}
          </Badge>
        </header>
        <ul className="space-y-1">
          {gate.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  c.met ? "bg-emerald-500" : "bg-muted",
                )}
              />
              <div className="flex-1">
                <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>
                  {c.label}
                </div>
                {!c.met && c.why ? (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{c.why}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href={`/projects/${projectId}/atelier/1/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Évaluer le gate →
        </Link>
      </section>
    </aside>
  );
}
