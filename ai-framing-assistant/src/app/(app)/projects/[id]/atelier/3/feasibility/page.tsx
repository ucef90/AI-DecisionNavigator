import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, ListBlock, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";
import { A3_OVERALL_FEASIBILITY_LABELS, type A3OverallFeasibility } from "@/types/atelier3";

function bar(v: number | null | undefined) {
  if (!v) return null;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full", v <= 2 ? "bg-rose-500" : v <= 3 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${(v / 5) * 100}%` }} />
    </div>
  );
}

export default async function A3FeasibilityPage(props: PageProps<"/projects/[id]/atelier/3/feasibility">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const f = snap.feasibility;

  return (
    <SectionShell
      phaseLabel="Phase C — Maturité & faisabilité"
      title="Faisabilité globale"
      livrableRef="§15 du livrable atelier 3"
      intent="Évaluer faisabilité sur 5 axes : technique, organisationnelle, réglo, ressources, données."
      pourquoi={["Le maillon faible détermine la faisabilité globale.", "Atelier 4 (axe faisabilité) consomme directement ces scores."]}
      cherche={["Tous les axes scorés (1-5).", "Verdict global cohérent.", "Bloquants et leviers listés."]}
    >
      {!f ? <EmptyState message="Faisabilité non évaluée." /> : (
        <div className="space-y-3">
          {f.overallFeasibility ? (
            <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
              <Badge variant="outline" className="text-[10px]">Verdict global</Badge>
              <div className="mt-1 text-lg font-semibold">{A3_OVERALL_FEASIBILITY_LABELS[f.overallFeasibility as A3OverallFeasibility] ?? f.overallFeasibility}</div>
            </div>
          ) : null}

          {([
            { label: "Technique", val: f.technicallyFeasible },
            { label: "Organisationnelle", val: f.organizationallyFeasible },
            { label: "Réglementaire", val: f.regulatorilyFeasible },
            { label: "Ressources", val: f.resourcesAvailable },
            { label: "Données", val: f.dataAvailable },
          ]).map((a) => (
            <div key={a.label} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold">{a.label}</span><span className="font-semibold tabular-nums">{a.val ?? "—"}/5</span></div>
              {a.val ? <div className="mt-1.5">{bar(a.val)}</div> : null}
            </div>
          ))}

          <div className="grid gap-3 sm:grid-cols-2">
            <ListBlock title="Bloquants" items={safeJSON<string[]>(f.blockingFactors, [])} />
            <ListBlock title="Leviers" items={safeJSON<string[]>(f.enablers, [])} />
          </div>
          <DataBlock title="Notes" body={f.notes} />
        </div>
      )}
    </SectionShell>
  );
}
