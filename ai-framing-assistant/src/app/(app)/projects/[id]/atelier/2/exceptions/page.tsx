import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { EXCEPTION_HANDLING_LABELS, type ExceptionHandling } from "@/types/atelier2";

const RISK_COLOR = {
  LOW: "border-border bg-muted/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function A2ExceptionsPage(props: PageProps<"/projects/[id]/atelier/2/exceptions">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase E — Gouvernance"
      title="Exceptions"
      livrableRef="§11 du livrable atelier 2"
      intent="Identifier les cas non standards qui pourraient mettre l'IA en échec."
      pourquoi={[
        "Beaucoup d'exceptions = projet plus complexe que prévu.",
        "Chaque exception doit avoir un mode de traitement défini (IA / auto / humain).",
        "Volume d'exceptions élevé → repenser le design (humain-first).",
      ]}
      cherche={[
        "≥ 2 exceptions identifiées.",
        "Fréquence estimée.",
        "Mode de traitement explicite + risque si mal géré.",
      ]}
    >
      <ItemList
        items={snap.exceptions}
        empty="Aucune exception identifiée."
        render={(e) => (
          <div key={e.id} className={`rounded-md border p-3 ${RISK_COLOR[e.riskIfMishandled as keyof typeof RISK_COLOR] ?? "border-border"}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{e.scenario}</p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {e.frequency ? <Badge variant="outline" className="text-[9px]">{e.frequency}</Badge> : null}
                <Badge variant="outline" className="text-[9px]">{EXCEPTION_HANDLING_LABELS[e.handlingProposal as ExceptionHandling] ?? e.handlingProposal}</Badge>
                <Badge variant="outline" className="text-[9px]">Risque {e.riskIfMishandled}</Badge>
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
