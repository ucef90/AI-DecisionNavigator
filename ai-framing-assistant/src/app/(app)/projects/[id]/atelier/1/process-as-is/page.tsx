import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ProcessStepsEditor } from "@/components/atelier1/editors/process-steps-editor";
import { addProcessStep, deleteProcessStep, updateProcessStep } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ProcessAsIsPage(props: PageProps<"/projects/[id]/atelier/1/process-as-is">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addProcessStep(id, formData); }
  async function onUpdate(stepId: string, formData: FormData) { "use server"; await updateProcessStep(id, stepId, formData); }
  async function onDelete(stepId: string) { "use server"; await deleteProcessStep(id, stepId); }

  const totalDuration = snap.processSteps.reduce((s, x) => s + (x.durationMin ?? 0), 0);
  const manualCount = snap.processSteps.filter((x) => x.mode === "MANUAL").length;

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Workflow AS-IS"
      livrableRef="§13 du livrable atelier 1"
      intent="Cartographier le processus actuel étape par étape — base de tout diagnostic."
      pourquoi={[
        "Sans workflow cartographié, impossible de localiser les irritants.",
        "L'AS-IS révèle les zones MANUAL → opportunités d'automatisation/IA.",
        "Base nécessaire pour la matrice IA vs auto (atelier 2).",
      ]}
      cherche={[
        "Étapes ordonnées (1, 2, 3…).",
        "Mode de chaque étape (MANUAL / SEMI / AUTO).",
        "Acteur, durée, outils utilisés.",
      ]}
    >
      {snap.processSteps.length > 0 ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{snap.processSteps.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Étapes</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{manualCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Manuelles</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{totalDuration}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Min cumulés</div>
          </div>
        </div>
      ) : null}
      <ProcessStepsEditor
        items={snap.processSteps.map((s) => ({
          id: s.id,
          order: s.order,
          name: s.name,
          actor: s.actor,
          mode: s.mode,
          stepType: s.stepType,
          durationMin: s.durationMin,
          tools: s.tools,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
