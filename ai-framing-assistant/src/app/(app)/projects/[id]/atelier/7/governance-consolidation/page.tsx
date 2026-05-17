import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RaciMatrix, type RaciEntry } from "@/components/visualizations/raci-matrix";
import { ComplianceGauge } from "@/components/visualizations/compliance-gauge";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  COMPLIANCE_FRAMEWORK_LABELS,
  GOVERNANCE_LEVEL_COLORS,
  GOVERNANCE_LEVEL_LABELS,
  SECURITY_DOMAIN_LABELS,
  governanceLevelFromScore,
  type ComplianceFramework,
  type RaciType,
} from "@/types/atelier6";
import {
  aggregateGovernanceScore,
  computeComplianceByFramework,
  computeDimensionScores,
  computeSecurityCoverage,
} from "@/lib/engines/atelier6";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

export default async function GovernanceConsolidationPage(
  props: PageProps<"/projects/[id]/atelier/7/governance-consolidation">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const dims = computeDimensionScores(snap.a6);
  const { overall: govScore } = aggregateGovernanceScore(dims);
  const level = governanceLevelFromScore(govScore);
  const compliance = computeComplianceByFramework(snap.a6);
  const security = computeSecurityCoverage(snap.a6);

  const actors = Array.from(new Set(snap.a6.governanceRoles.map((r) => r.actorRole))).sort();
  const scopes = Array.from(new Set(snap.a6.governanceRoles.map((r) => r.scope)));
  const raciEntries: RaciEntry[] = snap.a6.governanceRoles.map((r) => ({
    actorRole: r.actorRole,
    scope: r.scope,
    responsibility: r.responsibilityType as RaciType,
  }));

  return (
    <SectionShell
      phaseLabel="Phase D — Gouvernance consolidée"
      title="Gouvernance consolidée (issue atelier 6)"
      livrableRef="§6 du livrable atelier 7 — consolidation atelier 6"
      intent="Vue consolidée gouvernance + conformité + sécurité, prête pour le COPIL final."
      pourquoi={[
        "L'atelier 7 ne ré-saisit rien : tout vient de l'atelier 6.",
        "Cette vue agrège pour la présentation finale.",
        "Les manques signalent les points à finaliser avant industrialisation.",
      ]}
      cherche={[
        "RACI complet sur tous les scopes critiques.",
        "Conformité ≥ 70% sur RGPD + EU AI Act.",
        "Sécurité : 6 domaines au moins actifs.",
        "Synthèse atelier 6 rédigée.",
      ]}
    >
      <div className="space-y-5">
        {/* Score gouvernance */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score gouvernance</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{govScore}</div>
            <div className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${GOVERNANCE_LEVEL_COLORS[level]}`}>
              {GOVERNANCE_LEVEL_LABELS[level]}
            </div>
          </div>
          <KpiCard label="Entrées RACI" value={snap.a6.governanceRoles.length} helper={`${scopes.length} scopes`} tone={snap.a6.governanceRoles.length >= 10 ? "good" : "warn"} />
          <KpiCard label="Procédures incidents" value={snap.a6.incidentProcedures.length} helper="playbook" tone={snap.a6.incidentProcedures.length >= 3 ? "good" : "warn"} />
        </div>

        {/* RACI */}
        <div className="rounded-md border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Matrice RACI
            </h3>
            <Link href={`/projects/${id}/atelier/6/cockpit`} className="text-[10px] underline underline-offset-2">
              Cockpit atelier 6 →
            </Link>
          </div>
          <RaciMatrix actors={actors} scopes={scopes} entries={raciEntries} />
        </div>

        {/* Conformité + Sécurité */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conformité par framework
            </h3>
            {compliance.length === 0 ? (
              <p className="text-xs italic text-muted-foreground">(aucun framework évalué)</p>
            ) : (
              <div className="flex flex-wrap gap-3">
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
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Couverture sécurité (8 domaines)
            </h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {security.map((s) => (
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
        </div>

        {/* Synthèse atelier 6 */}
        {snap.a6.synthesis ? (
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Synthèse gouvernance (atelier 6)
            </h3>
            <p className="text-sm">{snap.a6.synthesis.overallStatement}</p>
            <Link
              href={`/projects/${id}/atelier/6`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2"
            >
              Voir l&apos;atelier 6 complet <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
