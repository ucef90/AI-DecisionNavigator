import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deriveMaturity, loadAtelier3Snapshot } from "@/lib/engines/atelier3";

function bar(v: number) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full", v < 2.5 ? "bg-rose-500" : v < 4 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${(v / 5) * 100}%` }} />
    </div>
  );
}

export default async function A3MaturityPage(props: PageProps<"/projects/[id]/atelier/3/maturity">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const m = snap.maturity;
  const derived = deriveMaturity(snap);

  return (
    <SectionShell
      phaseLabel="Phase C — Maturité & faisabilité"
      title="Maturité projet"
      livrableRef="§14 du livrable atelier 3"
      intent="Auto-évaluation maturité (CDP) + maturité dérivée (moteur) — révèle les écarts de perception."
      pourquoi={["Auto-éval seule = subjective. Moteur seul = aveugle au contexte.", "L'écart auto/dérivé révèle les angles morts.", "Score atelier 4 utilise les 2."]}
      cherche={["Tous les axes auto-évalués (1-5).", "Comparaison avec la maturité dérivée.", "Notes d'auto-évaluation expliquées."]}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-foreground/15 bg-muted/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Maturité dérivée (moteur)</div>
          <div className="mt-1 text-lg font-semibold">{derived.overall}</div>
        </div>
        <div className="rounded-md border border-foreground/15 bg-muted/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-déclarée</div>
          <div className="mt-1 text-lg font-semibold">{m ? "OUI" : "Non remplie"}</div>
        </div>
      </div>

      {!m ? <EmptyState message="Auto-évaluation non remplie." /> : (
        <div className="space-y-3">
          {([
            { label: "Clarté besoin", auto: m.needClarity, derived: derived.needClarity },
            { label: "Connaissance workflow", auto: m.workflowKnowledge, derived: derived.workflowKnowledge },
            { label: "Maturité data", auto: m.dataMaturity, derived: derived.dataMaturity },
            { label: "Gouvernance", auto: m.governanceMaturity, derived: derived.governanceMaturity },
            { label: "Alignement stakeholders", auto: m.stakeholderAlignment, derived: derived.stakeholderAlignment },
            { label: "Réalisme", auto: m.realismLevel, derived: derived.realismLevel },
          ]).map((a) => (
            <div key={a.label} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{a.label}</span>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="text-[9px]">Auto {a.auto ?? "—"}/5</Badge>
                  <Badge variant="outline" className="text-[9px]">Moteur {a.derived}/5</Badge>
                </div>
              </div>
              {a.auto ? <div className="mt-1.5">{bar(a.auto)}</div> : null}
            </div>
          ))}
          <DataBlock title="Notes d'auto-évaluation" body={m.selfAssessmentNotes} />
        </div>
      )}
    </SectionShell>
  );
}
