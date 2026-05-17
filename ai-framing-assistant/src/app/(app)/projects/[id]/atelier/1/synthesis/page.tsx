import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, StatRow } from "@/components/common/data-block";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function SynthesisPage(props: PageProps<"/projects/[id]/atelier/1/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const bn = snap.businessNeed;

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Synthèse du besoin réel"
      livrableRef="§11 du livrable atelier 1"
      intent="Synthèse exécutive : problème, impact, objectifs, résultat attendu, maturité."
      pourquoi={[
        "C'est la page qui sera lue en COPIL (résumé exécutif).",
        "Elle agrège tout ce qui a été collecté dans cet atelier.",
        "Sert d'entrée pour les ateliers 2 → 7.",
      ]}
      cherche={[
        "Une formulation claire et concise (pas de jargon).",
        "Maturité auto-évaluée par le CDP.",
        "Cohérence avec les KPI baseline et les objectifs.",
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <StatRow label="Acteurs" value={snap.actors.length} />
          <StatRow label="Irritants" value={snap.irritants.length} />
          <StatRow label="Objectifs" value={snap.objectives.length} />
          <StatRow label="KPI mesurés" value={snap.kpis.filter((k) => k.measureStatus === "MEASURED").length} />
        </div>

        <DataBlock title="Énoncé du problème métier" body={bn?.problemStatement ?? bn?.reformulatedNeed} />
        <DataBlock title="Impact actuel résumé" body={bn?.currentImpactSummary} />
        <DataBlock title="Résultat attendu (résumé)" body={bn?.expectedResultSummary ?? bn?.expectedOutcome} />
        <DataBlock title="Valeur métier attendue" body={bn?.expectedValue} />
        <DataBlock title="Niveau de maturité auto-déclaré" body={bn?.declaredMaturityLevel} />
      </div>
    </SectionShell>
  );
}
