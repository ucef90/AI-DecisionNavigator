import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, ListBlock, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";
import { EU_AI_ACT_TIER_LABELS, type EuAiActTier } from "@/types/atelier3";

const TIER_COLOR = {
  NONE: "border-border bg-muted/20",
  MINIMAL: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  LIMITED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  UNACCEPTABLE: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function A3RegulatoryPage(props: PageProps<"/projects/[id]/atelier/3/regulatory">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const r = snap.regulatoryAnalysis;

  return (
    <SectionShell
      phaseLabel="Phase B — Compléments d'analyse"
      title="Analyse réglementaire"
      livrableRef="§11 du livrable atelier 3"
      intent="RGPD, EU AI Act, obligations légales — pré-requis avant POC IA."
      pourquoi={["EU AI Act : applicable. Tier mal classé = projet rejeté.", "RGPD : minimisation, droits personnes, durée conservation.", "DPO non consulté = risque CRITIQUE si données personnelles."]}
      cherche={["DPO consulté.", "EU AI Act tier défini.", "Obligations légales listées."]}
    >
      {!r ? <EmptyState message="Analyse réglementaire non faite." /> : (
        <div className="space-y-4">
          <div className={cn("rounded-md border p-4", TIER_COLOR[r.euAiActTier as EuAiActTier])}>
            <div className="text-[10px] uppercase tracking-wider opacity-80">EU AI Act</div>
            <div className="mt-1 text-lg font-semibold">{EU_AI_ACT_TIER_LABELS[r.euAiActTier as EuAiActTier] ?? r.euAiActTier}</div>
            {r.euAiActJustification ? <p className="mt-1 text-xs">{r.euAiActJustification}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">RGPD</h3>
              <div className="flex flex-wrap gap-1.5">
                {r.rgpdApplicable ? <Badge variant="outline">Applicable</Badge> : null}
                {r.sensitiveDataConcerned ? <Badge variant="outline" className="border-rose-500/40">Données sensibles</Badge> : null}
                {r.dpoConsulted ? <Badge variant="outline" className="border-emerald-500/40">✓ DPO consulté</Badge> : <Badge variant="outline" className="border-amber-500/40">⚠ DPO non consulté</Badge>}
                {r.auditRequired ? <Badge variant="outline">Audit requis</Badge> : null}
                {r.cnilConsultation ? <Badge variant="outline">Consultation CNIL</Badge> : null}
              </div>
            </div>
            <ListBlock title="Obligations légales" items={safeJSON<string[]>(r.legalObligations, [])} />
          </div>

          <DataBlock title="Notes" body={r.notes} />
        </div>
      )}
    </SectionShell>
  );
}
