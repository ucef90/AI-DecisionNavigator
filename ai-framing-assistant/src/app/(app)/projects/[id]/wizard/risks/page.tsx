import { notFound } from "next/navigation";

import { RiskAssessmentForm } from "@/components/wizard/risk-assessment-form";
import { prisma } from "@/lib/prisma";
import { saveRiskAssessment } from "@/lib/actions/wizard";
import type { OverallRisk } from "@/types";

export default async function RisksStep(
  props: PageProps<"/projects/[id]/wizard/risks">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { riskAssessment: true },
  });

  if (!project) notFound();
  const r = project.riskAssessment;
  const v = (n: number | null | undefined): number | "" => (n == null ? "" : n);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Analyse des risques</h3>
        <p className="text-sm text-muted-foreground">
          Évalue les 10 axes de risque IA & gouvernance. Plus de la moitié
          des projets IA échouent sur ces points — pas sur la techno.
        </p>
      </div>

      <RiskAssessmentForm
        projectId={project.id}
        action={saveRiskAssessment.bind(null, project.id)}
        defaults={{
          rgpdRisk: v(r?.rgpdRisk),
          sensitiveDataRisk: v(r?.sensitiveDataRisk),
          hallucinationRisk: v(r?.hallucinationRisk),
          biasRisk: v(r?.biasRisk),
          classificationRisk: v(r?.classificationRisk),
          autoDecisionRisk: v(r?.autoDecisionRisk),
          securityRisk: v(r?.securityRisk),
          vendorLockRisk: v(r?.vendorLockRisk),
          adoptionRisk: v(r?.adoptionRisk),
          supervisionRisk: v(r?.supervisionRisk),
          overallRisk: (r?.overallRisk as OverallRisk | null) ?? "",
          mitigationPlan: r?.mitigationPlan ?? "",
        }}
      />
    </div>
  );
}
