import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ReformulationPage(props: PageProps<"/projects/[id]/atelier/1/reformulation">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const bn = snap.businessNeed;

  return (
    <SectionShell
      phaseLabel="Phase A — Contexte & reformulation"
      title="Reformulation du besoin"
      livrableRef="§2 du livrable atelier 1"
      intent="Transformer une demande vague (souvent orientée techno) en problème métier mesurable."
      pourquoi={[
        "« Nous voulons de l'IA » n'est pas un besoin métier — c'est une solution imposée.",
        "La reformulation oblige à décrire le PROBLÈME, pas la techno.",
        "Sans reformulation propre, le scoring atelier 4 sera flou.",
      ]}
      cherche={[
        "Une formulation SANS mention de techno (IA, LLM, chatbot…).",
        "Description du problème, de l'impact, de l'objectif mesurable.",
        "Au moins 60 caractères pour donner un sens.",
      ]}
      exemples={{
        mauvais: "Nous voulons mettre en place de l'IA pour automatiser les emails.",
        bon: "Réduire le délai de traitement des emails entrants de 18 à 5 jours et améliorer la classification (passer de 88% à 95% de routage correct).",
      }}
    >
      <div className="space-y-4">
        <DataBlock title="Demande initiale (textuelle)" body={bn?.initialRequest} />
        <DataBlock title="Besoin reformulé (sans techno)" body={bn?.reformulatedNeed} />

        {bn?.solutionBiasDetected ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-50/40 p-3 dark:bg-amber-950/20">
            <Badge variant="outline" className="text-[10px]">⚠ Biais solution détecté</Badge>
            {bn.solutionBiasNotes ? (
              <p className="mt-1 text-xs text-amber-900 dark:text-amber-200">{bn.solutionBiasNotes}</p>
            ) : null}
          </div>
        ) : null}

        <DataBlock title="Résultat attendu" body={bn?.expectedOutcome} />
        <DataBlock title="Utilisateurs concernés" body={bn?.usersImpacted} />
      </div>
    </SectionShell>
  );
}
