import { notFound } from "next/navigation";

import { DataAssessmentForm } from "@/components/wizard/data-assessment-form";
import { prisma } from "@/lib/prisma";
import { saveDataAssessment } from "@/lib/actions/wizard";
import { jsonArrayToLines } from "@/lib/wizard/progress";
import type { Sensitivity } from "@/types";

function parseDataTypes(raw: string | null | undefined) {
  if (!raw) return { structured: false, unstructured: false };
  try {
    const parsed = JSON.parse(raw);
    return {
      structured: !!parsed?.structured,
      unstructured: !!parsed?.unstructured,
    };
  } catch {
    return { structured: false, unstructured: false };
  }
}

export default async function DataStep(
  props: PageProps<"/projects/[id]/wizard/data">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { dataAssessment: true },
  });

  if (!project) notFound();
  const d = project.dataAssessment;
  const types = parseDataTypes(d?.dataTypes);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Analyse data</h3>
        <p className="text-sm text-muted-foreground">
          La maturité data est l&apos;axe de scoring le plus discriminant.
          Un projet IA sans données accessibles et propres ne décollera pas.
        </p>
      </div>

      <DataAssessmentForm
        projectId={project.id}
        action={saveDataAssessment.bind(null, project.id)}
        defaults={{
          dataSources: jsonArrayToLines(d?.dataSources),
          structured: types.structured,
          unstructured: types.unstructured,
          history: d?.history ?? "",
          quality: d?.quality ?? "",
          availability: d?.availability ?? "",
          silos: d?.silos ?? "",
          personalData: d?.personalData ?? false,
          sensitivity: (d?.sensitivity as Sensitivity | null) ?? "",
          rgpdConstraints: d?.rgpdConstraints ?? "",
        }}
      />
    </div>
  );
}
