import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock } from "@/components/common/data-block";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3ScoringPrepPage(props: PageProps<"/projects/[id]/atelier/3/scoring-preparation">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Préparation scoring"
      title="Préparation scoring (atelier 4)"
      livrableRef="§19 du livrable atelier 3"
      intent="Notes guidant le scoring atelier 4."
      pourquoi={["Liste les axes à challenger en atelier 4.", "Anticipe les points faibles probables.", "Fait le lien avec la décision finale."]}
      cherche={["Notes spécifiques au projet.", "Axes faibles identifiés."]}
    >
      <div className="space-y-3">
        <DataBlock title="Notes préparation scoring" body={snap.synthesis?.scoringPreparationNotes} />
        <Link href={`/projects/${id}/atelier/4/cockpit`} className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background">
          → Ouvrir le cockpit scoring atelier 4
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </SectionShell>
  );
}
