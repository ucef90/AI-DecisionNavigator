import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ListChecks, AlertTriangle } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { DECISION_LABELS, type Decision } from "@/types";
import {
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  OVERALL_LEVEL_RANGES,
} from "@/types/atelier4";
import {
  aggregateScore,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
  recommendPriority,
} from "@/lib/engines/atelier4";

const DECISION_COLOR: Record<Decision, string> = {
  GO_IA: OVERALL_LEVEL_COLORS.VERY_MATURE,
  POC_IA: OVERALL_LEVEL_COLORS.MATURE,
  AUTOMATION: OVERALL_LEVEL_COLORS.INTERMEDIATE,
  STUDY: OVERALL_LEVEL_COLORS.FRAGILE,
  NO_GO: OVERALL_LEVEL_COLORS.IMMATURE,
};

const DECISION_NEXT_HINT: Record<Decision, string> = {
  GO_IA: "Préparer le passage en industrialisation : équipe, plan, monitoring, comité de pilotage.",
  POC_IA: "Définir le périmètre POC (1 cas d'usage à fort impact / faible risque), KPI cible, jalon décisionnel.",
  AUTOMATION: "Rediriger vers l'équipe automatisation (BPM/RPA/APIs) — pas de POC IA.",
  STUDY: "Lancer une étude complémentaire ciblée sur les axes ≤ 2 (data, gouvernance, faisabilité…).",
  NO_GO: "Documenter la décision, archiver le projet, communiquer aux parties prenantes les raisons.",
};

// §18 Décision recommandée — vue argumentée, complète, et exportable
// vers le COPIL. Affiche la reco du moteur + les overrides éventuels
// saisis dans la section synthèse, + le top des actions à mener.
export default async function RecommendationSectionPage(
  props: PageProps<"/projects/[id]/atelier/4/recommendation">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const results = computeAutoScorecard(snap);
  const { overallScore, overallLevel } = aggregateScore(results);
  const reco = recommendDecision(snap, results);
  const priority = recommendPriority(snap, results);

  // Si une décision a été éditée en synthèse, on l'affiche en tête
  const overrideDecision = snap.a4Synthesis?.recommendedDecision as Decision | null;
  const finalDecision: Decision = overrideDecision ?? reco.decision;
  const finalRationale = snap.a4Synthesis?.decisionRationale ?? reco.rationale;

  return (
    <SectionShell
      phaseLabel="Phase D — Décision recommandée"
      title="Décision recommandée"
      livrableRef="§18 du livrable atelier 4"
      intent="La synthèse de toutes les analyses → une décision argumentée et des actions à mener."
      pourquoi={[
        "C'est la sortie principale du scoring : ce qui sera présenté en COPIL.",
        "La décision doit être ARGUMENTÉE — pas un simple verdict.",
        "Le moteur croise scoring, profil atelier 2, conformité, risques bloquants pour proposer la décision la plus défendable.",
      ]}
      cherche={[
        "Une décision cohérente avec les données collectées.",
        "Un rationnel chiffré (score, axes critiques, profil).",
        "Une suite logique : que fait-on concrètement après cette décision ?",
        "Des recommandations actionnables pour le commanditaire.",
      ]}
      pieges={[
        "GO IA sur un projet immature : risque d'échec, perte de crédibilité.",
        "STUDY à chaque fois : on n'avance jamais sans engagement.",
        "Décision contraire au profil atelier 2 : incohérence interne, le moteur le détecte.",
      ]}
      aside={
        <div className="space-y-3">
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Score global
            </div>
            <div className="text-2xl font-semibold tabular-nums">{overallScore}/100</div>
            <div
              className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${OVERALL_LEVEL_COLORS[overallLevel]}`}
            >
              {OVERALL_LEVEL_LABELS[overallLevel]}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {OVERALL_LEVEL_RANGES[overallLevel]}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Priorité auto-suggérée
            </div>
            <div className="mt-1 text-sm font-semibold">{priority.level}</div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              {priority.rationale}
            </p>
            <Link
              href={`/projects/${id}/atelier/4/priority`}
              className="mt-2 inline-block text-[11px] font-medium underline underline-offset-2"
            >
              Définir / éditer la priorité →
            </Link>
          </div>
        </div>
      }
    >
      {/* Hero décision */}
      <div className={`rounded-xl border p-6 ${DECISION_COLOR[finalDecision]}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Décision recommandée
            </div>
            <div className="mt-1 text-3xl font-bold">{DECISION_LABELS[finalDecision]}</div>
            {overrideDecision && overrideDecision !== reco.decision ? (
              <p className="mt-1 text-[11px] italic opacity-80">
                Override CDP — moteur suggérait : {DECISION_LABELS[reco.decision]}
              </p>
            ) : (
              <p className="mt-1 text-[11px] italic opacity-80">
                Calculée par le moteur depuis le scoring.
              </p>
            )}
          </div>
          <Link
            href={`/projects/${id}/atelier/4/synthesis`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-foreground/30 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground hover:border-foreground"
          >
            Éditer dans la synthèse
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 rounded-md border border-foreground/20 bg-background/60 p-3 text-sm leading-relaxed text-foreground">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rationnel
          </div>
          {finalRationale}
        </div>
      </div>

      {/* Next steps */}
      <div className="mt-5 rounded-md border border-dashed border-foreground/20 bg-muted/30 p-4">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          Étape suivante
        </div>
        <p className="text-sm">{DECISION_NEXT_HINT[finalDecision]}</p>
      </div>

      {/* Forces / faiblesses / actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Block
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          title="Points forts"
          items={reco.strongPoints}
          empty="Aucun axe ≥ 4."
        />
        <Block
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          tone="rose"
          title="Points faibles"
          items={reco.weakPoints}
          empty="Tous les axes ≥ 3."
        />
        <Block
          icon={<ListChecks className="h-3.5 w-3.5" />}
          tone="sky"
          title="Top recommandations"
          items={reco.topRecommendations}
          empty="Pas de recommandation déclenchée."
        />
      </div>

      {/* Decision matrix reference */}
      <details className="mt-6 rounded-md border border-border bg-background p-3 text-sm">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Aide à l&apos;interprétation
        </summary>
        <div className="mt-3 space-y-2 text-xs">
          {(["GO_IA", "POC_IA", "AUTOMATION", "STUDY", "NO_GO"] as const).map((d) => (
            <div key={d} className="flex items-start gap-2">
              <Badge variant="outline" className={`shrink-0 text-[10px] ${DECISION_COLOR[d]}`}>
                {DECISION_LABELS[d]}
              </Badge>
              <span className="text-muted-foreground">{DECISION_NEXT_HINT[d]}</span>
            </div>
          ))}
        </div>
      </details>
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
