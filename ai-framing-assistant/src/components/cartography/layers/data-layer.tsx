import {
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  Database,
  FileText,
  Mail,
  Server,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DataInsights, DataSourceKind } from "@/lib/engines/cartography";

// 3. CARTOGRAPHIE DES DONNÉES — Sources → plateforme IA → usages.
//
// Layout: 3 columns (sources / hub / usages) joined by arrows. Two
// secondary cards below (types de données + sensibilité).

const SOURCE_ICON: Record<DataSourceKind, LucideIcon> = {
  EMAIL: Mail,
  DOC: FileText,
  CRM: Server,
  DB: Database,
  FILE: FileText,
  OTHER: Database,
};

export function DataLayer({ data }: { data: DataInsights }) {
  if (data.sources.length === 0 && data.usages.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Compléter l&apos;analyse data pour générer cette cartographie.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* SOURCES */}
        <ColumnCard
          title="Sources de données"
          tone="blue"
        >
          {data.sources.length > 0 ? (
            <ul className="space-y-1.5">
              {data.sources.slice(0, 6).map((s, i) => {
                const Icon = SOURCE_ICON[s.kind];
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-md bg-background/60 px-2 py-1.5 text-xs"
                  >
                    <Icon className="size-3.5 shrink-0 text-blue-700 dark:text-blue-300" />
                    <span className="line-clamp-2">{s.label}</span>
                  </li>
                );
              })}
              {data.sources.length > 6 ? (
                <li className="text-[10px] text-muted-foreground">
                  +{data.sources.length - 6} sources additionnelles
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-xs italic text-muted-foreground">Aucune source listée.</p>
          )}
        </ColumnCard>

        <ArrowCol />

        {/* HUB */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-violet-400 bg-violet-50 p-3 text-center dark:border-violet-700 dark:bg-violet-950/30">
          <div className="rounded-full bg-violet-200 p-2 dark:bg-violet-900">
            <Sparkles className="size-5 text-violet-800 dark:text-violet-200" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-violet-900 dark:text-violet-100">
              Plateforme de traitement IA
            </p>
            <p className="text-[10px] text-violet-800/70 dark:text-violet-200/70">
              Stockage &amp; historisation
            </p>
          </div>
          {data.personalData ? (
            <Badge
              variant="outline"
              className="border-rose-400 bg-rose-50 text-[10px] text-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <ShieldAlert className="mr-1 size-3" />
              Données personnelles
            </Badge>
          ) : null}
        </div>

        <ArrowCol />

        {/* USAGES */}
        <ColumnCard title="Usages" tone="emerald">
          {data.usages.length > 0 ? (
            <ul className="space-y-1.5">
              {data.usages.map((u, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-background/60 px-2 py-1.5 text-xs"
                >
                  <BarChart3 className="size-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  <span className="line-clamp-2">{u}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-muted-foreground">Aucun usage qualifié.</p>
          )}
        </ColumnCard>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-3 text-xs">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Types de données
          </p>
          <div className="flex flex-wrap gap-2">
            <DataTypeBadge active={data.types.structured} label="Structurées" />
            <DataTypeBadge active={data.types.semiStructured} label="Semi-structurées" />
            <DataTypeBadge active={data.types.unstructured} label="Non structurées" />
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-xs">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sensibilité
          </p>
          <div className="flex items-center gap-2 text-xs">
            <SensitivityDot value={data.sensitivity} />
            <span className="font-medium">{labelSensitivity(data.sensitivity)}</span>
            {data.personalData ? (
              <span className="text-rose-700 dark:text-rose-300">· données personnelles</span>
            ) : null}
          </div>
        </div>
      </div>

      {(data.quality || data.availability || data.history) ? (
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <Metric label="Qualité" value={data.quality} />
          <Metric label="Disponibilité" value={data.availability} />
          <Metric label="Historique" value={data.history} />
        </div>
      ) : null}
    </div>
  );
}

function ColumnCard({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "blue" | "emerald";
  children: React.ReactNode;
}) {
  const border = tone === "blue" ? "border-blue-300 dark:border-blue-800" : "border-emerald-300 dark:border-emerald-800";
  const bg = tone === "blue" ? "bg-blue-50/60 dark:bg-blue-950/20" : "bg-emerald-50/60 dark:bg-emerald-950/20";
  const head = tone === "blue" ? "text-blue-900 dark:text-blue-200" : "text-emerald-900 dark:text-emerald-200";
  return (
    <div className={cn("rounded-lg border p-3", border, bg)}>
      <p className={cn("mb-2 text-[10px] font-semibold uppercase tracking-wide", head)}>
        {title}
      </p>
      {children}
    </div>
  );
}

function ArrowCol() {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight className="hidden size-5 text-muted-foreground sm:block" />
      <ArrowLeftRight className="size-5 text-muted-foreground sm:hidden" />
    </div>
  );
}

function DataTypeBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px]",
        active
          ? "border-foreground bg-foreground/10 text-foreground"
          : "border-border text-muted-foreground line-through opacity-60",
      )}
    >
      {label}
    </span>
  );
}

function SensitivityDot({ value }: { value: DataInsights["sensitivity"] }) {
  const color =
    value === "SENSITIVE"
      ? "bg-rose-600"
      : value === "CONFIDENTIAL"
        ? "bg-amber-500"
        : value === "INTERNAL"
          ? "bg-blue-500"
          : "bg-emerald-500";
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}

function labelSensitivity(v: DataInsights["sensitivity"]): string {
  switch (v) {
    case "SENSITIVE":
      return "Élevée (sensible)";
    case "CONFIDENTIAL":
      return "Confidentielle";
    case "INTERNAL":
      return "Interne";
    case "NONE":
      return "Faible";
    default:
      return "Non qualifiée";
  }
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 line-clamp-2">{value ?? "—"}</p>
    </div>
  );
}
