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
// DSFR palette: navy + accent pale + destructive only.

export function BusinessLayer({ data }: { data: BusinessInsights }) {
  return (
    <div className="space-y-5">
      {data.solutionOriented ? (
        <div className="flex items-start gap-2 border-l-[3px] border-destructive bg-secondary p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <strong className="text-foreground">
              Formulation orientée solution détectée
            </strong>{" "}
            dans la demande initiale. La cartographie présente la version reformulée.
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <BlockCard icon={Target} title="Besoin métier" empty={!data.reformulatedNeed}>
          {data.reformulatedNeed ? (
            <p className="whitespace-pre-wrap leading-relaxed">
              {data.reformulatedNeed}
            </p>
          ) : (
            "À reformuler à l'étape Besoin métier."
          )}
        </BlockCard>

        <BlockCard
          icon={TrendingUp}
          title="Valeur attendue"
          empty={data.expectedValue.length === 0}
        >
          {data.expectedValue.length > 0 ? (
            <ul className="space-y-1.5">
              {data.expectedValue.map((v, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 inline-block size-1.5 shrink-0 bg-primary" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          ) : (
            "Valeur métier à expliciter."
          )}
        </BlockCard>
      </div>

      {/* Central pill : impact métier with impacted users */}
      <div className="mx-auto flex max-w-md flex-col items-center gap-1 bg-primary px-6 py-3 text-center text-primary-foreground">
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          <span className="text-sm font-bold uppercase tracking-wide">
            Impact métier
          </span>
        </div>
        {data.impactedUsers.length > 0 ? (
          <p className="text-xs opacity-90">
            {data.impactedUsers.join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BlockCard
          icon={Target}
          title="Objectifs"
          empty={data.objectives.length === 0}
        >
          {data.objectives.length > 0 ? (
            <ul className="space-y-1.5">
              {data.objectives.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 inline-block size-1.5 shrink-0 bg-primary" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          ) : (
            "Préciser les objectifs (gain de temps, qualité, expérience…)."
          )}
        </BlockCard>

        <BlockCard
          icon={Gauge}
          title="KPI principaux"
          empty={data.kpis.length === 0}
        >
          {data.kpis.length > 0 ? (
            <ul className="space-y-1.5">
              {data.kpis.map((k, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 inline-block size-1.5 shrink-0 bg-primary" />
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
        <div className="border-l-[3px] border-destructive bg-secondary p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Irritants identifiés
            </span>
            <Badge variant="destructive" className="text-[10px]">
              {data.painPoints.length}
            </Badge>
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {data.painPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-foreground">
                <span className="mt-2 inline-block size-1 shrink-0 bg-destructive" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function BlockCard({
  icon: Icon,
  title,
  children,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon className="size-4" />
        <span className="text-xs font-bold uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div
        className={cn(
          "text-sm leading-6",
          empty ? "text-muted-foreground italic" : "text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}
