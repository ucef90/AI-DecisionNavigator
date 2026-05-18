import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { FinalDecisionEditor } from "@/components/atelier7/editors/final-decision-editor";
import { safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveA7Synthesis } from "@/lib/actions/atelier7";
import { DECISION_LABELS, type Decision } from "@/types";
import { SPONSOR_DECISION_LABELS, type SponsorDecision } from "@/types/atelier7";
import {
  computeFinalDecision,
  computeGlobalProjectScore,
  loadAtelier7Snapshot,
} from "@/lib/engines/atelier7";

const DECISION_COLOR: Record<Decision, string> = {
  GO_IA: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  POC_IA: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  AUTOMATION: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  STUDY: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  NO_GO: "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
};

export default async function FinalDecisionPage(
  props: PageProps<"/projects/[id]/atelier/7/final-decision">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const globalScore = computeGlobalProjectScore(snap);
  const decision = computeFinalDecision(snap);
  const s = snap.synthesis;
  const finalDec = (s?.finalDecision as Decision | null) ?? decision.decision;
  const sponsorDec = s?.sponsorDecision as SponsorDecision | null;

  async function action(formData: FormData) { "use server"; await saveA7Synthesis(id, formData); }

  return (
    <SectionShell
      phaseLabel="Phase E — Décision finale"
      title="Décision finale IA"
      livrableRef="§8 du livrable atelier 7"
      intent="Décision argumentée présentée au sponsor, avec score global et validation."
      pourquoi={[
        "C'est l'arbitrage final qui engage le projet en POC, MVP ou industrialisation.",
        "La décision doit être DOCUMENTÉE — pas un verdict isolé.",
        "Sponsor sign-off = passage du cadrage à l'exécution.",
      ]}
      cherche={[
        "Cohérence décision vs score (un GO_IA sur score 40/100 = incohérence).",
        "Rationnel chiffré et factuel.",
        "Validation explicite du sponsor (OK / KO / IN_REVIEW).",
      ]}
    >
      <div className={cn("mb-4 rounded-xl border p-5", DECISION_COLOR[finalDec])}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Décision actuelle</div>
            <div className="mt-1 text-2xl font-bold">{DECISION_LABELS[finalDec]}</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <Badge variant="outline" className="bg-background/80">Score global {globalScore.overall}/100</Badge>
              <Badge variant="outline" className="bg-background/80">Scoring {globalScore.scoringScore}</Badge>
              <Badge variant="outline" className="bg-background/80">Gouv {globalScore.governanceScore}</Badge>
              <Badge variant="outline" className="bg-background/80">Vision {globalScore.visionScore}</Badge>
              {sponsorDec ? <Badge variant="outline" className="bg-background/80">Sponsor : {SPONSOR_DECISION_LABELS[sponsorDec]}</Badge> : null}
            </div>
          </div>
        </div>
      </div>

      <FinalDecisionEditor
        defaults={{
          finalDecision: (s?.finalDecision as Decision | null) ?? "",
          decisionRationale: s?.decisionRationale ?? "",
          strongPointsText: safeJSON<string[]>(s?.strongPoints, []).join("\n"),
          weakPointsText: safeJSON<string[]>(s?.weakPoints, []).join("\n"),
          mainRisksText: safeJSON<string[]>(s?.mainRisks, []).join("\n"),
          roadmapSummary: s?.roadmapSummary ?? "",
          industrializationStrategy: s?.industrializationStrategy ?? "",
          governanceStrategy: s?.governanceStrategy ?? "",
          pilotageStrategy: s?.pilotageStrategy ?? "",
          sponsorDecision: (s?.sponsorDecision as SponsorDecision | null) ?? "",
          sponsorName: s?.sponsorName ?? "",
        }}
        suggested={{
          decision: decision.decision,
          rationale: decision.rationale,
          strongPoints: decision.strongPoints,
          weakPoints: decision.weakPoints,
          mainRisks: decision.mainRisks,
        }}
        action={action}
      />

      <Link
        href={`/projects/${id}/atelier/7/deliverable`}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Générer le dossier exportable
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SectionShell>
  );
}
