import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";
import { DEPENDENCY_STATUS_LABELS, DEPENDENCY_TYPE_LABELS, type DependencyStatus, type DependencyType } from "@/types/atelier2";

export default async function A3SIDepsPage(props: PageProps<"/projects/[id]/atelier/3/si-dependencies">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Compléments d'analyse"
      title="Dépendances SI"
      livrableRef="§10 du livrable atelier 3 — récap atelier 2"
      intent="Consolider les dépendances SI listées dans l'atelier 2."
      pourquoi={["Une dépendance bloquante non négociée = échec POC.", "Visibilité partagée avec DSI à l'atelier 7."]}
      cherche={["Statut explicite par dépendance.", "Bloquantes identifiées et adressées."]}
    >
      <Link href={`/projects/${id}/atelier/2/dependencies`} className="mb-3 inline-block text-xs underline">
        ← Éditer (atelier 2)
      </Link>
      <ItemList
        items={snap.dependencies}
        empty="Aucune dépendance listée."
        render={(d) => (
          <div key={d.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  {d.blocking ? <Badge variant="outline" className="text-[9px]">⚠ Bloquante</Badge> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{DEPENDENCY_TYPE_LABELS[d.dependencyType as DependencyType] ?? d.dependencyType}</Badge>
                <Badge variant="outline" className="text-[9px]">{DEPENDENCY_STATUS_LABELS[d.status as DependencyStatus] ?? d.status}</Badge>
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
