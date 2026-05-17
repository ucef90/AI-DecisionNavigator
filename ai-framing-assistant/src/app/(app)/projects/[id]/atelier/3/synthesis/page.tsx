import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, ListBlock, safeJSON } from "@/components/common/data-block";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3SynthesisPage(props: PageProps<"/projects/[id]/atelier/3/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const s = snap.synthesis;

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse"
      title="Synthèse finale cadrage IA"
      livrableRef="§21 du livrable atelier 3"
      intent="Synthèse exécutive du cadrage : besoin réel, maturité, faisabilité, recommandation."
      pourquoi={["Page COPIL résumé.", "Conditionne le passage au scoring atelier 4."]}
      cherche={["Recommandation finale claire.", "Risques et contraintes listés."]}
    >
      {!s ? <EmptyState message="Synthèse non rédigée." /> : (
        <div className="space-y-3">
          <DataBlock title="Besoin réel" body={s.realNeed} />
          <div className="grid gap-3 sm:grid-cols-3">
            <DataBlock title="Maturité" body={s.maturityLevel} />
            <DataBlock title="Complexité" body={s.complexityLevel} />
            <DataBlock title="Faisabilité globale" body={s.feasibilityGlobal} />
          </div>
          <DataBlock title="Niveau gouvernance" body={s.governanceLevel} />
          <ListBlock title="Risques principaux" items={safeJSON<string[]>(s.mainRisks, [])} />
          <ListBlock title="Contraintes principales" items={safeJSON<string[]>(s.mainConstraints, [])} />
          <DataBlock title="Recommandation finale" body={s.finalRecommendation} />
        </div>
      )}
    </SectionShell>
  );
}
