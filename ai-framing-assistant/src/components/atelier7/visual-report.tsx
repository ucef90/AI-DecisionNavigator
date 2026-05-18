// Rapport visuel complet du projet — 8 pages logiques (cover + 7 ateliers)
// avec visualisations interleaved. Rendu UNIQUEMENT à l'impression via
// `hidden print:block` sur le parent, donc volontairement light côté CSS
// d'écran. Pas de "use client" — composant pur déterministe.

import { RadarChart } from "@/components/scoring/radar-chart";
import { RaciMatrix } from "@/components/visualizations/raci-matrix";
import { GanttChart, type GanttItem } from "@/components/visualizations/gantt-chart";
import { ComplianceGauge } from "@/components/visualizations/compliance-gauge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RaciType } from "@/types/atelier6";
import type { VisualReportData } from "@/lib/deliverables/visual-report-data";

// Force un saut de page avant chaque grand bloc atelier en impression.
const PAGE_BREAK: React.CSSProperties = { breakBefore: "page", pageBreakBefore: "always" };

export function VisualReport({ data }: { data: VisualReportData }) {
  return (
    <div className="space-y-8 text-sm">
      {/* ============= COVER ============= */}
      <Section>
        <div className="mb-8 border-b border-foreground/30 pb-4">
          <div className="text-[10px] uppercase tracking-wider opacity-70">
            Dossier stratégique IA — Rapport complet
          </div>
          <h1 className="!mt-1 !mb-1 text-2xl font-bold">{data.projectName}</h1>
          <div className="text-[10px] opacity-70">Édité le {data.generatedAt}</div>
        </div>

        <DecisionBlock cover={data.cover} />

        <div className="mt-5 grid grid-cols-4 gap-3">
          <Metric label="Scoring (A4)" value={`${data.cover.scoringScore}/100`} />
          <Metric label="Gouvernance (A6)" value={`${data.cover.governanceScore}/100`} />
          <Metric label="Vision (A7)" value={`${data.cover.visionScore}/100`} />
          <Metric label="Readiness indus." value={`${data.cover.readinessScore}/100`} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <SmallList title="Points forts" items={data.cover.strongPoints} />
          <SmallList title="Points faibles" items={data.cover.weakPoints} />
          <SmallList title="Risques principaux" items={data.cover.mainRisks} />
        </div>

        {data.cover.sponsorDecisionLabel ? (
          <div className="mt-5 rounded-md border border-foreground/30 px-3 py-2 text-[11px]">
            <div className="text-[10px] uppercase tracking-wider opacity-70">Validation sponsor</div>
            <div className="font-semibold">{data.cover.sponsorDecisionLabel}</div>
            {data.cover.sponsorName ? (
              <div className="opacity-70">
                {data.cover.sponsorName}
                {data.cover.sponsorDate ? ` — ${data.cover.sponsorDate}` : ""}
              </div>
            ) : null}
          </div>
        ) : null}
      </Section>

      {/* ============= ATELIER 1 ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="1" title="Compréhension du besoin métier" />
        <Block title="Qualification">
          <KV k="Direction" v={data.a1.direction} />
          <KV k="Sponsor métier" v={data.a1.sponsor} />
          <KV k="Déclencheur" v={data.a1.triggerEvent} />
          <KV k="Pourquoi prioritaire" v={data.a1.priorityReason} />
        </Block>
        <Block title="Reformulation du besoin">
          <KV k="Demande initiale" v={data.a1.initialRequest} />
          <KV k="Besoin reformulé" v={data.a1.reformulatedNeed} />
          <KV k="Valeur attendue" v={data.a1.expectedValue} />
        </Block>

        {data.a1.actors.length > 0 ? (
          <Block title={`Acteurs (${data.a1.actors.length})`}>
            <Tbl
              headers={["Nom", "Catégorie", "Volume"]}
              rows={data.a1.actors.map((a) => [a.name, a.category, a.volume != null ? String(a.volume) : "—"])}
            />
          </Block>
        ) : null}

        {data.a1.irritants.length > 0 ? (
          <Block title={`Irritants (${data.a1.irritants.length})`}>
            <Tbl
              headers={["Titre", "Sévérité", "Catégorie", "Min/jour perdus"]}
              rows={data.a1.irritants.map((i) => [i.title, i.severity, i.category, i.estimatedMin != null ? `${i.estimatedMin}` : "—"])}
            />
          </Block>
        ) : null}

        {data.a1.kpis.length > 0 ? (
          <Block title={`KPI baseline (${data.a1.kpis.length})`}>
            <Tbl
              headers={["KPI", "Actuel", "Cible", "Unité", "Statut"]}
              rows={data.a1.kpis.map((k) => [k.name, k.currentValue ?? "—", k.targetValue ?? "—", k.unit ?? "—", k.status])}
            />
          </Block>
        ) : null}

        {data.a1.objectives.length > 0 ? (
          <Block title={`Objectifs (${data.a1.objectives.length})`}>
            <ul className="ml-4 list-disc">
              {data.a1.objectives.map((o, i) => (
                <li key={i}>
                  {o.title} <span className="opacity-70">(priorité {o.priority})</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {data.a1.inScope.length > 0 ? <SmallList title="In scope" items={data.a1.inScope} /> : null}
          {data.a1.outOfScope.length > 0 ? <SmallList title="Hors scope" items={data.a1.outOfScope} /> : null}
        </div>
      </Section>

      {/* ============= ATELIER 2 ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="2" title="IA vs automatisation" />
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Étapes workflow" value={data.a2.workflowSteps} />
          <Metric label="Étapes IA" value={data.a2.aiQualifiedSteps} />
          <Metric label="Étapes automation" value={data.a2.automationQualifiedSteps} />
          <Metric label="Validations humaines" value={data.a2.humanValidations} />
        </div>
      </Section>

      {/* ============= ATELIER 3 ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="3" title="Cadrage IA" />

        <Block title="Documents">
          <KV k="Complexité documentaire" v={data.a3.docComplexity} />
          <KV k="Formats" v={data.a3.formats.length > 0 ? data.a3.formats.join(", ") : null} />
        </Block>
        <Block title="Conformité réglementaire">
          <KV k="RGPD applicable" v={data.a3.rgpdApplicable ? "Oui" : "Non"} />
          <KV k="Données sensibles" v={data.a3.sensitiveData ? "Oui" : "Non"} />
          <KV k="EU AI Act tier" v={data.a3.euAiActTier} />
          <KV k="DPO consulté" v={data.a3.dpoConsulted ? "Oui" : "Non"} />
        </Block>

        {data.a3.maturityScores.length > 0 ? (
          <Block title="Maturité auto-évaluée (1-5)">
            <div className="space-y-1.5">
              {data.a3.maturityScores.map((m) => (
                <ScoreBar key={m.axis} label={m.label} score={m.score} max={5} />
              ))}
            </div>
          </Block>
        ) : null}

        <Block title="Recommandation finale atelier 3">
          <p className="text-xs leading-relaxed">{data.a3.finalRecommendation ?? "(non renseigné)"}</p>
        </Block>
      </Section>

      {/* ============= ATELIER 4 — RADAR ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="4" title="Scoring & maturité projet" />
        <div className="mb-3 flex items-center gap-3 text-xs">
          <strong>Score global :</strong>
          <Badge variant="outline">{data.a4.overallScore}/100</Badge>
          <span className="opacity-70">{data.a4.overallLevelLabel}</span>
        </div>

        <div className="flex justify-center">
          <div style={{ width: 380, maxWidth: "100%" }}>
            <RadarChart
              axes={data.a4.radarAxes}
              series={[{ label: "Score", values: data.a4.radarValues, color: "#0ea5e9", fillOpacity: 0.25 }]}
              size={380}
              max={5}
            />
          </div>
        </div>

        {data.a4.recommendedDecisionLabel ? (
          <div className="mt-3 rounded-md border border-foreground/20 bg-muted/30 px-3 py-2 text-xs">
            <div className="text-[10px] uppercase tracking-wider opacity-70">Décision recommandée (atelier 4)</div>
            <div className="font-semibold">{data.a4.recommendedDecisionLabel}</div>
            {data.a4.decisionRationale ? <p className="mt-1 opacity-80">{data.a4.decisionRationale}</p> : null}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-3">
          <SmallList title="Points forts" items={data.a4.strongPoints} />
          <SmallList title="Points faibles" items={data.a4.weakPoints} />
          <SmallList title="Recommandations" items={data.a4.topRecommendations} />
        </div>
      </Section>

      {/* ============= ATELIER 5 ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="5" title="Cartographie IA" />
        {data.a5.systemOverview ? (
          <Block title="Vue d'ensemble système">
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{data.a5.systemOverview}</p>
          </Block>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          {data.a5.criticalNodes.length > 0 ? (
            <SmallList title="Nœuds critiques" items={data.a5.criticalNodes} />
          ) : null}
          {data.a5.missingComponents.length > 0 ? (
            <SmallList title="Composants manquants" items={data.a5.missingComponents} />
          ) : null}
        </div>
      </Section>

      {/* ============= ATELIER 6 — RACI + COMPLIANCE ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="6" title="Gouvernance, risques, conformité" />
        <div className="mb-3 flex items-center gap-3 text-xs">
          <strong>Score gouvernance :</strong>
          <Badge variant="outline">{data.a6.governanceScore}/100</Badge>
          <span className="opacity-70">{data.a6.governanceLevelLabel}</span>
          {data.a6.industrializationReadiness ? (
            <Badge variant="outline" className="border-emerald-500/40">✓ Industrialisation envisageable</Badge>
          ) : null}
        </div>

        <Block title="Dimensions gouvernance">
          <div className="space-y-1.5">
            {data.a6.dimensionScores.map((d) => (
              <ScoreBar key={d.id} label={d.label} score={d.score} max={100} small />
            ))}
          </div>
        </Block>

        {data.a6.raciActors.length > 0 && data.a6.raciScopes.length > 0 ? (
          <Block title={`Matrice RACI (${data.a6.raciEntries.length} entrées)`}>
            <div className="text-[10px]">
              <RaciMatrix
                actors={data.a6.raciActors}
                scopes={data.a6.raciScopes}
                entries={data.a6.raciEntries.map((e) => ({ ...e, responsibility: e.responsibility as RaciType }))}
              />
            </div>
          </Block>
        ) : null}

        {data.a6.complianceByFramework.length > 0 ? (
          <Block title="Conformité par framework">
            <div className="flex flex-wrap gap-2">
              {data.a6.complianceByFramework.map((c) => (
                <ComplianceGauge
                  key={c.framework}
                  value={c.score}
                  label={c.frameworkLabel}
                  sublabel={`${c.compliant}/${c.total} conformes`}
                  size={90}
                />
              ))}
            </div>
          </Block>
        ) : null}

        {data.a6.synthesisStatement ? (
          <Block title="Synthèse gouvernance">
            <p className="text-xs leading-relaxed">{data.a6.synthesisStatement}</p>
          </Block>
        ) : null}
      </Section>

      {/* ============= ATELIER 7 — VISION + GANTT + DÉCISION ============= */}
      <Section style={PAGE_BREAK}>
        <SectionHeader number="7" title="Vision, roadmap, décision finale" />

        {data.a7.visionStatement ? (
          <Block title="Vision stratégique">
            <p className="text-xs leading-relaxed">{data.a7.visionStatement}</p>
          </Block>
        ) : null}
        {data.a7.businessValue ? (
          <Block title="Valeur business attendue">
            <p className="text-xs leading-relaxed">{data.a7.businessValue}</p>
          </Block>
        ) : null}

        {data.a7.roadmapItems.length > 0 ? (
          <Block title={`Roadmap transformation (${data.a7.roadmapItems.length} items)`}>
            <div className="text-[10px]">
              <GanttChart
                items={data.a7.roadmapItems.map((i) => ({
                  id: i.id,
                  title: i.title,
                  phase: i.phase,
                  effortMonths: i.effortMonths,
                  status: i.status,
                  impact: i.impact,
                  complexity: i.complexity,
                })) satisfies GanttItem[]}
              />
            </div>
          </Block>
        ) : null}

        {data.a7.industrializationStages.length > 0 ? (
          <Block title="Readiness industrialisation par stage">
            <Tbl
              headers={["Stage", "Prêt ?", "Items planifiés", "Frein éventuel"]}
              rows={data.a7.industrializationStages.map((s) => [
                s.stageLabel,
                s.ready ? "✓ Prêt" : "⚠ À sécuriser",
                String(s.planned),
                s.why ?? "—",
              ])}
            />
          </Block>
        ) : null}

        {data.a7.successCriteria.length > 0 ? (
          <Block title="Critères de succès SMART">
            <ul className="ml-4 list-disc text-xs">
              {data.a7.successCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Block>
        ) : null}
      </Section>
    </div>
  );
}

// --------------------- helpers visuels ---------------------

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={style} className="break-inside-avoid">
      {children}
    </section>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 border-b border-foreground/20 pb-1">
      <div className="text-[10px] uppercase tracking-wider opacity-70">Atelier {number}</div>
      <h2 className="!mt-0.5 !mb-0 text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="!mt-2 !mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-70">{title}</h3>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-xs leading-snug">
      <span className="opacity-70">{k} :</span>
      <span>{v?.trim() || "—"}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-foreground/20 px-2 py-1.5 text-center">
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-foreground/15 bg-muted/20 px-2 py-1.5">
      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-70">{title}</div>
      {items.length === 0 ? (
        <p className="text-[10px] italic opacity-60">(aucun élément)</p>
      ) : (
        <ul className="mt-1 space-y-0.5 text-[10px] leading-snug">
          {items.map((it, i) => (
            <li key={i}>• {it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tbl({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="w-full border-collapse text-[10px]">
      <thead>
        <tr className="border-b border-foreground/30">
          {headers.map((h, i) => (
            <th key={i} className="px-1.5 py-1 text-left font-semibold uppercase tracking-wider opacity-70">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-foreground/10">
            {row.map((cell, j) => (
              <td key={j} className="px-1.5 py-0.5">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ScoreBar({ label, score, max, small }: { label: string; score: number; max: number; small?: boolean }) {
  const pct = max === 0 ? 0 : Math.round((Math.max(0, Math.min(max, score)) / max) * 100);
  return (
    <div className={cn("grid grid-cols-[120px_1fr_40px] items-center gap-2", small ? "text-[10px]" : "text-xs")}>
      <span className="truncate opacity-80">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-right tabular-nums">{score}/{max}</span>
    </div>
  );
}

function DecisionBlock({ cover }: { cover: VisualReportData["cover"] }) {
  return (
    <div className="rounded-md border-2 border-foreground/30 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider opacity-70">Décision finale recommandée</div>
      <div className="mt-1 text-xl font-bold">{cover.decisionLabel}</div>
      <p className="mt-2 text-xs leading-relaxed">{cover.rationale}</p>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <strong>Score global projet :</strong>
        <Badge variant="outline">{cover.overall}/100</Badge>
        <span className="opacity-70">{cover.overallLevelLabel}</span>
      </div>
    </div>
  );
}
