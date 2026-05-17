import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { EmptyState } from "@/components/common/data-block";
import { cn } from "@/lib/utils";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";

const COMPLEXITY_LABEL = ["—", "Faible", "Modéré", "Moyen", "Élevé", "Très élevé"];

function bar(v: number | null | undefined) {
  if (!v) return null;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full", v <= 2 ? "bg-emerald-500" : v <= 3 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(v / 5) * 100}%` }} />
    </div>
  );
}

export default async function A2ComplexityPage(props: PageProps<"/projects/[id]/atelier/2/complexity">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const c = snap.complexity;

  return (
    <SectionShell
      phaseLabel="Phase B — Décomposition"
      title="Niveaux de complexité"
      livrableRef="§5 du livrable atelier 2"
      intent="Évaluer la complexité réelle sur 4 axes : workflow, documentaire, décisionnelle, gouvernance."
      pourquoi={[
        "La complexité conditionne le niveau d'intelligence requis.",
        "Workflow ou décisions complexes = humain doit rester central.",
        "Gouvernance complexe = atelier 6 sera dense.",
      ]}
      cherche={[
        "Score 1-5 par axe avec justification.",
        "Cohérence entre les 4 axes (un projet n'est pas « moyen » partout).",
        "Justifications factuelles.",
      ]}
    >
      {!c ? <EmptyState message="Complexité non évaluée." /> : (
        <div className="space-y-3">
          {([
            { key: "workflowComplexity", label: "Complexité workflow", just: c.workflowJustification, val: c.workflowComplexity },
            { key: "documentComplexity", label: "Complexité documentaire", just: c.documentJustification, val: c.documentComplexity },
            { key: "decisionComplexity", label: "Complexité décisionnelle", just: c.decisionJustification, val: c.decisionComplexity },
            { key: "governanceComplexity", label: "Complexité gouvernance", just: c.governanceJustification, val: c.governanceComplexity },
          ] as const).map((axis) => (
            <div key={axis.key} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{axis.label}</span>
                <span className="text-lg font-semibold tabular-nums">{axis.val ?? "—"}/5</span>
              </div>
              {axis.val ? <div className="mt-1.5">{bar(axis.val)}</div> : null}
              <div className="mt-1 text-[10px] text-muted-foreground">{COMPLEXITY_LABEL[axis.val ?? 0]}</div>
              {axis.just ? <p className="mt-2 text-xs">{axis.just}</p> : null}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
