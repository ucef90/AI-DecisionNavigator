import {
  Activity,
  Boxes,
  Cpu,
  FileLock,
  KeyRound,
  Layers,
  Lock,
  Monitor,
  Network,
  ScrollText,
  Server,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AI_APPROACH_LABELS } from "@/types";
import type { TechBlock, TechnologyInsights } from "@/lib/engines/cartography";

// 5. CARTOGRAPHIE TECHNOLOGIQUE — Architecture applicative cible.
//
// Layered: interfaces (top), AI layer, integration, external systems
// (bottom). Right-hand column lists transverse security / governance bricks.

export function TechnologyLayer({ data }: { data: TechnologyInsights }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
      <div className="space-y-2.5">
        <LayerRow
          icon={Monitor}
          title="Interfaces utilisateurs"
          tone="slate"
          blocks={data.interfaces}
        />
        <Connector />
        <LayerRow
          icon={Cpu}
          title="Couche IA"
          tone="violet"
          blocks={data.aiBricks}
          highlight={data.recommendedApproach}
        />
        <Connector />
        <LayerRow
          icon={Boxes}
          title="Couche intégration"
          tone="blue"
          blocks={data.integration}
        />
        <Connector />
        <LayerRow
          icon={Server}
          title="Systèmes externes"
          tone="emerald"
          blocks={data.external}
        />
      </div>

      <div className="rounded-lg border border-rose-300 bg-rose-50/60 p-3 dark:border-rose-800 dark:bg-rose-950/20 sm:w-44">
        <div className="mb-2 flex items-center gap-1.5 text-rose-900 dark:text-rose-200">
          <Lock className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Sécurité &amp; gouvernance
          </span>
        </div>
        <ul className="space-y-1.5 text-xs">
          {data.governance.map((g) => {
            const Icon = governanceIcon(g.id);
            return (
              <li key={g.id} className="flex items-center gap-1.5">
                <Icon className="size-3.5 shrink-0 text-rose-700 dark:text-rose-300" />
                <span>{g.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function LayerRow({
  icon: Icon,
  title,
  tone,
  blocks,
  highlight,
}: {
  icon: typeof Cpu;
  title: string;
  tone: "slate" | "violet" | "blue" | "emerald";
  blocks: TechBlock[];
  highlight?: TechnologyInsights["recommendedApproach"];
}) {
  const TONE_BG: Record<typeof tone, string> = {
    slate: "bg-slate-50 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700",
    violet: "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-800",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800",
  };
  const TONE_HEAD: Record<typeof tone, string> = {
    slate: "text-slate-900 dark:text-slate-200",
    violet: "text-violet-900 dark:text-violet-200",
    blue: "text-blue-900 dark:text-blue-200",
    emerald: "text-emerald-900 dark:text-emerald-200",
  };
  return (
    <div className={cn("rounded-lg border p-2.5", TONE_BG[tone])}>
      <div className={cn("mb-2 flex items-center gap-1.5", TONE_HEAD[tone])}>
        <Icon className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {title}
        </span>
        {highlight ? (
          <Badge variant="outline" className="ml-auto border-violet-400 bg-violet-100 text-[10px] text-violet-900 dark:bg-violet-900/60 dark:text-violet-200">
            {AI_APPROACH_LABELS[highlight]}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {blocks.map((b) => (
          <BlockChip key={b.id} block={b} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function BlockChip({
  block,
  tone,
}: {
  block: TechBlock;
  tone: "slate" | "violet" | "blue" | "emerald";
}) {
  const baseRing =
    tone === "violet"
      ? "border-violet-400"
      : tone === "slate"
        ? "border-slate-400"
        : tone === "blue"
          ? "border-blue-400"
          : "border-emerald-400";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs",
        block.active === false ? "opacity-50" : "",
        block.active === true ? `${baseRing} ring-1 ring-violet-300 dark:ring-violet-700` : "border-border",
      )}
    >
      <span className="font-medium">{block.label}</span>
      {block.detail ? (
        <span className="text-[10px] text-muted-foreground">{block.detail}</span>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <div className="mx-auto h-2 w-px bg-border" />
  );
}

function governanceIcon(id: string) {
  switch (id) {
    case "iam":
      return KeyRound;
    case "crypto":
      return FileLock;
    case "logs":
      return ScrollText;
    case "audit":
      return Layers;
    case "monitoring":
      return Activity;
    default:
      return Network;
  }
}
