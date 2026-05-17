import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ValuePage(props: PageProps<"/projects/[id]/atelier/1/value">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const bn = snap.businessNeed;

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="Valeur attendue"
      livrableRef="§12 du livrable atelier 1"
      intent="Décrire la valeur métier attendue : gain temps, qualité, satisfaction, conformité, pilotage."
      pourquoi={[
        "La valeur attendue justifie l'investissement projet.",
        "Sans valeur claire, le scoring atelier 4 (axe valeur métier) sera faible.",
        "C'est le pitch sponsor : « voici pourquoi ça en vaut la peine ».",
      ]}
      cherche={[
        "Une description sur plusieurs axes (ops, qualité, expérience, pilotage).",
        "Chiffrage si possible (ROI, ETP libéré, NPS visé).",
        "Cohérence avec les objectifs et KPI cibles.",
      ]}
    >
      <div className="space-y-3">
        <DataBlock title="Valeur métier attendue" body={bn?.expectedValue} />
        <DataBlock title="Résultat attendu (chiffré)" body={bn?.expectedOutcome} />
        <DataBlock title="Énoncé du problème métier (synthèse)" body={bn?.problemStatement} />
        <DataBlock title="Résumé de la valeur attendue" body={bn?.expectedResultSummary} />
      </div>
    </SectionShell>
  );
}
