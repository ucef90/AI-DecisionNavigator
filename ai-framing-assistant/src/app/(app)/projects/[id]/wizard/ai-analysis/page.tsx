import { notFound } from "next/navigation";

import { AIAnalysisForm } from "@/components/wizard/ai-analysis-form";
import { prisma } from "@/lib/prisma";
import { saveAIAnalysis } from "@/lib/actions/wizard";
import type { AIApproach } from "@/types";

export default async function AIAnalysisStep(
  props: PageProps<"/projects/[id]/wizard/ai-analysis">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { aiAnalysis: true },
  });

  if (!project) notFound();
  const a = project.aiAnalysis;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">IA ou pas IA ?</h3>
        <p className="text-sm text-muted-foreground">
          Distingue les approches pertinentes. L&apos;IA n&apos;est pas
          toujours la bonne réponse — automatisation, règles, refonte
          classique restent souvent plus robustes et économiques.
        </p>
      </div>

      <AIAnalysisForm
        projectId={project.id}
        action={saveAIAnalysis.bind(null, project.id)}
        defaults={{
          automationRelevant: a?.automationRelevant ?? false,
          ruleEngineRelevant: a?.ruleEngineRelevant ?? false,
          mlRelevant: a?.mlRelevant ?? false,
          llmRelevant: a?.llmRelevant ?? false,
          ragRelevant: a?.ragRelevant ?? false,
          agentRelevant: a?.agentRelevant ?? false,
          hybridRelevant: a?.hybridRelevant ?? false,
          classicRelevant: a?.classicRelevant ?? false,
          recommendedApproach: (a?.recommendedApproach as AIApproach | null) ?? "",
          justification: a?.justification ?? "",
        }}
      />
    </div>
  );
}
