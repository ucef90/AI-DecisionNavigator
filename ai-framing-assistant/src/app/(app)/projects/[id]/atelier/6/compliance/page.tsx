import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ComplianceEditor } from "@/components/atelier6/editors/compliance-editor";
import { ComplianceGauge } from "@/components/visualizations/compliance-gauge";
import { addComplianceItem, deleteComplianceItem, updateComplianceItem } from "@/lib/actions/atelier6";
import { computeComplianceByFramework, loadAtelier6Snapshot } from "@/lib/engines/atelier6";
import { COMPLIANCE_FRAMEWORK_LABELS, type ComplianceFramework } from "@/types/atelier6";

export default async function A6CompliancePage(props: PageProps<"/projects/[id]/atelier/6/compliance">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();
  const byFw = computeComplianceByFramework(snap);

  async function onCreate(formData: FormData) { "use server"; await addComplianceItem(id, formData); }
  async function onUpdate(cid: string, formData: FormData) { "use server"; await updateComplianceItem(id, cid, formData); }
  async function onDelete(cid: string) { "use server"; await deleteComplianceItem(id, cid); }

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

      <ComplianceEditor
        items={snap.complianceItems.map((c) => ({
          id: c.id,
          framework: c.framework,
          requirementCode: c.requirementCode,
          requirement: c.requirement,
          status: c.status,
          evidence: c.evidence,
          responsibleRole: c.responsibleRole,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
