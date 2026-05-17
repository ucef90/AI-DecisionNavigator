import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { EmptyState } from "@/components/common/data-block";
import { cn } from "@/lib/utils";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

function bar(v: number | null | undefined) {
  if (!v) return null;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full", v <= 2 ? "bg-emerald-500" : v <= 3 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(v / 5) * 100}%` }} />
    </div>
  );
}

export default async function A3ComplexityPage(props: PageProps<"/projects/[id]/atelier/3/complexity">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const c = snap.complexity;

  return (
    <SectionShell
      phaseLabel="Phase C — Maturité & faisabilité"
      title="Niveaux de complexité"
      livrableRef="§13 du livrable atelier 3 — récap atelier 2"
      intent="Vue consolidée des 4 axes de complexité."
      pourquoi={["Conditionne le choix d'architecture cible.", "Alimente le scoring atelier 4 (axe complexité)."]}
      cherche={["Tous les axes scorés.", "Justifications factuelles."]}
    >
      <Link href={`/projects/${id}/atelier/2/complexity`} className="mb-3 inline-block text-xs underline">← Éditer (atelier 2)</Link>
      {!c ? <EmptyState message="Complexité non évaluée." /> : (
        <div className="space-y-3">
          {([
            { label: "Workflow", val: c.workflowComplexity, just: c.workflowJustification },
            { label: "Documentaire", val: c.documentComplexity, just: c.documentJustification },
            { label: "Décisionnelle", val: c.decisionComplexity, just: c.decisionJustification },
            { label: "Gouvernance", val: c.governanceComplexity, just: c.governanceJustification },
          ]).map((a) => (
            <div key={a.label} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold">{a.label}</span><span className="font-semibold tabular-nums">{a.val ?? "—"}/5</span></div>
              {a.val ? <div className="mt-1.5">{bar(a.val)}</div> : null}
              {a.just ? <p className="mt-2 text-xs">{a.just}</p> : null}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
