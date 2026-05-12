import { notFound } from "next/navigation";

import { BusinessNeedForm } from "@/components/wizard/business-need-form";
import { prisma } from "@/lib/prisma";
import { saveBusinessNeed } from "@/lib/actions/wizard";
import { jsonArrayToLines } from "@/lib/wizard/progress";

export default async function BusinessNeedStep(
  props: PageProps<"/projects/[id]/wizard/business-need">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { businessNeed: true },
  });

  if (!project) notFound();
  const need = project.businessNeed;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Besoin métier</h3>
        <p className="text-sm text-muted-foreground">
          Distingue la solution demandée du problème réel. Identifie les
          irritants concrets et les KPIs actuels que le projet doit améliorer.
        </p>
      </div>

      <BusinessNeedForm
        projectId={project.id}
        action={saveBusinessNeed.bind(null, project.id)}
        defaults={{
          initialRequest: need?.initialRequest ?? "",
          reformulatedNeed: need?.reformulatedNeed ?? "",
          painPoints: jsonArrayToLines(need?.painPoints),
          expectedValue: need?.expectedValue ?? "",
          usersImpacted: need?.usersImpacted ?? "",
          currentKpis: jsonArrayToLines(need?.currentKpis),
          expectedOutcome: need?.expectedOutcome ?? "",
        }}
      />
    </div>
  );
}
