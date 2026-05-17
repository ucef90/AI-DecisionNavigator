import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { TASK_NATURE_LABELS, TASK_VERDICT_COLORS, TASK_VERDICT_LABELS, type TaskNature, type TaskVerdict } from "@/types/atelier2";

export default async function A2TasksPage(props: PageProps<"/projects/[id]/atelier/2/tasks">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Décomposition"
      title="Analyse des tâches"
      livrableRef="§2 du livrable atelier 2"
      intent="Lister les tâches concrètes — base de la matrice IA vs auto."
      pourquoi={[
        "Une tâche atomique = une décision (auto/IA/humain/hybride) qualifiable.",
        "Plus les tâches sont précises, plus la matrice est solide.",
        "Reprise des étapes du workflow atelier 1 + ajouts spécifiques.",
      ]}
      cherche={[
        "Au moins 3 tâches qualifiées.",
        "Nature explicite (lecture, classification, génération…).",
        "Complexité 1-5.",
      ]}
    >
      <Link href={`/projects/${id}/atelier/2/matrix`} className="mb-4 inline-block text-xs underline underline-offset-2">
        → Voir la matrice complète
      </Link>
      <ItemList
        items={snap.taskQualifications}
        empty="Aucune tâche listée."
        render={(t) => (
          <div key={t.id} className={cn("rounded-md border p-3", TASK_VERDICT_COLORS[t.verdict as TaskVerdict])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{t.taskName}</div>
                {t.justification ? <p className="mt-1 text-xs">{t.justification}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{TASK_NATURE_LABELS[t.nature as TaskNature] ?? t.nature}</Badge>
                <Badge variant="outline" className="text-[9px]">{TASK_VERDICT_LABELS[t.verdict as TaskVerdict] ?? t.verdict}</Badge>
                <Badge variant="outline" className="text-[9px]">Complexité {t.complexity}/5</Badge>
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
