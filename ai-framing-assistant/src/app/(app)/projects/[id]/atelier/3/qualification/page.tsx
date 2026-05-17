import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3QualificationPage(props: PageProps<"/projects/[id]/atelier/3/qualification">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const q = snap.qualification;

  return (
    <SectionShell
      phaseLabel="Phase A — Lecture du dossier"
      title="Qualification du projet"
      livrableRef="§1 du livrable atelier 3 — récap atelier 1"
      intent="Rappel du contexte projet (direction, sponsor, déclencheur)."
      pourquoi={["Atelier 3 démarre par un rappel de l'atelier 1.", "Évite de partir sur un cadrage flou."]}
      cherche={["Sponsor identifié.", "Déclencheur factuel."]}
    >
      <div className="space-y-3">
        <DataBlock title="Direction" body={q?.directionConcerned} />
        <DataBlock title="Sponsor" body={q?.businessOwner} />
        <DataBlock title="Déclencheur" body={q?.triggerEvent} />
        <DataBlock title="Pourquoi prioritaire" body={q?.priorityReason} />
        <Link href={`/projects/${id}/atelier/1/qualification`} className="inline-block text-xs underline">
          ← Éditer dans l&apos;atelier 1
        </Link>
      </div>
    </SectionShell>
  );
}
