import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ListChecks,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { ComplianceGauge } from "@/components/visualizations/compliance-gauge";
import { RaciMatrix, type RaciEntry } from "@/components/visualizations/raci-matrix";
import { RiskHeatmap } from "@/components/visualizations/risk-heatmap";
import { cn } from "@/lib/utils";
import {
  aggregateGovernanceScore,
  computeComplianceByFramework,
  computeDimensionScores,
  computeRiskHeatmap,
  computeSecurityCoverage,
  loadAtelier6Snapshot,
  reasonGovernance,
} from "@/lib/engines/atelier6";
import {
  COMPLIANCE_FRAMEWORK_LABELS,
  GOVERNANCE_LEVEL_COLORS,
  GOVERNANCE_LEVEL_LABELS,
  SECURITY_DOMAIN_LABELS,
  governanceLevelFromScore,
  type ComplianceFramework,
  type RaciType,
} from "@/types/atelier6";

// LE COCKPIT GOUVERNANCE IA — section pivot atelier 6.
// Une seule page dense qui agrège :
//   - Score global gouvernance + readiness
//   - RACI matrix (dérivée des GovernanceRole)
//   - Heatmap risques (dérivée de RiskAssessment + atténuée)
//   - Score conformité par framework (gauges)
//   - Couverture sécurité (8 domaines)
//   - KPI monitoring (cards)
//   - Procédures incidents (timeline)
//   - Points forts / faibles / actions prioritaires (reasoner)
//
// Conçu pour donner une vraie impression "plateforme enterprise
// governance" — pas un formulaire.

