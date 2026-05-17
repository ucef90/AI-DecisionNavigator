import {
  ArrowRight,
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
      <div className="flex h-48 items-center justify-center border border-dashed border-border bg-secondary p-6 text-center text-sm text-muted-foreground">
        Compléter l&apos;analyse data pour générer cette cartographie.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* SOURCES */}
        <ColumnCard title="Sources de données">
          {data.sources.length > 0 ? (
            <ul className="space-y-1.5">
              {data.sources.slice(0, 6).map((s, i) => {
                const Icon = SOURCE_ICON[s.kind];
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 border border-border bg-card px-2.5 py-2 text-xs"
                  >
                    <Icon className="size-3.5 shrink-0 text-primary" />
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
            <p className="text-xs italic text-muted-foreground">
              Aucune source listée.
            </p>
          )}
        </ColumnCard>

        <ArrowCol />

        {/* HUB */}
        <div className="flex flex-col items-center justify-center gap-2 border border-primary bg-primary p-4 text-center text-primary-foreground">
          <div className="border border-primary-foreground/30 p-2">
            <Sparkles className="size-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wide">
              Plateforme de traitement IA
            </p>
            <p className="text-[10px] opacity-80">Stockage &amp; historisation</p>
          </div>
          {data.personalData ? (
            <Badge variant="destructive" className="text-[10px]">
              <ShieldAlert className="mr-1 size-3" />
              Données personnelles
            </Badge>
          ) : null}
        </div>

        <ArrowCol />

        {/* USAGES */}
        <ColumnCard title="Usages">
          {data.usages.length > 0 ? (
            <ul className="space-y-1.5">
              {data.usages.map((u, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 border border-border bg-card px-2.5 py-2 text-xs"
                >
                  <BarChart3 className="size-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-2">{u}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              Aucun usage qualifié.
            </p>
          )}
        </ColumnCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-border bg-card p-4 text-xs">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Types de données
          </p>
          <div className="flex flex-wrap gap-2">
            <DataTypeBadge active={data.types.structured} label="Structurées" />
            <DataTypeBadge
              active={data.types.semiStructured}
              label="Semi-structurées"
            />
            <DataTypeBadge active={data.types.unstructured} label="Non structurées" />
          </div>
        </div>
        <div className="border border-border bg-card p-4 text-xs">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Sensibilité
          </p>
          <div className="flex items-center gap-2 text-xs">
            <SensitivityDot value={data.sensitivity} />
            <span className="font-bold">{labelSensitivity(data.sensitivity)}</span>
            {data.personalData ? (
              <span className="text-destructive">· données personnelles</span>
            ) : null}
          </div>
        </div>
      </div>

      {data.quality || data.availability || data.history ? (
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-secondary p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-primary">
        {title}
      </p>
      {children}
    </div>
  );
}

function ArrowCol() {
  return (
    <div className="hidden items-center justify-center sm:flex">
      <ArrowRight className="size-5 text-primary" />
    </div>
  );
}

function DataTypeBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "border px-2 py-0.5 text-[10px]",
        active
          ? "border-primary bg-accent text-primary font-bold"
          : "border-border text-muted-foreground line-through opacity-60",
      )}
    >
      {label}
    </span>
  );
}

function SensitivityDot({ value }: { value: DataInsights["sensitivity"] }) {
  // Discipline DSFR: navy intensities + red for critical.
  const color =
    value === "SENSITIVE"
      ? "bg-destructive"
      : value === "CONFIDENTIAL"
        ? "bg-primary"
        : value === "INTERNAL"
          ? "bg-primary/50"
          : "bg-border";
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

function Metric({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border border-border bg-card p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 line-clamp-2">{value ?? "—"}</p>
    </div>
  );
}
