import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ComplianceGauge } from "@/components/visualizations/compliance-gauge";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeComplianceByFramework, loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { COMPLIANCE_FRAMEWORK_LABELS, COMPLIANCE_STATUS_COLORS, COMPLIANCE_STATUS_LABELS, type ComplianceFramework, type ComplianceStatus } from "@/types/atelier6";

export default async function A6CompliancePage(props: PageProps<"/projects/[id]/atelier/6/compliance">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const byFw = computeComplianceByFramework(snap);

  return (
    <SectionShell
      phaseLabel="Phase D — Conformité & audit"
      title="Conformité (RGPD, EU AI Act, ISO27001…)"
      livrableRef="§5 du livrable atelier 6"
      intent="Checklist de conformité par framework + jauges de couverture."
      pourquoi={["RGPD + EU AI Act = obligations légales.", "Score < 70% sur RGPD = projet à risque CNIL.", "Atelier 7 final exige conformité claire."]}
      cherche={["≥ 75% sur RGPD.", "Items NON_COMPLIANT explicitement justifiés."]}
    >
      {byFw.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {byFw.map((c) => (
            <ComplianceGauge key={c.framework} value={c.score} label={COMPLIANCE_FRAMEWORK_LABELS[c.framework as ComplianceFramework]} sublabel={`${c.compliant}/${c.total} conformes`} size={120} />
          ))}
        </div>
      ) : null}

      <ItemList
        items={snap.complianceItems}
        empty="Aucun item de conformité saisi."
        render={(c) => (
          <div key={c.id} className={cn("rounded-md border p-3", COMPLIANCE_STATUS_COLORS[c.status as ComplianceStatus])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{COMPLIANCE_FRAMEWORK_LABELS[c.framework as ComplianceFramework] ?? c.framework}</Badge>
                  {c.requirementCode ? <Badge variant="outline" className="text-[9px]">{c.requirementCode}</Badge> : null}
                </div>
                <p className="mt-1 text-sm">{c.requirement}</p>
                {c.evidence ? <p className="mt-1 text-[11px] italic text-muted-foreground">Preuve : {c.evidence}</p> : null}
                {c.responsibleRole ? <p className="mt-1 text-[10px] text-muted-foreground">Responsable : {c.responsibleRole}</p> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{COMPLIANCE_STATUS_LABELS[c.status as ComplianceStatus] ?? c.status}</Badge>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
