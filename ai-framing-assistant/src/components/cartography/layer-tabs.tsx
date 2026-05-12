"use client";

import { useState } from "react";
import {
  Brain,
  Database,
  Map,
  Network,
  ShieldAlert,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ActorsLayer } from "./layers/actors-layer";
import { BusinessLayer } from "./layers/business-layer";
import { DataLayer } from "./layers/data-layer";
import { RiskLayer } from "./layers/risk-layer";
import { TechnologyLayer } from "./layers/technology-layer";
import { WorkflowLayer } from "./layers/workflow-layer";
import type { CartographyInsights } from "@/lib/engines/cartography";

// Six tabs, one per cartography. The "ACTORS" tab replaces the generic
// graph-driven governance view — the layer model still produces nodes for
// the governance graph (used elsewhere), but the user-facing cartography
// is the role hub-and-spoke.

type LayerId =
  | "BUSINESS"
  | "WORKFLOW"
  | "DATA"
  | "ACTORS"
  | "TECHNOLOGY"
  | "RISK";

const LAYERS: {
  id: LayerId;
  label: string;
  short: string;
  icon: LucideIcon;
  subtitle: string;
}[] = [
  {
    id: "BUSINESS",
    label: "Cartographie métier",
    short: "Métier",
    icon: Map,
    subtitle: "Vision globale du besoin",
  },
  {
    id: "WORKFLOW",
    label: "Cartographie workflow (processus)",
    short: "Workflow",
    icon: Workflow,
    subtitle: "Workflow actuel vs workflow cible",
  },
  {
    id: "DATA",
    label: "Cartographie des données",
    short: "Données",
    icon: Database,
    subtitle: "Sources, flux et usages",
  },
  {
    id: "ACTORS",
    label: "Cartographie des acteurs",
    short: "Acteurs",
    icon: Users,
    subtitle: "Qui fait quoi",
  },
  {
    id: "TECHNOLOGY",
    label: "Cartographie technologique",
    short: "Tech",
    icon: Brain,
    subtitle: "Architecture applicative cible",
  },
  {
    id: "RISK",
    label: "Cartographie des risques",
    short: "Risques",
    icon: ShieldAlert,
    subtitle: "Identification et gestion",
  },
];

export function LayerTabs({ insights }: { insights: CartographyInsights }) {
  const [active, setActive] = useState<LayerId>("BUSINESS");
  const layer = LAYERS.find((l) => l.id === active)!;

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-1.5">
        {LAYERS.map((l) => {
          const Icon = l.icon;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(l.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                active === l.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              <span>{l.short}</span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-lg border border-border bg-background p-4">
        <header className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold">{layer.label}</h3>
            <p className="text-xs text-muted-foreground">{layer.subtitle}</p>
          </div>
          <Legend />
        </header>

        {active === "BUSINESS" ? <BusinessLayer data={insights.business} /> : null}
        {active === "WORKFLOW" ? <WorkflowLayer data={insights.workflow} /> : null}
        {active === "DATA" ? <DataLayer data={insights.data} /> : null}
        {active === "ACTORS" ? <ActorsLayer data={insights.actors} /> : null}
        {active === "TECHNOLOGY" ? (
          <TechnologyLayer data={insights.technology} />
        ) : null}
        {active === "RISK" ? <RiskLayer data={insights.risk} /> : null}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden flex-wrap items-center gap-3 text-[10px] text-muted-foreground sm:flex">
      <LegendItem icon={Network} label="Flux" />
      <LegendItem icon={Users} label="Humain" />
      <LegendItem icon={Brain} label="IA / Modèle" />
      <LegendItem icon={Database} label="Donnée" />
      <LegendItem icon={ShieldAlert} label="Risque" />
    </div>
  );
}

function LegendItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3" />
      <span>{label}</span>
    </span>
  );
}
