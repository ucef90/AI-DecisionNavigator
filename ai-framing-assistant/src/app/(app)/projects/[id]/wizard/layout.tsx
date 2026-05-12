import Link from "next/link";
import { notFound } from "next/navigation";

import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { prisma } from "@/lib/prisma";
import { computeProgress, progressRatio } from "@/lib/wizard/progress";

export default async function WizardLayout(
  props: LayoutProps<"/projects/[id]/wizard">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      finalDecision: true,
      businessNeed: { select: { id: true } },
      aiAnalysis: { select: { id: true } },
      dataAssessment: { select: { id: true } },
      architectureAssessment: { select: { id: true } },
      riskAssessment: { select: { id: true } },
      scoring: { select: { id: true } },
      _count: { select: { deliverables: true } },
    },
  });

  if (!project) notFound();

  const progress = computeProgress({
    businessNeed: !!project.businessNeed,
    aiAnalysis: !!project.aiAnalysis,
    dataAssessment: !!project.dataAssessment,
    architectureAssessment: !!project.architectureAssessment,
    riskAssessment: !!project.riskAssessment,
    scoring: !!project.scoring,
    decision: !!project.finalDecision,
    deliverables: project._count.deliverables > 0,
  });
  const ratio = progressRatio(progress);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projets
          </Link>
          <span>/</span>
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
          <span>/</span>
          <span>Cadrage</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Cadrage IA
            </h2>
            <p className="text-sm text-muted-foreground">
              {project.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums">
              {Math.round(ratio * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">complété</div>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>

      <WizardStepper projectId={project.id} progress={progress} />

      <div>{props.children}</div>
    </div>
  );
}
