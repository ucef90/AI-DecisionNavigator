import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Shield, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { RadarChart } from "@/components/scoring/radar-chart";
import {
  a6OverallProgress,
  a6PhaseProgress,
  aggregateGovernanceScore,
  computeA6Progress,
  computeDimensionScores,
  loadAtelier6Snapshot,
  reasonGovernance,
} from "@/lib/engines/atelier6";
import {
  ATELIER6_PHASES,
  GOVERNANCE_LEVEL_COLORS,
  GOVERNANCE_LEVEL_LABELS,
  governanceLevelFromScore,
} from "@/types/atelier6";

export default async function Atelier6LandingPage(
  props: PageProps<"/projects/[id]/atelier/6">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA6Progress(snap);
  const overall = a6OverallProgress(snap);
  const dims = computeDimensionScores(snap);
  const { overall: govScore } = aggregateGovernanceScore(dims);
  const level = governanceLevelFromScore(govScore);
  const reasoning = reasonGovernance(snap, dims);

  const allSec = ATELIER6_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  // Radar 6 dimensions (scaled 0-100 → 0-5)
  const radarAxes = dims.map((d) => ({ key: d.id, label: d.label, short: d.label.split(" ")[0] }));
  const radarSeries = [
    {
      label: "Gouvernance",
      values: dims.map((d) => d.score / 20),
      color: "#8b5cf6",
      fillOpacity: 0.22,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 6 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Gouvernance, risques et conformité IA
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Cockpit complet de gouvernance IA : RACI, validations humaines, heatmap risques,
              contrôles sécurité, conformité RGPD/EU AI Act, monitoring KPI et playbook incidents.
              Tout est auto-évalué depuis les ateliers 1-5.
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/6/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Ouvrir le cockpit" : "Reprendre"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Dashboard hero : score + radar + readiness */}
      <section className="grid gap-4 lg:grid-cols-[1fr_minmax(0,1.2fr)_1fr]">
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-6 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Score gouvernance
          </div>
          <div className="mt-2 text-5xl font-semibold tabular-nums">{govScore}</div>
          <div className="text-xs text-muted-foreground">sur 100</div>
          <div className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${GOVERNANCE_LEVEL_COLORS[level]}`}>
            {GOVERNANCE_LEVEL_LABELS[level]}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Radar 6 dimensions
            </h3>
          </div>
          <div className="flex items-center justify-center text-foreground">
            <RadarChart axes={radarAxes} series={radarSeries} size={260} max={5} />
          </div>
        </article>

        <article
          className={`rounded-xl border p-6 ${
            reasoning.industrializationReadiness
              ? "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30"
              : "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/30"
          }`}
        >
          <div className="flex items-start gap-3">
            {reasoning.industrializationReadiness ? (
              <Shield className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Industrialisation
              </div>
              <div className="mt-0.5 text-lg font-semibold">
                {reasoning.industrializationReadiness ? "Envisageable" : "À sécuriser"}
              </div>
              <p className="mt-1 text-xs">{reasoning.overallStatement}</p>
            </div>
          </div>
        </article>
      </section>

      {/* KPI mini-cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="RACI entrées"
          value={snap.governanceRoles.length}
          helper="rôles assignés aux scopes gouvernance"
          tone={snap.governanceRoles.length >= 4 ? "good" : snap.governanceRoles.length > 0 ? "warn" : "bad"}
        />
        <KpiCard
          label="Validations humaines"
          value={snap.humanValidations.length}
          helper="points obligatoires"
          tone={snap.humanValidations.length >= 2 ? "good" : snap.humanValidations.length > 0 ? "warn" : "bad"}
        />
        <KpiCard
          label="Contrôles sécurité"
          value={snap.securityControls.length}
          helper="AUTH / RBAC / chiffrement / logs..."
          tone={snap.securityControls.length >= 4 ? "good" : snap.securityControls.length > 0 ? "warn" : "bad"}
        />
        <KpiCard
          label="Items conformité"
          value={snap.complianceItems.length}
          helper="RGPD / EU AI Act / interne"
          tone={snap.complianceItems.length >= 3 ? "good" : snap.complianceItems.length > 0 ? "warn" : "bad"}
        />
        <KpiCard
          label="KPI monitoring"
          value={snap.monitoringKpis.length}
          helper="à surveiller en prod"
          tone={snap.monitoringKpis.length >= 3 ? "good" : snap.monitoringKpis.length > 0 ? "warn" : "bad"}
        />
      </section>

      {/* Phases */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parcours en 5 phases
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER6_PHASES.map((phase, idx) => {
            const ratio = a6PhaseProgress(snap, phase.id);
            const sections = phase.sections;
            const done = sections.filter((s) => sectionProgress[s.id].status === "COMPLETE").length;
            return (
              <article key={phase.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Phase {phase.id}
                      {idx < ATELIER6_PHASES.length - 1 ? " →" : ""}
                    </div>
                    <div className="mt-0.5 font-semibold leading-tight">{phase.title}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {done}/{sections.length}
                  </Badge>
                </header>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{phase.intent}</p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-foreground/80 transition-all" style={{ width: `${ratio}%` }} />
                </div>
                <ul className="mt-3 space-y-0.5 text-[11px] text-muted-foreground">
                  {sections.map((s) => (
                    <li key={s.id} className="flex items-center gap-1.5">
                      <span
                        className={
                          sectionProgress[s.id].status === "COMPLETE"
                            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                            : sectionProgress[s.id].status === "STARTED"
                              ? "h-1.5 w-1.5 rounded-full bg-amber-400"
                              : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                        }
                      />
                      <Link
                        href={`/projects/${snap.projectId}/atelier/6/${s.id}`}
                        className="truncate hover:underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
