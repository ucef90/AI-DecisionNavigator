import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { HV_MODE_LABELS, HV_REASON_TYPE_LABELS, type HumanValidationMode, type HumanValidationReasonType } from "@/types/atelier2";

export default async function A2HumanValidationPage(props: PageProps<"/projects/[id]/atelier/2/human-validation">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const blocking = snap.humanValidations.filter((v) => v.validationMode === "BLOCKING").length;

  return (
    <SectionShell
      phaseLabel="Phase E — Gouvernance"
      title="Validations humaines"
      livrableRef="§10 du livrable atelier 2"
      intent="Identifier les points où l'humain DOIT valider (impossible de déléguer à l'IA)."
      pourquoi={[
        "L'absence de validation humaine sur des décisions IA sensibles = risque CRITIQUE.",
        "BLOCKING : l'IA ne peut pas continuer sans aval humain.",
        "ADVISORY : humain consulté mais non bloquant.",
      ]}
      cherche={[
        "Au moins 1 validation BLOCKING pour les réponses sensibles.",
        "Réglo / données sensibles / cas ambigus = candidats clés.",
        "Validateur identifié par rôle.",
      ]}
    >
      <div className="mb-3 text-sm">
        <strong>{blocking}</strong> validation(s) bloquante(s) sur {snap.humanValidations.length} total.
      </div>
      <ItemList
        items={snap.humanValidations}
        empty="Aucun point de validation humaine défini."
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
