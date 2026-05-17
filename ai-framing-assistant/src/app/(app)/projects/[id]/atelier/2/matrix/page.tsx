import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { MatrixEditor, type MatrixTask } from "@/components/atelier2/matrix-editor";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot, recommendProfile } from "@/lib/engines/atelier2";
import {
  createTaskQualification,
  deleteTaskQualification,
  seedFromAtelier1Workflow,
  updateTaskQualification,
} from "@/lib/actions/atelier2/matrix";
import { A2_PROFILE_LABELS, TASK_VERDICT_COLORS, TASK_VERDICT_LABELS } from "@/types/atelier2";
import type { TaskVerdict } from "@/types/atelier2";

// Section pivot de l'atelier 2 — la matrice IA vs auto.
// C'est ici que le projet bascule de "on parle d'IA" à
// "voici précisément où l'IA aide et où l'humain reste".

export default async function MatrixSectionPage(
  props: PageProps<"/projects/[id]/atelier/2/matrix">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  const tasks: MatrixTask[] = snap.taskQualifications.map((t) => ({
    id: t.id,
    taskName: t.taskName,
    nature: t.nature,
    verdict: t.verdict,
    complexity: t.complexity,
    justification: t.justification,
  }));
  const hasWorkflowSteps = snap.processSteps.length > 0;
  const profile = recommendProfile(snap);

  // Server action bindings ; les helpers wrapent les actions
  // déclarées dans src/lib/actions/atelier2/matrix.ts.
  async function handleCreate(formData: FormData) {
    "use server";
    await createTaskQualification(id, undefined, formData);
  }
  async function handleUpdate(taskId: string, patch: Partial<MatrixTask>) {
    "use server";
    await updateTaskQualification(id, taskId, {
      verdict: patch.verdict as TaskVerdict | undefined,
      complexity: patch.complexity,
      justification: patch.justification ?? undefined,
    });
  }
  async function handleDelete(taskId: string) {
    "use server";
    await deleteTaskQualification(id, taskId);
  }
  async function handleSeed() {
    "use server";
    return seedFromAtelier1Workflow(id);
  }

  return (
    <SectionShell
      phaseLabel="Phase C — Qualification IA vs auto"
      title="Matrice IA vs automatisation"
      livrableRef="§6 du livrable atelier 2"
      intent="Pour chaque tâche du processus, choisir entre automatisation, IA, humain, ou hybride — et justifier."
      pourquoi={[
        "C'est l'étape qui empêche le projet de devenir un « projet IA » par défaut.",
        "Sans matrice, on finit par mettre de l'IA partout — ou nulle part.",
        "La matrice rend visible le bon dosage entre auto / IA / humain — ce qui prépare l'architecture cible.",
      ]}
      cherche={[
        "Où l'IA apporte vraiment de la valeur (compréhension, classification, génération).",
        "Où une automatisation classique suffit (règles fixes, workflow stable).",
        "Où l'humain doit rester (décision sensible, cas ambigus, validation).",
        "Où c'est hybride (IA propose / humain valide).",
      ]}
      pieges={[
        "Mettre IA partout sans justification : tu vas surdimensionner et complexifier inutilement.",
        "Tout passer en HUMAN par prudence : tu n'auras aucune valeur projet à présenter.",
        "Oublier de qualifier les exceptions : elles révèlent souvent les vrais besoins humains.",
        "Justifier en deux mots : sans le « pourquoi », tu ne pourras pas défendre la matrice en COPIL.",
      ]}
      exemples={{
        mauvais: "Classification : IA (verdict sans justification — qu'est-ce que l'IA y apporte vs un moteur de règles ?)",
        bon: "Classification : IA — variabilité forte des libellés clients (textes libres) + besoin d'apprendre des cas passés. Règles fixes inopérantes.",
      }}
      aside={
        <div className="space-y-3">
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Profil pressenti (live)
            </div>
            <div className="mt-1 text-sm font-semibold">{A2_PROFILE_LABELS[profile.profile]}</div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{profile.rationale}</p>
            {profile.techMixHint && profile.techMixHint.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.techMixHint.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Décodage des verdicts
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {(["AUTOMATION", "AI", "HUMAN", "HYBRID"] as const).map((v) => (
                <li key={v} className="flex items-start gap-1.5">
                  <span className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${TASK_VERDICT_COLORS[v].split(" ")[0]}`} />
                  <div>
                    <span className="font-semibold text-foreground">
                      {TASK_VERDICT_LABELS[v]}
                    </span>
                    <span className="ml-1">
                      {v === "AUTOMATION" && "— règles connues, workflow stable, peu d'exceptions."}
                      {v === "AI" && "— compréhension, classification, génération de contenu."}
                      {v === "HUMAN" && "— interprétation, décision sensible, ambiguïté."}
                      {v === "HYBRID" && "— IA propose, humain valide ou arbitre."}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    >
      <MatrixEditor
        projectId={id}
        tasks={tasks}
        hasWorkflowSteps={hasWorkflowSteps}
        createAction={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onSeed={handleSeed}
      />
    </SectionShell>
  );
}
