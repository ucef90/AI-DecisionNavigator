import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { DEPENDENCY_STATUS_LABELS, DEPENDENCY_TYPE_LABELS, type DependencyStatus, type DependencyType } from "@/types/atelier2";

const STATUS_COLOR = {
  AVAILABLE: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  TO_BUILD: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  TO_NEGOTIATE: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  UNKNOWN: "border-border bg-muted/20",
} as const;

export default async function A2DependenciesPage(props: PageProps<"/projects/[id]/atelier/2/dependencies">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const blocking = snap.dependencies.filter((d) => d.blocking).length;

  return (
    <SectionShell
      phaseLabel="Phase E — Gouvernance"
      title="Dépendances SI / techniques"
      livrableRef="§12 du livrable atelier 2"
      intent="Identifier les SI, APIs, données dont le projet dépend pour fonctionner."
      pourquoi={[
        "Une dépendance bloquante non identifiée = projet qui plante en cours.",
        "Statut TO_NEGOTIATE = chemin critique à sécuriser tôt.",
        "Visibilité indispensable pour la DSI atelier 7.",
      ]}
      cherche={[
        "Toutes les dépendances clés listées.",
        "Statut explicite (AVAILABLE / TO_BUILD / TO_NEGOTIATE / UNKNOWN).",
        "Flag « bloquant » pour les vrais points critiques.",
      ]}
    >
      {blocking > 0 ? (
        <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
          ⚠ <strong>{blocking} dépendance(s) bloquante(s)</strong> — à sécuriser avant POC.
        </div>
      ) : null}
      <ItemList
        items={snap.dependencies}
        empty="Aucune dépendance listée."
        render={(d) => (
          <div key={d.id} className={cn("rounded-md border p-3", STATUS_COLOR[d.status as DependencyStatus])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  {d.blocking ? <Badge variant="outline" className="border-rose-500/40 text-[9px] text-rose-700 dark:text-rose-300">⚠ Bloquante</Badge> : null}
                </div>
                {d.notes ? <p className="mt-1 text-xs">{d.notes}</p> : null}
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
