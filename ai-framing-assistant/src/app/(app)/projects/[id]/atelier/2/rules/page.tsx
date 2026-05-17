import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";

export default async function A2RulesPage(props: PageProps<"/projects/[id]/atelier/2/rules">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  // On lit les caractéristiques de chaque tâche pour identifier les règles
  const tasks = snap.taskQualifications;
  const withFixedRules = tasks.filter((t) => t.rulesKnownAndFixed);
  const stable = tasks.filter((t) => t.workflowStable);
  const fewExc = tasks.filter((t) => t.fewExceptions);

  return (
    <SectionShell
      phaseLabel="Phase B — Décomposition"
      title="Analyse des règles métier"
      livrableRef="§4 du livrable atelier 2"
      intent="Identifier les règles fixes vs cas complexes — indicateur clé auto vs IA."
      pourquoi={[
        "Règles fixes + workflow stable + peu d'exceptions = automatisation classique.",
        "Règles floues + interprétation = besoin IA.",
        "C'est ce critère qui pousse vers BPM/RPA vs ML/LLM.",
      ]}
      cherche={[
        "Tâches avec règles connues (auto possible).",
        "Tâches stables (peu de changements).",
        "Tâches avec peu d'exceptions (auto fiable).",
      ]}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold tabular-nums">{withFixedRules.length}/{tasks.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Règles connues</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold tabular-nums">{stable.length}/{tasks.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow stable</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold tabular-nums">{fewExc.length}/{tasks.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Peu d&apos;exceptions</div>
        </div>
      </div>
      <ItemList
        items={tasks}
        empty="Aucune tâche qualifiée."
        render={(t) => (
          <div key={t.id} className="rounded-md border border-border bg-background p-3">
            <div className="font-medium">{t.taskName}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {t.rulesKnownAndFixed ? <Badge variant="outline" className="text-[9px]">✓ Règles fixes</Badge> : null}
              {t.workflowStable ? <Badge variant="outline" className="text-[9px]">✓ Stable</Badge> : null}
              {t.fewExceptions ? <Badge variant="outline" className="text-[9px]">✓ Peu d&apos;exceptions</Badge> : null}
              {t.needsTextUnderstanding ? <Badge variant="outline" className="text-[9px]">→ NLP</Badge> : null}
              {t.needsClassification ? <Badge variant="outline" className="text-[9px]">→ Classif</Badge> : null}
              {t.needsContentGeneration ? <Badge variant="outline" className="text-[9px]">→ Génération</Badge> : null}
              {t.needsHumanInterpretation ? <Badge variant="outline" className="text-[9px]">→ Humain</Badge> : null}
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
