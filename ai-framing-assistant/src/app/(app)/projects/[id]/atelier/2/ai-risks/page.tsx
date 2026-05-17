import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { EmptyState } from "@/components/common/data-block";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { cn } from "@/lib/utils";

const RISK_LABEL = ["—", "Faible", "Modéré", "Moyen", "Élevé", "Critique"];

function bar(v: number | null | undefined) {
  if (!v) return null;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full", v <= 2 ? "bg-emerald-500" : v <= 3 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(v / 5) * 100}%` }} />
    </div>
  );
}

export default async function A2AIRisksPage(props: PageProps<"/projects/[id]/atelier/2/ai-risks">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const r = snap.riskAssessment;

  return (
    <SectionShell
      phaseLabel="Phase E — Gouvernance"
      title="Risques IA spécifiques"
      livrableRef="§13 du livrable atelier 2 — RiskAssessment existant"
      intent="Évaluer les risques IA spécifiques au projet (1-5 par axe)."
      pourquoi={[
        "Sans évaluation risques IA, on déploie aveuglément.",
        "Atelier 4 (scoring risques) et atelier 6 (cockpit risques) consomment ces données.",
        "Hallucination + biais + classification = risques métier majeurs.",
      ]}
      cherche={[
        "Tous les axes IA scorés (hallucination, biais, classification, supervision).",
        "Plan de mitigation pour les axes ≥ 4.",
      ]}
    >
      {!r ? (
        <>
          <EmptyState message="Aucune évaluation risques." />
          <Link href={`/projects/${id}/wizard/risks`} className="mt-3 inline-block text-xs underline">
            → Compléter dans le wizard risques
          </Link>
        </>
      ) : (
        <div className="space-y-3">
          {([
            { label: "RGPD", val: r.rgpdRisk },
            { label: "Données sensibles", val: r.sensitiveDataRisk },
            { label: "Hallucination", val: r.hallucinationRisk },
            { label: "Biais", val: r.biasRisk },
            { label: "Erreur classification", val: r.classificationRisk },
            { label: "Décision automatisée", val: r.autoDecisionRisk },
            { label: "Sécurité", val: r.securityRisk },
            { label: "Adoption", val: r.adoptionRisk },
            { label: "Supervision insuffisante", val: r.supervisionRisk },
          ]).map((axis) => (
            <div key={axis.label} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{axis.label}</span>
                <span className="text-sm font-semibold tabular-nums">{axis.val ?? "—"}/5</span>
              </div>
              {axis.val ? <div className="mt-1.5">{bar(axis.val)}</div> : null}
              <div className="mt-1 text-[10px] text-muted-foreground">{RISK_LABEL[axis.val ?? 0]}</div>
            </div>
          ))}

          {r.mitigationPlan ? (
            <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan de mitigation</h3>
              <p className="text-sm whitespace-pre-wrap">{r.mitigationPlan}</p>
            </div>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
