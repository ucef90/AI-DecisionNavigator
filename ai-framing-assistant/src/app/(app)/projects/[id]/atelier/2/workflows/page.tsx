import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { PROCESS_STEP_MODE_LABELS, type ProcessStepMode } from "@/types/atelier1";

export default async function A2WorkflowsPage(props: PageProps<"/projects/[id]/atelier/2/workflows">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Décomposition"
      title="Analyse des workflows"
      livrableRef="§3 du livrable atelier 2 — workflow AS-IS atelier 1"
      intent="Vue workflow pour comprendre l'enchaînement des tâches et leur mode actuel."
      pourquoi={[
        "Le workflow révèle les chaînes de tâches (impossible de qualifier sans contexte).",
        "Le mode MANUAL signale les opportunités d'auto/IA.",
        "Base à partir de laquelle se construit la matrice atelier 2.",
      ]}
      cherche={[
        "Au moins 5 étapes pour avoir un workflow significatif.",
        "Mix MANUAL / SEMI / AUTO réaliste.",
        "Pour chaque étape : quel verdict dans la matrice ?",
      ]}
    >
      <Link href={`/projects/${id}/atelier/1/process-as-is`} className="mb-3 inline-block text-xs underline underline-offset-2">
        ← Édition workflow (atelier 1)
      </Link>
      <ItemList
        items={snap.processSteps}
        empty="Workflow non cartographié."
        render={(s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">{s.order}</span>
            <div className="flex-1">
              <div className="font-medium">{s.name}</div>
              {s.actor ? <div className="text-xs text-muted-foreground">{s.actor}</div> : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-[9px]">{PROCESS_STEP_MODE_LABELS[s.mode as ProcessStepMode] ?? s.mode}</Badge>
          </div>
        )}
      />
    </SectionShell>
  );
}
