import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { PROCESS_STEP_MODE_LABELS, PROCESS_STEP_TYPE_LABELS, type ProcessStepMode, type ProcessStepType } from "@/types/atelier1";

const MODE_COLOR = {
  MANUAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  SEMI_AUTOMATED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  AUTOMATED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
};

export default async function ProcessAsIsPage(props: PageProps<"/projects/[id]/atelier/1/process-as-is">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

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
      <ItemList
        items={snap.processSteps}
        empty="Workflow AS-IS non cartographié."
        render={(s) => {
          const tools = safeJSON<string[]>(s.tools, []);
          return (
            <div key={s.id} className={cn("rounded-md border p-3", MODE_COLOR[s.mode as ProcessStepMode] ?? "border-border")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">{s.order}</span>
                  <span className="font-semibold">{s.name}</span>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[9px]">{PROCESS_STEP_TYPE_LABELS[s.stepType as ProcessStepType] ?? s.stepType}</Badge>
                  <Badge variant="outline" className="text-[9px]">{PROCESS_STEP_MODE_LABELS[s.mode as ProcessStepMode] ?? s.mode}</Badge>
                  {s.durationMin ? <Badge variant="outline" className="text-[9px]">{s.durationMin}min</Badge> : null}
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {s.actor ? <span><strong>Acteur :</strong> {s.actor}</span> : null}
                {tools.length > 0 ? <span className="ml-3"><strong>Outils :</strong> {tools.join(", ")}</span> : null}
              </div>
            </div>
          );
        }}
      />
    </SectionShell>
  );
}
