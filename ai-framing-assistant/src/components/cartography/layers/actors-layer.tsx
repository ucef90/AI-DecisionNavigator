import {
  Briefcase,
  Cpu,
  Eye,
  Server,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Actor, ActorTone, ActorsInsights } from "@/lib/engines/cartography";

// 4. CARTOGRAPHIE DES ACTEURS — Hub IA central + rôles autour.
// DSFR palette : tous les rôles partagent un fond crème (secondary) et un
// liseré navy. Le hub central est en navy plein.

const TONE_ICON: Record<ActorTone, LucideIcon> = {
  USER: User,
  AGENT: Users,
  MANAGER: Briefcase,
  GOVERNANCE: ShieldCheck,
  IT: Server,
  SUPERVISOR: Eye,
};

export function ActorsLayer({ data }: { data: ActorsInsights }) {
  // Split actors into a left and right column to mirror the reference visual.
  const left = data.actors.filter((_, i) => i % 2 === 0);
  const right = data.actors.filter((_, i) => i % 2 === 1);

  return (
    <div className="space-y-4">
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-3">
          {left.map((a) => (
            <ActorCard key={a.id} actor={a} align="right" />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-2 border-2 border-primary bg-primary p-6 text-center text-primary-foreground">
          <div className="border border-primary-foreground/30 p-3">
            <Cpu className="size-6" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wide">
            {data.hubLabel}
          </p>
          <p className="text-[10px] opacity-80">Décide · exécute · trace</p>
        </div>

        <div className="space-y-3">
          {right.map((a) => (
            <ActorCard key={a.id} actor={a} align="left" />
          ))}
        </div>
      </div>

      <div className="border-l-[3px] border-primary bg-secondary p-3 text-center text-[10px] text-muted-foreground">
        Chaque acteur interagit avec la plateforme via une responsabilité claire — voir détail dans chaque carte.
      </div>
    </div>
  );
}

function ActorCard({
  actor,
  align,
}: {
  actor: Actor;
  align: "left" | "right";
}) {
  const Icon = TONE_ICON[actor.tone];
  return (
    <div
      className={`flex flex-col gap-1.5 border border-border bg-card p-4 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-primary ${
          align === "right" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Icon className="size-4" />
        <span className="text-xs font-bold uppercase tracking-wide">
          {actor.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{actor.description}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-foreground">
        {actor.responsibilities.map((r, i) => (
          <li key={i}>· {r}</li>
        ))}
      </ul>
    </div>
  );
}
