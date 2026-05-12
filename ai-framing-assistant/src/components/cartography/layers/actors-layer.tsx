import {
  BadgeCheck,
  Briefcase,
  Cpu,
  Eye,
  Server,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Actor, ActorTone, ActorsInsights } from "@/lib/engines/cartography";

// 4. CARTOGRAPHIE DES ACTEURS — Hub IA central + rôles autour.

const TONE_CONFIG: Record<
  ActorTone,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  USER: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-300 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-200",
    icon: User,
  },
  AGENT: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-200",
    icon: Users,
  },
  MANAGER: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-200",
    icon: Briefcase,
  },
  GOVERNANCE: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-300 dark:border-rose-800",
    text: "text-rose-900 dark:text-rose-200",
    icon: ShieldCheck,
  },
  IT: {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-slate-300 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-200",
    icon: Server,
  },
  SUPERVISOR: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-300 dark:border-violet-800",
    text: "text-violet-900 dark:text-violet-200",
    icon: Eye,
  },
};

export function ActorsLayer({ data }: { data: ActorsInsights }) {
  // Split actors into a left and right column to mirror the reference visual
  // (hub-and-spoke with the platform in the centre).
  const left = data.actors.filter((_, i) => i % 2 === 0);
  const right = data.actors.filter((_, i) => i % 2 === 1);

  return (
    <div className="space-y-3">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          {left.map((a) => (
            <ActorCard key={a.id} actor={a} align="right" />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-violet-400 bg-violet-50 p-4 text-center dark:border-violet-700 dark:bg-violet-950/30">
          <div className="rounded-full bg-violet-200 p-3 dark:bg-violet-900">
            <Cpu className="size-6 text-violet-800 dark:text-violet-200" />
          </div>
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
            {data.hubLabel}
          </p>
          <p className="text-[10px] text-violet-900/70 dark:text-violet-200/70">
            Décide · Exécute · Trace
          </p>
        </div>

        <div className="space-y-2">
          {right.map((a) => (
            <ActorCard key={a.id} actor={a} align="left" />
          ))}
        </div>
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted/30 p-2 text-center text-[10px] text-muted-foreground">
        Chaque acteur interagit avec la plateforme via une responsabilité claire — voir détail dans chaque carte.
      </div>
    </div>
  );
}

function ActorCard({ actor, align }: { actor: Actor; align: "left" | "right" }) {
  const cfg = TONE_CONFIG[actor.tone];
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-3",
        cfg.bg,
        cfg.border,
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          cfg.text,
          align === "right" ? "flex-row-reverse" : "flex-row",
        )}
      >
        <Icon className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {actor.label}
        </span>
        <BadgeCheck className="size-3 opacity-60" />
      </div>
      <p className="text-[11px] text-muted-foreground">{actor.description}</p>
      <ul
        className={cn(
          "mt-1 space-y-0.5 text-[11px]",
          align === "right" ? "text-right" : "text-left",
        )}
      >
        {actor.responsibilities.map((r, i) => (
          <li key={i} className="text-foreground/80">
            · {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
