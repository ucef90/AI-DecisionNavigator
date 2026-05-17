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
// DSFR : pas de couleurs sémantiques par couche, on signale plutôt
// l'activité d'une brique IA par un fond navy plein vs un outline.

export function TechnologyLayer({ data }: { data: TechnologyInsights }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
      <div className="space-y-3">
        <LayerRow
          icon={Monitor}
          title="Interfaces utilisateurs"
          blocks={data.interfaces}
        />
        <Connector />
        <LayerRow
          icon={Cpu}
          title="Couche IA"
          blocks={data.aiBricks}
          highlight={data.recommendedApproach}
        />
        <Connector />
        <LayerRow icon={Boxes} title="Couche intégration" blocks={data.integration} />
        <Connector />
        <LayerRow icon={Server} title="Systèmes externes" blocks={data.external} />
      </div>

      <div className="border-2 border-primary bg-card p-4 sm:w-52">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Lock className="size-4" />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            Sécurité &amp; gouvernance
          </span>
        </div>
        <ul className="space-y-2 text-xs">
          {data.governance.map((g) => {
            const Icon = governanceIcon(g.id);
            return (
              <li key={g.id} className="flex items-center gap-2">
                <Icon className="size-3.5 shrink-0 text-primary" />
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
  blocks,
  highlight,
}: {
  icon: typeof Cpu;
  title: string;
  blocks: TechBlock[];
  highlight?: TechnologyInsights["recommendedApproach"];
}) {
  return (
    <div className="border border-border bg-secondary p-4">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon className="size-4" />
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {title}
        </span>
        {highlight ? (
          <Badge variant="default" className="ml-auto text-[10px]">
            {AI_APPROACH_LABELS[highlight]}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {blocks.map((b) => (
          <BlockChip key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}

function BlockChip({ block }: { block: TechBlock }) {
  const isActive = block.active === true;
  const isDimmed = block.active === false;
  return (
    <div
      className={cn(
        "flex items-center gap-2 border px-3 py-1.5 text-xs",
        isActive
          ? "border-primary bg-primary text-primary-foreground font-bold"
          : isDimmed
            ? "border-border bg-card text-muted-foreground opacity-60"
            : "border-border bg-card",
      )}
    >
      <span>{block.label}</span>
      {block.detail ? (
        <span
          className={cn(
            "text-[10px]",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {block.detail}
        </span>
      ) : null}
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-3 w-px bg-border" />;
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
