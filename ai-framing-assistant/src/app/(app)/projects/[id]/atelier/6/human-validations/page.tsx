import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { HV_MODE_LABELS, HV_REASON_TYPE_LABELS, type HumanValidationMode, type HumanValidationReasonType } from "@/types/atelier2";

export default async function A6HVPage(props: PageProps<"/projects/[id]/atelier/6/human-validations">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const blocking = snap.humanValidations.filter((v) => v.validationMode === "BLOCKING").length;

  return (
    <SectionShell
      phaseLabel="Phase B — Rôles & validations"
      title="Validations humaines"
      livrableRef="§2 du livrable atelier 6"
      intent="Reprise validations humaines de l'atelier 2 — consolidation pour gouvernance."
      pourquoi={["L'humain garde le dernier mot sur les décisions sensibles.", "BLOCKING = l'IA ne peut PAS continuer sans aval."]}
      cherche={["≥ 1 validation bloquante.", "Validateurs par rôle nommés."]}
    >
      <Link href={`/projects/${id}/atelier/2/human-validation`} className="mb-3 inline-block text-xs underline">← Éditer (atelier 2)</Link>
      <div className="mb-3 text-sm"><strong>{blocking}</strong> validation(s) bloquante(s) sur {snap.humanValidations.length}.</div>
      <ItemList
        items={snap.humanValidations}
        empty="Aucune validation humaine définie."
        render={(v) => (
          <div key={v.id} className={cn("rounded-md border p-3", v.validationMode === "BLOCKING" ? "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20" : "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{v.taskName}</div>
                <p className="mt-1 text-xs">{v.reason}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{HV_REASON_TYPE_LABELS[v.reasonType as HumanValidationReasonType] ?? v.reasonType}</Badge>
                <Badge variant="outline" className="text-[9px]">{HV_MODE_LABELS[v.validationMode as HumanValidationMode] ?? v.validationMode}</Badge>
              </div>
            </div>
            {v.validatorRole ? <p className="mt-2 text-[11px] italic text-muted-foreground">Validateur : {v.validatorRole}</p> : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
