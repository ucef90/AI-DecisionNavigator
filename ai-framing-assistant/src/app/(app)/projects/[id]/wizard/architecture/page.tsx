import { notFound } from "next/navigation";

import { ArchitectureForm } from "@/components/wizard/architecture-form";
import { prisma } from "@/lib/prisma";
import { saveArchitecture } from "@/lib/actions/wizard";
import { jsonArrayToLines } from "@/lib/wizard/progress";

export default async function ArchitectureStep(
  props: PageProps<"/projects/[id]/wizard/architecture">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { architectureAssessment: true },
  });

  if (!project) notFound();
  const a = project.architectureAssessment;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Architecture & workflow</h3>
        <p className="text-sm text-muted-foreground">
          Comment la solution s&apos;insère dans le SI existant, où l&apos;IA
          intervient, où l&apos;humain garde la main, et comment on trace
          les décisions.
        </p>
      </div>

      <ArchitectureForm
        projectId={project.id}
        action={saveArchitecture.bind(null, project.id)}
        defaults={{
          applications: jsonArrayToLines(a?.applications),
          apis: jsonArrayToLines(a?.apis),
          workflowCurrent: a?.workflowCurrent ?? "",
          workflowTarget: a?.workflowTarget ?? "",
          siIntegration: a?.siIntegration ?? "",
          humanValidation: a?.humanValidation ?? true,
          traceability: a?.traceability ?? "",
          existingTools: jsonArrayToLines(a?.existingTools),
        }}
      />
    </div>
  );
}
