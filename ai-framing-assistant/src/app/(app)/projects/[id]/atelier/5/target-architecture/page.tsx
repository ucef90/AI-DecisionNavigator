import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/data-block";
import { loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function A5TargetArchPage(props: PageProps<"/projects/[id]/atelier/5/target-architecture">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase D — Architecture cible"
      title="Architecture cible (depuis atelier 2)"
      livrableRef="Vue consolidée — depuis atelier 2"
      intent="Reprise visuelle de l'architecture esquissée à l'atelier 2."
      pourquoi={["Évite la re-saisie.", "Sert d'input à la roadmap atelier 7."]}
      cherche={["Composants IA isolés.", "Validations humaines bien placées."]}
    >
      {snap.targetArchNodes.length === 0 ? (
        <>
          <EmptyState message="Architecture cible non définie." />
          <Link href={`/projects/${id}/atelier/2/target-architecture`} className="mt-3 inline-block text-xs underline">
            → Construire dans l&apos;atelier 2
          </Link>
        </>
      ) : (
        <div className="space-y-4">
          <Link href={`/projects/${id}/atelier/2/target-architecture`} className="inline-block text-xs underline">
            ← Éditer dans l&apos;atelier 2
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{snap.targetArchNodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Composants</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{snap.targetArchEdges.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Flux</div>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Composants</h3>
            <div className="flex flex-wrap gap-1.5">
              {snap.targetArchNodes.map((n) => (
                <Badge key={n.id} variant="outline" className="text-xs">{n.label}{n.techCode ? ` (${n.techCode})` : ""}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
