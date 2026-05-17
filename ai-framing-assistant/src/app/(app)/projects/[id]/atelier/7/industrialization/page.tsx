import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  INDUSTRIALIZATION_STAGES,
  INDUSTRIALIZATION_STAGE_LABELS,
  type IndustrializationStage,
  type IndustrializationStatus,
} from "@/types/atelier7";
import {
  computeIndustrializationReadiness,
  loadAtelier7Snapshot,
} from "@/lib/engines/atelier7";

const STATUS_COLOR: Record<IndustrializationStatus, string> = {
  NOT_STARTED: "border-border bg-muted/30 text-muted-foreground",
  IN_PROGRESS: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  DONE: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

const STATUS_LABEL: Record<IndustrializationStatus, string> = {
  NOT_STARTED: "Non démarré",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
};

export default async function IndustrializationSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/industrialization">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();
  const readiness = computeIndustrializationReadiness(snap);
  const readinessByStage = Object.fromEntries(readiness.map((r) => [r.stage, r]));

  const byStage = new Map<IndustrializationStage, typeof snap.industrializationSteps>();
  for (const stage of INDUSTRIALIZATION_STAGES) byStage.set(stage, []);
  for (const step of snap.industrializationSteps) {
    byStage.get(step.stage as IndustrializationStage)?.push(step);
  }

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
        "Un alignement avec les conditions du moteur (cf. readiness calculée à droite).",
      ]}
    >
      <div className="space-y-3">
        {INDUSTRIALIZATION_STAGES.map((stage) => {
          const list = byStage.get(stage) ?? [];
          const r = readinessByStage[stage];
          return (
            <div key={stage} className="rounded-md border border-border bg-background p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{INDUSTRIALIZATION_STAGE_LABELS[stage]}</h3>
                  {r ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          r.ready ? "border-emerald-500/40" : "border-amber-500/40",
                        )}
                      >
                        {r.ready ? "✓ Prêt (moteur)" : "⚠ À sécuriser"}
                      </Badge>
                      {r.why ? <span className="text-[10px] text-muted-foreground">{r.why}</span> : null}
                    </div>
                  ) : null}
                </div>
              </div>
              {list.length === 0 ? (
                <p className="mt-2 text-xs italic text-muted-foreground">(stage non planifié)</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {list.map((s) => (
                    <li
                      key={s.id}
                      className={cn(
                        "rounded-md border px-3 py-2 text-xs",
                        STATUS_COLOR[s.status as IndustrializationStatus],
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{s.name}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          <Badge variant="outline" className="bg-background/80 text-[9px]">
                            Readiness {s.readinessLevel}/5
                          </Badge>
                          <Badge variant="outline" className="bg-background/80 text-[9px]">
                            {STATUS_LABEL[s.status as IndustrializationStatus]}
                          </Badge>
                        </span>
                      </div>
                      {s.description ? <p className="mt-1 opacity-90">{s.description}</p> : null}
                      {(s.startTarget || s.endTarget) ? (
                        <p className="mt-1 text-[10px] opacity-70">
                          {s.startTarget ? new Date(s.startTarget).toISOString().slice(0, 10) : "—"} → {s.endTarget ? new Date(s.endTarget).toISOString().slice(0, 10) : "—"}
                        </p>
                      ) : null}
                      {s.exitCriteria ? (
                        <p className="mt-1 text-[10px] italic"><strong>Critères de sortie :</strong> {s.exitCriteria}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
