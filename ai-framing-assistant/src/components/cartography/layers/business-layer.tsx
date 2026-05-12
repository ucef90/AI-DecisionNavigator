import {
  AlertCircle,
  Gauge,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BusinessInsights } from "@/lib/engines/cartography";

// 1. CARTOGRAPHIE MÉTIER — vision globale du besoin.
//
// Layout mirrors the reference visual:
//   ┌─────────────┐  ┌───────────────┐
//   │ Besoin      │  │ Valeur        │
//   │ métier      │  │ attendue      │
//   └────┬────────┘  └────────┬──────┘
//        │                    │
//        └─►   Impact métier  ◄┘   (central pill with Users icon)
//        ┌────────────────────┐
//        │ Objectifs          │
//        └────────────────────┘
//        ┌────────────────────┐
//        │ KPIs principaux    │
//        └────────────────────┘

export function BusinessLayer({ data }: { data: BusinessInsights }) {
  return (
    <div className="space-y-4">
      {data.solutionOriented ? (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <strong>Formulation orientée solution détectée</strong> dans la
            demande initiale. La cartographie présente la version reformulée.
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <BlockCard
          tone="emerald"
          icon={Target}
          title="Besoin métier"
          empty={!data.reformulatedNeed}
        >
          {data.reformulatedNeed ? (
            <p className="whitespace-pre-wrap leading-relaxed">
              {data.reformulatedNeed}
            </p>
          ) : (
            "À reformuler à l'étape Besoin métier."
          )}
        </BlockCard>

        <BlockCard
          tone="blue"
          icon={TrendingUp}
          title="Valeur attendue"
          empty={data.expectedValue.length === 0}
        >
          {data.expectedValue.length > 0 ? (
            <ul className="space-y-1">
              {data.expectedValue.map((v, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          ) : (
            "Valeur métier à expliciter."
          )}
        </BlockCard>
      </div>

      {/* Central pill: impact métier with impacted users */}
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-2 rounded-full border border-violet-300 bg-violet-50 px-4 py-2 text-center text-sm dark:border-violet-700 dark:bg-violet-950/40">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-violet-700 dark:text-violet-300" />
          <span className="font-medium">Impact métier</span>
        </div>
        {data.impactedUsers.length > 0 ? (
          <p className="text-xs text-violet-900/80 dark:text-violet-200/80">
            {data.impactedUsers.join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <BlockCard
          tone="emerald"
          icon={Target}
          title="Objectifs"
          empty={data.objectives.length === 0}
        >
          {data.objectives.length > 0 ? (
            <ul className="space-y-1">
              {data.objectives.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          ) : (
            "Préciser les objectifs (gain de temps, qualité, expérience…)."
          )}
        </BlockCard>

        <BlockCard
          tone="amber"
          icon={Gauge}
          title="KPI principaux"
          empty={data.kpis.length === 0}
        >
          {data.kpis.length > 0 ? (
            <ul className="space-y-1">
              {data.kpis.map((k, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          ) : (
            "Aucun KPI documenté — la valeur ne pourra pas être mesurée."
          )}
        </BlockCard>
      </div>

      {data.painPoints.length > 0 ? (
        <div className="rounded-md border border-dashed border-rose-300 bg-rose-50/50 p-3 text-xs dark:border-rose-800 dark:bg-rose-950/20">
          <div className="mb-1.5 flex items-center gap-1.5 text-rose-900 dark:text-rose-300">
            <AlertCircle className="size-3.5" />
            <span className="font-medium uppercase tracking-wide">
              Irritants identifiés
            </span>
            <Badge variant="outline" className="text-[10px]">
              {data.painPoints.length}
            </Badge>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {data.painPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-rose-900/80 dark:text-rose-200/80">
                <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-rose-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type Tone = "emerald" | "blue" | "amber" | "violet" | "rose" | "slate";

const TONE_BORDER: Record<Tone, string> = {
  emerald: "border-emerald-300 dark:border-emerald-800",
  blue: "border-blue-300 dark:border-blue-800",
  amber: "border-amber-300 dark:border-amber-800",
  violet: "border-violet-300 dark:border-violet-800",
  rose: "border-rose-300 dark:border-rose-800",
  slate: "border-slate-300 dark:border-slate-700",
};

const TONE_BG: Record<Tone, string> = {
  emerald: "bg-emerald-50/60 dark:bg-emerald-950/20",
  blue: "bg-blue-50/60 dark:bg-blue-950/20",
  amber: "bg-amber-50/60 dark:bg-amber-950/20",
  violet: "bg-violet-50/60 dark:bg-violet-950/20",
  rose: "bg-rose-50/60 dark:bg-rose-950/20",
  slate: "bg-slate-50/60 dark:bg-slate-900/20",
};

const TONE_HEAD: Record<Tone, string> = {
  emerald: "text-emerald-900 dark:text-emerald-200",
  blue: "text-blue-900 dark:text-blue-200",
  amber: "text-amber-900 dark:text-amber-200",
  violet: "text-violet-900 dark:text-violet-200",
  rose: "text-rose-900 dark:text-rose-200",
  slate: "text-slate-900 dark:text-slate-200",
};

function BlockCard({
  tone,
  icon: Icon,
  title,
  children,
  empty,
}: {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm",
        TONE_BORDER[tone],
        TONE_BG[tone],
      )}
    >
      <div className={cn("mb-2 flex items-center gap-1.5", TONE_HEAD[tone])}>
        <Icon className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className={empty ? "text-muted-foreground italic" : ""}>
        {children}
      </div>
    </div>
  );
}
