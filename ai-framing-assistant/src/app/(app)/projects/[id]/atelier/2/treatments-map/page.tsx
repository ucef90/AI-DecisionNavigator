import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatRow } from "@/components/common/data-block";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { TASK_VERDICTS, TASK_VERDICT_COLORS, TASK_VERDICT_LABELS, type TaskVerdict } from "@/types/atelier2";

export default async function A2TreatmentsMapPage(props: PageProps<"/projects/[id]/atelier/2/treatments-map">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  const counts: Record<TaskVerdict, number> = { AUTOMATION: 0, AI: 0, HUMAN: 0, HYBRID: 0 };
  for (const t of snap.taskQualifications) counts[t.verdict as TaskVerdict] = (counts[t.verdict as TaskVerdict] ?? 0) + 1;

  return (
    <SectionShell
      phaseLabel="Phase D — Architecture cible"
      title="Cartographie des traitements"
      livrableRef="§8 du livrable atelier 2"
      intent="Visualiser le mix auto/IA/humain/hybride sur tous les traitements."
      pourquoi={[
        "Vue d'ensemble qui révèle le PROFIL du projet (auto-only vs IA-centric vs humain-first).",
        "Le ratio par catégorie justifie le choix d'architecture cible.",
        "Vue alternative de la matrice — plus orientée présentation.",
      ]}
      cherche={[
        "Distribution équilibrée selon le profil voulu.",
        "Cas humains pas oubliés (≥1 toujours).",
        "Cohérence avec la nature des tâches.",
      ]}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {TASK_VERDICTS.map((v) => (
          <div key={v} className={cn("rounded-md border px-3 py-2 text-center", TASK_VERDICT_COLORS[v])}>
            <div className="text-2xl font-semibold tabular-nums">{counts[v]}</div>
            <div className="text-[10px] uppercase tracking-wider">{TASK_VERDICT_LABELS[v]}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {snap.taskQualifications.map((t) => (
          <div key={t.id} className={cn("flex items-center gap-3 rounded-md border px-3 py-2", TASK_VERDICT_COLORS[t.verdict as TaskVerdict])}>
            <span className="flex-1 text-sm font-medium">{t.taskName}</span>
            <Badge variant="outline" className="bg-background/80 text-[9px]">{TASK_VERDICT_LABELS[t.verdict as TaskVerdict] ?? t.verdict}</Badge>
          </div>
        ))}
      </div>

      <Link href={`/projects/${id}/atelier/2/matrix`} className="mt-4 inline-block text-xs underline underline-offset-2">
        → Éditer dans la matrice
      </Link>

      <div className="mt-4 hidden">
        <StatRow label="hidden" value="0" />
      </div>
    </SectionShell>
  );
}
