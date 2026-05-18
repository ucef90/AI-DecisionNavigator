import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { IndustrializationEditor } from "@/components/atelier7/editors/industrialization-editor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addIndustrializationStep, deleteIndustrializationStep, updateIndustrializationStep } from "@/lib/actions/atelier7";
import { computeIndustrializationReadiness, loadAtelier7Snapshot } from "@/lib/engines/atelier7";
import { INDUSTRIALIZATION_STAGES, INDUSTRIALIZATION_STAGE_LABELS, type IndustrializationStage } from "@/types/atelier7";

export default async function IndustrializationSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/industrialization">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addIndustrializationStep(id, formData); }
  async function onUpdate(sid: string, formData: FormData) { "use server"; await updateIndustrializationStep(id, sid, formData); }
  async function onDelete(sid: string) { "use server"; await deleteIndustrializationStep(id, sid); }

  const readiness = computeIndustrializationReadiness(snap);

  return (
    <SectionShell
      phaseLabel="Phase D — Industrialisation"
      title="Stratégie d'industrialisation"
      livrableRef="§5 du livrable atelier 7"
      intent="Plan POC → MVP → Pilote → Rollout → Run avec critères de sortie."
      pourquoi={[
        "L'industrialisation se fait par PALIERS avec gates de sortie clairs.",
        "Sauter une étape (ex. POC → Rollout) = risque d'échec massif en production.",
        "Chaque palier renforce confiance + maturité opérationnelle.",
      ]}
      cherche={[
        "Des critères de sortie SMART par stage.",
        "Une montée en confiance progressive (readinessLevel 1→5).",
        "Des dates cibles réalistes.",
      ]}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-5">
        {INDUSTRIALIZATION_STAGES.map((stage) => {
          const r = readiness.find((x) => x.stage === stage);
          return (
            <div key={stage} className={cn("rounded-md border p-2 text-center text-xs",
              r?.ready ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
            )}>
              <div className="font-semibold">{INDUSTRIALIZATION_STAGE_LABELS[stage as IndustrializationStage].split(" ")[0]}</div>
              <Badge variant="outline" className="mt-1 text-[9px]">{r?.ready ? "✓ Prêt" : "⚠ À sécuriser"}</Badge>
              {r?.why ? <p className="mt-1 text-[10px] text-muted-foreground">{r.why}</p> : null}
            </div>
          );
        })}
      </div>

      <IndustrializationEditor
        items={snap.industrializationSteps.map((s) => ({
          id: s.id,
          stage: s.stage,
          name: s.name,
          description: s.description,
          readinessLevel: s.readinessLevel,
          status: s.status,
          exitCriteria: s.exitCriteria,
          startTarget: s.startTarget,
          endTarget: s.endTarget,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
