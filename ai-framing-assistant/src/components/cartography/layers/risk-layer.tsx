import {
  AlertTriangle,
  Brain,
  Briefcase,
  Database,
  Gavel,
  Lock,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DECISION_LABELS,
  OVERALL_RISK_LABELS,
  type Decision,
} from "@/types";
import type {
  RiskCategory,
  RiskCategoryId,
  RiskInsights,
  RiskItem,
} from "@/lib/engines/cartography";

// 6. CARTOGRAPHIE DES RISQUES — Grille de catégories + stratégies de maîtrise.

const CATEGORY_CONFIG: Record<
  RiskCategoryId,
  { icon: LucideIcon; tone: string; head: string }
> = {
  DATA: {
    icon: Database,
    tone: "border-violet-300 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/20",
    head: "text-violet-900 dark:text-violet-200",
  },
  AI: {
    icon: Brain,
    tone: "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20",
    head: "text-blue-900 dark:text-blue-200",
  },
  REGULATORY: {
    icon: Gavel,
    tone: "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20",
    head: "text-amber-900 dark:text-amber-200",
  },
  SECURITY: {
    icon: Lock,
    tone: "border-rose-300 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/20",
    head: "text-rose-900 dark:text-rose-200",
  },
  BUSINESS: {
    icon: Briefcase,
    tone: "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20",
    head: "text-emerald-900 dark:text-emerald-200",
  },
  OPERATIONAL: {
    icon: Settings2,
    tone: "border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/30",
    head: "text-slate-900 dark:text-slate-200",
  },
};

const DECISION_STYLES: Record<Decision, string> = {
  GO_IA: "bg-emerald-600 text-white",
  POC_IA: "bg-blue-600 text-white",
  AUTOMATION: "bg-amber-500 text-white",
  STUDY: "bg-zinc-500 text-white",
  NO_GO: "bg-destructive text-white",
};

export function RiskLayer({ data }: { data: RiskInsights }) {
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <CategoryGrid categories={data.categories.slice(0, 3)} />

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-destructive/60 bg-destructive/5 p-4 text-center">
          <div className="rounded-full bg-destructive/15 p-3">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <p className="text-sm font-semibold">Risques</p>
          {data.overall ? (
            <Badge variant="outline" className="border-destructive/40 text-xs">
              Niveau {OVERALL_RISK_LABELS[data.overall]}
            </Badge>
          ) : null}
          <Badge className={cn("border-0 text-[10px]", DECISION_STYLES[data.decision])}>
            {DECISION_LABELS[data.decision]}
          </Badge>
        </div>

        <CategoryGrid categories={data.categories.slice(3, 6)} />
      </div>

      <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
        <div className="mb-2 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Stratégies de maîtrise
          </span>
          {data.mitigations.length > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {data.mitigations.length}
            </Badge>
          ) : null}
        </div>
        {data.mitigations.length > 0 ? (
          <ul className="grid gap-1 text-xs sm:grid-cols-2">
            {data.mitigations.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            Documenter un plan de mitigation par risque ≥ 3.
          </p>
        )}
      </div>

      {data.signals.length > 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/20">
          <div className="mb-2 flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="size-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Signaux moteur ({data.signals.length})
            </span>
          </div>
          <ul className="space-y-1">
            {data.signals.slice(0, 4).map((s) => (
              <li key={s.id} className="flex gap-2">
                <span
                  className={cn(
                    "mt-1.5 inline-block size-1.5 shrink-0 rounded-full",
                    s.severity === "CRITICAL"
                      ? "bg-destructive"
                      : s.severity === "WARNING"
                        ? "bg-amber-500"
                        : "bg-zinc-400",
                  )}
                />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{s.title}.</strong> {s.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CategoryGrid({ categories }: { categories: RiskCategory[] }) {
  return (
    <div className="space-y-2">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: RiskCategory }) {
  const cfg = CATEGORY_CONFIG[category.id];
  const Icon = cfg.icon;
  return (
    <div className={cn("rounded-lg border p-2.5", cfg.tone)}>
      <div className={cn("mb-1.5 flex items-center gap-1.5", cfg.head)}>
        <Icon className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {category.title}
        </span>
      </div>
      <ul className="space-y-0.5 text-xs">
        {category.items.map((it, i) => (
          <RiskRow key={i} item={it} />
        ))}
      </ul>
    </div>
  );
}

function RiskRow({ item }: { item: RiskItem }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="line-clamp-1">{item.label}</span>
      <ScoreDots score={item.score} />
    </li>
  );
}

function ScoreDots({ score }: { score: number | null }) {
  if (score == null) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }
  const color =
    score >= 4 ? "bg-destructive" : score >= 3 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            "inline-block size-1.5 rounded-full",
            n <= score ? color : "bg-muted",
          )}
        />
      ))}
    </span>
  );
}
