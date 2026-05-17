import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";

export default async function A2QualificationPage(props: PageProps<"/projects/[id]/atelier/2/qualification">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const bn = snap.businessNeed;

  return (
    <SectionShell
      phaseLabel="Phase A — Cadrage du besoin"
      title="Qualification du besoin"
      livrableRef="§1 du livrable atelier 2 — rappel atelier 1"
      intent="Rappeler le besoin reformulé avant de qualifier les technologies."
      pourquoi={[
        "L'atelier 2 ne ré-écrit pas le besoin — il s'appuie sur l'atelier 1.",
        "Repartir du besoin évite le biais techno.",
        "Si le besoin est flou ici, retourne d'abord à l'atelier 1.",
      ]}
      cherche={[
        "Reformulation atelier 1 sans techno.",
        "Cohérence avec ce qui sera qualifié IA/auto/humain dans la matrice.",
      ]}
    >
      <div className="space-y-3">
        <DataBlock title="Besoin reformulé (atelier 1)" body={bn?.reformulatedNeed} />
        <DataBlock title="Résultat attendu" body={bn?.expectedOutcome} />
        <Link href={`/projects/${id}/atelier/1/reformulation`} className="inline-block text-xs underline underline-offset-2">
          ← Modifier dans l&apos;atelier 1
        </Link>
      </div>
    </SectionShell>
  );
}
