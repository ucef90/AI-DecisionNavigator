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
// DSFR : navy outline pour catégories, destructive pour scores élevés.

const CATEGORY_ICONS: Record<RiskCategoryId, LucideIcon> = {
  DATA: Database,
  AI: Brain,
  REGULATORY: Gavel,
  SECURITY: Lock,
  BUSINESS: Briefcase,
  OPERATIONAL: Settings2,
};

const DECISION_STYLES: Record<Decision, string> = {
  GO_IA: "bg-primary text-primary-foreground",
  POC_IA: "bg-transparent text-primary border border-primary",
  AUTOMATION: "bg-secondary text-foreground border border-border",
  STUDY: "bg-secondary text-muted-foreground border border-border",
  NO_GO: "bg-destructive text-white",
};

export function RiskLayer({ data }: { data: RiskInsights }) {
  return (
    <div className="space-y-5">
      <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <CategoryGrid categories={data.categories.slice(0, 3)} />

        <div className="flex flex-col items-center justify-center gap-2 border-2 border-destructive bg-destructive p-5 text-center text-white">
          <div className="border border-white/30 p-2">
            <AlertTriangle className="size-6" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wide">Risques</p>
          {data.overall ? (
            <Badge className="border border-white/40 bg-transparent text-white text-[10px]">
              Niveau {OVERALL_RISK_LABELS[data.overall]}
            </Badge>
          ) : null}
          <Badge className={cn("text-[10px]", DECISION_STYLES[data.decision])}>
            {DECISION_LABELS[data.decision]}
          </Badge>
        </div>

        <CategoryGrid categories={data.categories.slice(3, 6)} />
      </div>

      <div className="border-l-[3px] border-primary bg-secondary p-4">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            Stratégies de maîtrise
          </span>
          {data.mitigations.length > 0 ? (
            <Badge variant="default" className="text-[10px]">
              {data.mitigations.length}
            </Badge>
          ) : null}
        </div>
        {data.mitigations.length > 0 ? (
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {data.mitigations.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 inline-block size-1.5 shrink-0 bg-primary" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Documenter un plan de mitigation par risque ≥ 3.
          </p>
        )}
      </div>

      {data.signals.length > 0 ? (
        <div className="border border-dashed border-destructive bg-card p-4 text-sm">
          <div className="mb-3 flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Signaux moteur ({data.signals.length})
            </span>
          </div>
          <ul className="space-y-1.5">
            {data.signals.slice(0, 4).map((s) => (
              <li key={s.id} className="flex gap-2">
                <span
                  className={cn(
                    "mt-2 inline-block size-1.5 shrink-0",
                    s.severity === "CRITICAL"
                      ? "bg-destructive"
                      : s.severity === "WARNING"
                        ? "bg-primary"
                        : "bg-border",
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
    <div className="space-y-3">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: RiskCategory }) {
  const Icon = CATEGORY_ICONS[category.id];
  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Icon className="size-4" />
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {category.title}
        </span>
      </div>
      <ul className="space-y-1 text-sm">
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
  // DSFR: navy intensities + destructive for criticals.
  const color =
    score >= 4 ? "bg-destructive" : score >= 3 ? "bg-primary" : "bg-primary/40";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn("inline-block size-1.5", n <= score ? color : "bg-border")}
        />
      ))}
    </span>
  );
}
