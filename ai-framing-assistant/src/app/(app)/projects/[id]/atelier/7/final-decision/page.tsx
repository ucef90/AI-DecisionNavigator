import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertTriangle, Shield } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DECISION_LABELS, type Decision } from "@/types";
import {
  computeFinalDecision,
  computeGlobalProjectScore,
  loadAtelier7Snapshot,
} from "@/lib/engines/atelier7";
import { SPONSOR_DECISION_LABELS, type SponsorDecision } from "@/types/atelier7";

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

const DECISION_COLOR: Record<Decision, string> = {
  GO_IA: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  POC_IA: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  AUTOMATION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  STUDY: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NO_GO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

const SPONSOR_COLOR: Record<SponsorDecision, string> = {
  OK: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  KO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  IN_REVIEW: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
};

export default async function FinalDecisionPage(
  props: PageProps<"/projects/[id]/atelier/7/final-decision">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const globalScore = computeGlobalProjectScore(snap);
  const decision = computeFinalDecision(snap);
  const synthesis = snap.synthesis;
  const finalDec = (synthesis?.finalDecision as Decision | null) ?? decision.decision;
  const finalRationale = synthesis?.decisionRationale ?? decision.rationale;
  const sponsorDec = synthesis?.sponsorDecision as SponsorDecision | null;

  // topRecommendations vient de l'atelier 4 (pas d'attribut sur Atelier7Synthesis)
  const topRecos = safeJSON<string[]>(snap.a4.a4Synthesis?.topRecommendations, []);
  const strongPoints = safeJSON<string[]>(synthesis?.strongPoints, decision.strongPoints);
  const weakPoints = safeJSON<string[]>(synthesis?.weakPoints, decision.weakPoints);
  const mainRisks = safeJSON<string[]>(synthesis?.mainRisks, decision.mainRisks);

  return (
    <SectionShell
      phaseLabel="Phase E — Décision finale"
      title="Décision finale IA"
      livrableRef="§8 du livrable atelier 7"
      intent="La décision argumentée présentée au sponsor, avec score global et validation."
      pourquoi={[
        "C'est l'arbitrage final qui engage le projet en POC, MVP ou industrialisation.",
        "La décision doit être DOCUMENTÉE — pas un verdict isolé.",
        "Sponsor sign-off = passage du cadrage à l'exécution.",
      ]}
      cherche={[
        "Cohérence décision vs score (un GO_IA sur score 40/100 = incohérence).",
        "Rationnel chiffré et factuel.",
        "Validation explicite du sponsor (OK / KO / IN_REVIEW).",
        "Conditions et risques explicités.",
      ]}
    >
      <div className="space-y-6">
        {/* Hero décision */}
        <div className={cn("rounded-xl border p-6", DECISION_COLOR[finalDec])}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                Décision recommandée
              </div>
              <div className="mt-1 text-3xl font-bold">{DECISION_LABELS[finalDec]}</div>
              <p className="mt-3 text-sm leading-relaxed">{finalRationale}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="font-semibold">Score global projet :</span>
                <Badge variant="outline" className="bg-background/80">{globalScore.overall}/100</Badge>
                <Badge variant="outline" className="bg-background/80">Scoring {globalScore.scoringScore}</Badge>
                <Badge variant="outline" className="bg-background/80">Gouvernance {globalScore.governanceScore}</Badge>
                <Badge variant="outline" className="bg-background/80">Vision {globalScore.visionScore}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor sign-off */}
        <div className={cn("rounded-md border p-4", sponsorDec ? SPONSOR_COLOR[sponsorDec] : "border-dashed border-border bg-muted/30")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Validation sponsor
              </div>
              <div className="mt-0.5 text-lg font-semibold">
                {sponsorDec ? SPONSOR_DECISION_LABELS[sponsorDec] : "Non décidé"}
              </div>
              {synthesis?.sponsorName ? (
                <p className="text-xs">{synthesis.sponsorName}{synthesis.sponsorDecisionDate ? ` — ${new Date(synthesis.sponsorDecisionDate).toISOString().slice(0, 10)}` : ""}</p>
              ) : null}
            </div>
            {sponsorDec === "OK" ? <CheckCircle2 className="h-6 w-6" /> : null}
          </div>
        </div>

        {/* Stratégies */}
        <div className="grid gap-3 md:grid-cols-3">
          {synthesis?.industrializationStrategy ? (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stratégie industrialisation
              </div>
              <p className="text-xs">{synthesis.industrializationStrategy}</p>
            </div>
          ) : null}
          {synthesis?.governanceStrategy ? (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stratégie gouvernance
              </div>
              <p className="text-xs">{synthesis.governanceStrategy}</p>
            </div>
          ) : null}
          {synthesis?.pilotageStrategy ? (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stratégie pilotage
              </div>
              <p className="text-xs">{synthesis.pilotageStrategy}</p>
            </div>
          ) : null}
        </div>

        {/* Forces / faiblesses / risques */}
        <div className="grid gap-3 md:grid-cols-3">
          <Block icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="emerald" title="Points forts" items={strongPoints} />
          <Block icon={<AlertTriangle className="h-3.5 w-3.5" />} tone="rose" title="Points faibles" items={weakPoints} />
          <Block icon={<Shield className="h-3.5 w-3.5" />} tone="amber" title="Risques principaux" items={mainRisks} />
        </div>

        {/* Recommandations prioritaires */}
        {topRecos.length > 0 ? (
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommandations prioritaires
            </h3>
            <ul className="ml-5 list-disc space-y-1 text-sm">
              {topRecos.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        ) : null}

        <Link
          href={`/projects/${id}/atelier/7/deliverable`}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Générer le dossier exportable
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionShell>
  );
}

const TONE = {
  emerald: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
  rose: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  amber: "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20",
} as const;

function Block({
  icon,
  tone,
  title,
  items,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  title: string;
  items: string[];
}) {
  return (
    <div className={cn("rounded-md border p-3", TONE[tone])}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">(aucun élément)</p>
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