export default async function CockpitGovernancePage(
  props: PageProps<"/projects/[id]/atelier/6/cockpit">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  const dims = computeDimensionScores(snap);
  const { overall: govScore } = aggregateGovernanceScore(dims);
  const level = governanceLevelFromScore(govScore);
  const reasoning = reasonGovernance(snap, dims);
  const heatmap = computeRiskHeatmap(snap);
  const compliance = computeComplianceByFramework(snap);
  const securityCoverage = computeSecurityCoverage(snap);

  // Construire la matrice RACI : acteurs uniques, scopes uniques
  const actors = Array.from(new Set(snap.governanceRoles.map((r) => r.actorRole))).sort();
  const scopes = Array.from(new Set(snap.governanceRoles.map((r) => r.scope)));
  const raciEntries: RaciEntry[] = snap.governanceRoles.map((r) => ({
    actorRole: r.actorRole,
    scope: r.scope,
    responsibility: r.responsibilityType as RaciType,
  }));

  return (
    <SectionShell
      phaseLabel="Phase A — Cockpit gouvernance"
      title="Cockpit gouvernance IA"
      livrableRef="Vue centrale — agrège les modules 1 à 8"
      intent="Tableau de bord exécutif : RACI, risques, conformité, sécurité, monitoring, incidents — en un seul écran."
      pourquoi={[
        "Le cockpit transforme les analyses en INDICATEURS visuels actionnables.",
        "Il sert de support COPIL : 1 écran = compréhension globale de la posture IA du projet.",
        "Les visualisations (heatmap, RACI, gauges) rendent les angles morts immédiatement visibles.",
      ]}
      cherche={[
        "Les zones rouges (risques élevés, conformité < 50%, dimensions < 40).",
        "Les rôles non assignés (cellules vides du RACI).",
        "Les contrôles sécurité PLANIFIÉS mais pas IN_PLACE.",
        "Les incidents critiques sans playbook défini.",
      ]}
      pieges={[
        "Considérer que tout est OK parce que toutes les cellules sont remplies : qualité ≠ quantité.",
        "Oublier la traçabilité (logs) — sans elle, l'audit est impossible.",
        "Définir des KPI sans seuil d'alerte : ils ne servent à rien en exploitation.",
      ]}
    >
      {/* HERO : score + niveau + readiness */}
      <div
        className={cn(
          "mb-6 grid gap-3 rounded-xl border p-5 sm:grid-cols-[1fr_2fr_1fr]",
          reasoning.industrializationReadiness
            ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/15"
            : "border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/15",
        )}
      >
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Score gouvernance
          </div>
          <div className="text-4xl font-semibold tabular-nums">{govScore}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          <div className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${GOVERNANCE_LEVEL_COLORS[level]}`}>
            {GOVERNANCE_LEVEL_LABELS[level]}
          </div>
        </div>
        <div className="flex items-center text-sm">
          <p>{reasoning.overallStatement}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {reasoning.industrializationReadiness ? (
            <Shield className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="h-8 w-8 text-amber-700 dark:text-amber-400" />
          )}
          <div className="text-[10px] font-semibold uppercase tracking-wider">
            {reasoning.industrializationReadiness
              ? "Industrialisation validée"
              : "Industrialisation à sécuriser"}
          </div>
        </div>
      </div>

      {/* 6 dimensions barres */}
      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" />
          6 dimensions gouvernance
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dims.map((d) => (
            <div key={d.id} className="rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{d.label}</span>
                <span className="text-lg font-semibold tabular-nums">{d.score}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full",
                    d.score >= 70 ? "bg-emerald-500" : d.score >= 40 ? "bg-amber-500" : "bg-rose-500",
                  )}
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] leading-snug text-muted-foreground">{d.rationale}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RACI + Heatmap risques (2 colonnes) */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Matrice RACI
            </h3>
            <Link
              href={`/projects/${id}/atelier/6/governance-roles`}
              className="text-[10px] underline underline-offset-2"
            >
              Éditer →
            </Link>
          </div>
          <RaciMatrix actors={actors} scopes={scopes} entries={raciEntries} />
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Heatmap risques IA (prob × impact)
            </h3>
            <Link
              href={`/projects/${id}/atelier/6/ai-risks`}
              className="text-[10px] underline underline-offset-2"
            >
              Détail →
            </Link>
          </div>
          {heatmap.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs italic text-muted-foreground">
              Aucun risque IA évalué.{" "}
              <Link href={`/projects/${id}/wizard/risks`} className="underline">
                Compléter
              </Link>
            </p>
          ) : (
            <RiskHeatmap
              points={heatmap.map((p) => ({
                label: p.label,
                impact: p.impact,
                probability: p.probability,
              }))}
            />
          )}
        </div>
      </section>

      {/* Conformité (gauges) + Sécurité (couverture par domaine) */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Conformité par framework
            </h3>
            <Link
              href={`/projects/${id}/atelier/6/compliance`}
              className="text-[10px] underline underline-offset-2"
            >
              Éditer →
            </Link>
          </div>
          {compliance.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs italic text-muted-foreground">
              Aucun item de conformité saisi.
            </p>
          ) : (
            <div className="flex flex-wrap items-start gap-3">
              {compliance.map((c) => (
                <ComplianceGauge
                  key={c.framework}
                  value={c.score}
                  label={COMPLIANCE_FRAMEWORK_LABELS[c.framework as ComplianceFramework]}
                  sublabel={`${c.compliant}/${c.total} conformes`}
                  size={110}
                />
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Couverture sécurité (8 domaines)
            </h3>
            <Link
              href={`/projects/${id}/atelier/6/security`}
              className="text-[10px] underline underline-offset-2"
            >
              Éditer →
            </Link>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {securityCoverage.map((s) => (
              <div
                key={s.domain}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                  s.status === "ACTIVE"
                    ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : s.status === "PARTIAL"
                      ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20"
                      : "border-dashed border-border bg-background",
                )}
              >
                <span className="truncate">{SECURITY_DOMAIN_LABELS[s.domain]}</span>
                <Badge variant="outline" className="shrink-0 text-[9px]">
                  {s.active}/{s.controls}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Monitoring */}
      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            KPI monitoring ({snap.monitoringKpis.length})
          </h3>
          <Link
            href={`/projects/${id}/atelier/6/monitoring`}
            className="text-[10px] underline underline-offset-2"
          >
            Éditer →
          </Link>
        </div>
        {snap.monitoringKpis.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs italic text-muted-foreground">
            Aucun KPI défini. Identifie au moins 3 KPI à surveiller (qualité IA, dérive,
            incidents…).
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {snap.monitoringKpis.slice(0, 8).map((k) => (
              <KpiCard
                key={k.id}
                label={k.category}
                value={k.targetValue ?? "—"}
                unit={k.unit ?? undefined}
                helper={k.name}
              />
            ))}
          </div>
        )}
      </section>

      {/* Incidents (timeline) */}
      <section className="mb-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Playbook incidents ({snap.incidentProcedures.length})
          </h3>
          <Link
            href={`/projects/${id}/atelier/6/incidents`}
            className="text-[10px] underline underline-offset-2"
          >
            Éditer →
          </Link>
        </div>
        {snap.incidentProcedures.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs italic text-muted-foreground">
            Aucune procédure incident. Définis au moins 2 playbooks (hallucination, fuite
            données, dérive).
          </p>
        ) : (
          <div className="space-y-1.5">
            {snap.incidentProcedures.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs",
                  p.severity === "CRITICAL"
                    ? "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20"
                    : p.severity === "HIGH"
                      ? "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20"
                      : "border-border",
                )}
              >
                <Badge variant="outline" className="shrink-0 text-[9px]">
                  {p.severity}
                </Badge>
                <span className="flex-1 font-semibold">{p.incidentType}</span>
                {p.escalationPath ? (
                  <span className="text-[10px] text-muted-foreground">→ {p.escalationPath}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reasoner — forces / faiblesses / actions */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Block
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          title="Points forts"
          items={reasoning.strongPoints}
          empty="Aucune dimension ≥ 70."
        />
        <Block
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          tone="rose"
          title="Points faibles"
          items={reasoning.weakPoints}
          empty="Toutes les dimensions ≥ 40."
        />
        <Block
          icon={<ListChecks className="h-3.5 w-3.5" />}
          tone="sky"
          title="Actions prioritaires"
          items={reasoning.priorityActions}
          empty="Pas d'action prioritaire identifiée."
        />
      </section>
    </SectionShell>
  );
}

const TONE = {
  emerald: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
  rose: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  sky: "border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20",
} as const;

function Block({
  icon,
  tone,
  title,
  items,
  empty,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className={`rounded-md border ${TONE[tone]} p-3`}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {items.map((it, i) => (
            <li key={i} className="flex gap-1.5">
              <span>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
