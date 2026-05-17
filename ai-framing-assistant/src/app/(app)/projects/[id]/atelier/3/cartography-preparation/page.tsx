import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3CartographyPrepPage(props: PageProps<"/projects/[id]/atelier/3/cartography-preparation">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Préparation cartographie"
      title="Préparation cartographie (atelier 5)"
      livrableRef="§20 du livrable atelier 3"
      intent="Notes guidant la cartographie atelier 5."
      pourquoi={["Liste ce qu'il faudra cartographier en priorité (acteurs, flux, risques).", "Prépare les vues atelier 5."]}
      cherche={["Notes spécifiques au projet."]}
    >
      <div className="space-y-3">
        <DataBlock title="Notes préparation cartographie" body={snap.synthesis?.cartographyPreparationNotes} />
        <Link href={`/projects/${id}/atelier/5/overview`} className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background">
          → Voir l&apos;atelier 5
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </SectionShell>
  );
}
