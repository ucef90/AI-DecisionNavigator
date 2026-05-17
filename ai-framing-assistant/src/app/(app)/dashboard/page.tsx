import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileOutput,
  FolderKanban,
  PlusCircle,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DecisionBadge,
  StatusBadge,
} from "@/components/projects/status-badge";
import { buildDashboard } from "@/lib/db/dashboard";
import { cn } from "@/lib/utils";
import {
  DECISION_LABELS,
  DECISIONS,
  MATURITY_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type Decision,
} from "@/types";

// Semantic palette : success / primary / warning / muted / destructive.
const DECISION_BAR_COLORS: Record<Decision | "PENDING", string> = {
  GO_IA: "bg-success",
  POC_IA: "bg-primary",
  AUTOMATION: "bg-warning",
  STUDY: "bg-muted-foreground/50",
  NO_GO: "bg-destructive",
  PENDING: "bg-border",
};

const MATURITY_BAR_COLORS = {
  HIGH: "bg-success",
  MEDIUM: "bg-warning",
  LOW: "bg-destructive",
} as const;

export default async function DashboardPage() {
  const data = await buildDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Vue d&apos;ensemble du portfolio IA — statuts, décisions, risques, maturité.
          </p>
        </div>
        <Link href="/projects/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 size-4" />
          Nouveau projet
        </Link>
      </div>

      {data.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <KpiRow data={data} />

          <div className="grid gap-4 lg:grid-cols-2">
            <DecisionDistribution data={data} />
            <MaturityDistribution data={data} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
            <AlertsPanel alerts={data.alerts} />
            <RecentProjectsList projects={data.recent} />
          </div>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// KPI row
// -------------------------------------------------------------
function KpiRow({ data }: { data: Awaited<ReturnType<typeof buildDashboard>> }) {
  const inProgress =
    (data.byStatus.DRAFT ?? 0) + (data.byStatus.IN_PROGRESS ?? 0);
  const decided = data.byStatus.DECIDED ?? 0;
  const blockingAlerts = data.alerts.filter((a) => a.severity === "CRITICAL").length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={FolderKanban}
        title="Projets total"
        value={data.total}
        sub={`${decided} décidés · ${inProgress} en cadrage`}
      />
      <KpiCard
        icon={TrendingUp}
        title="Score moyen"
        value={data.averageScore != null ? `${data.averageScore}/18` : "—"}
        sub="Sur les projets scorés"
      />
      <KpiCard
        icon={FileOutput}
        title="Livrables"
        value={data.totalDeliverables}
        sub="Tous projets confondus"
      />
      <KpiCard
        icon={ShieldAlert}
        title="Alertes critiques"
        value={blockingAlerts}
        sub={
          blockingAlerts > 0
            ? "À lever en gouvernance"
            : "Aucun bloquant détecté"
        }
        tone={blockingAlerts > 0 ? "warning" : "ok"}
      />
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function KpiCard({
  icon: Icon,
  title,
  value,
  sub,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  value: string | number;
  sub: string;
  tone?: "ok" | "warning";
}) {
  // Tonal halo behind the icon — semantic colour mixed with white to keep
  // contrast soft. Matches the "halo de couleur tonale" specified in brief.
  const halo =
    tone === "warning"
      ? "bg-[color-mix(in_oklab,var(--destructive)_15%,white)] text-destructive"
      : tone === "ok"
        ? "bg-[color-mix(in_oklab,var(--success)_15%,white)] text-success"
        : "bg-accent text-primary";
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </span>
          <span
            className={cn(
              "flex items-center justify-center size-9 rounded-2xl",
              halo,
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="text-3xl font-medium tabular-nums font-display"
          style={{ color: "var(--navy)" }}
        >
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Decision distribution
// -------------------------------------------------------------
function DecisionDistribution({
  data,
}: {
  data: Awaited<ReturnType<typeof buildDashboard>>;
}) {
  const keys = [...DECISIONS, "PENDING"] as const;
  const max = Math.max(1, ...keys.map((k) => data.byDecision[k] ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Target className="size-4" />
          Distribution des décisions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {keys.map((k) => {
          const count = data.byDecision[k] ?? 0;
          const label = k === "PENDING" ? "En attente" : DECISION_LABELS[k];
          const pct = (count / max) * 100;
          return (
            <div key={k} className="space-y-0.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full transition-all", DECISION_BAR_COLORS[k])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Maturity distribution
// -------------------------------------------------------------
function MaturityDistribution({
  data,
}: {
  data: Awaited<ReturnType<typeof buildDashboard>>;
}) {
  const levels: ("HIGH" | "MEDIUM" | "LOW")[] = ["HIGH", "MEDIUM", "LOW"];
  const max = Math.max(1, ...levels.map((k) => data.byMaturity[k] ?? 0));

  const statuses = PROJECT_STATUSES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-1.5">
          <CheckCircle2 className="size-4" />
          Maturité dérivée & statuts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Maturité (auto-calculée)
          </p>
          {levels.map((k) => {
            const count = data.byMaturity[k] ?? 0;
            const pct = (count / max) * 100;
            return (
              <div key={k} className="space-y-0.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">{MATURITY_LABELS[k]}</span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full", MATURITY_BAR_COLORS[k])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5 border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Répartition par statut
          </p>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => {
              const count = data.byStatus[s] ?? 0;
              if (count === 0) return null;
              return (
                <Badge key={s} variant="outline" className="text-[10px]">
                  {PROJECT_STATUS_LABELS[s]} <span className="ml-1 font-semibold tabular-nums">{count}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Alerts panel
// -------------------------------------------------------------
function AlertsPanel({
  alerts,
}: {
  alerts: Awaited<ReturnType<typeof buildDashboard>>["alerts"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-1.5">
          <AlertTriangle className="size-4 text-destructive" />
          Alertes portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            Aucune alerte critique sur le portfolio. ✨
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li
                key={`${a.projectId}-${i}`}
                className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-destructive" />
                  <div className="flex-1 space-y-0.5">
                    <Link
                      href={`/projects/${a.projectId}/decision`}
                      className="font-semibold hover:underline"
                    >
                      {a.projectName}
                    </Link>
                    <p>
                      <span className="font-medium">{a.title}.</span>{" "}
                      <span className="text-muted-foreground">{a.detail}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Recent projects
// -------------------------------------------------------------
function RecentProjectsList({
  projects,
}: {
  projects: Awaited<ReturnType<typeof buildDashboard>>["recent"];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <FolderKanban className="size-4" />
          Projets récents
        </CardTitle>
        <Link
          href="/projects"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Voir tous →
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {projects.map((p) => (
            <li key={p.id} className="py-2 first:pt-0 last:pb-0">
              <Link
                href={`/projects/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    {p.derivedMaturity ? (
                      <span>Maturité {MATURITY_LABELS[p.derivedMaturity]}</span>
                    ) : null}
                    {p.blockers > 0 ? (
                      <span className="text-destructive">
                        · {p.blockers} bloquant{p.blockers > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {p.totalScore != null ? `${p.totalScore}/18` : "—"}
                  </span>
                  <StatusBadge status={p.status} />
                  <DecisionBadge decision={p.finalDecision} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Empty state
// -------------------------------------------------------------
function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FolderKanban className="mx-auto mb-3 size-8 text-muted-foreground" />
        <h3 className="text-base font-semibold">Aucun projet pour l&apos;instant</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Crée ton premier projet de cadrage IA, ou seede les 3 cas de référence
          via{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run seed</code>.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/projects/new" className={buttonVariants()}>
            <PlusCircle className="mr-2 size-4" />
            Nouveau projet
          </Link>
          <Link
            href="/projects"
            className={buttonVariants({ variant: "outline" })}
          >
            Voir les projets
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
