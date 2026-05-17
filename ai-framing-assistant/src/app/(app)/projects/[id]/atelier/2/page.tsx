import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Cpu, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ATELIER2_PHASES } from "@/types/atelier2";
import {
  a2OverallProgress,
  a2PhaseProgress,
  computeA2Progress,
  loadAtelier2Snapshot,
  recommendProfile,
} from "@/lib/engines/atelier2";
import { A2_PROFILE_LABELS } from "@/types/atelier2";

export default async function Atelier2LandingPage(
  props: PageProps<"/projects/[id]/atelier/2">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA2Progress(snap);
  const overall = a2OverallProgress(snap);
  const profile = recommendProfile(snap);

  const allSec = ATELIER2_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 2 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">IA ou automatisation ?</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              L&apos;objectif n&apos;est pas d&apos;ajouter de l&apos;IA partout. On va décomposer
              les tâches, qualifier la complexité, puis dans une matrice claire : qualifier chaque
              tâche comme <em>automatisation</em>, <em>IA</em>, <em>humain</em> ou{" "}
              <em>hybride</em> — et en déduire l&apos;architecture cible.
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/2/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Démarrer l'atelier" : "Reprendre"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Profil pré-recommandé même avec peu de données — fait sentir la valeur dès l'entrée */}
      <section className="rounded-xl border border-foreground/15 bg-gradient-to-br from-violet-50/40 via-background to-sky-50/40 p-5 dark:from-violet-950/30 dark:to-sky-950/30">
        <div className="flex items-start gap-3">
          <Cpu className="mt-0.5 h-5 w-5 text-foreground/70" />
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Profil pressenti par le moteur
            </div>
            <div className="text-lg font-semibold">{A2_PROFILE_LABELS[profile.profile]}</div>
            <p className="text-sm text-muted-foreground">{profile.rationale}</p>
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
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parcours en 5 phases
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER2_PHASES.map((phase, idx) => {
            const ratio = a2PhaseProgress(snap, phase.id);
            const sections = phase.sections;
            const done = sections.filter((s) => sectionProgress[s.id].status === "COMPLETE").length;
            return (
              <article
                key={phase.id}
                className="rounded-lg border border-border bg-background p-4 shadow-sm"
              >
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Phase {phase.id}
                      {idx < ATELIER2_PHASES.length - 1 ? " →" : ""}
                    </div>
                    <div className="mt-0.5 font-semibold leading-tight">{phase.title}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {done}/{sections.length}
                  </Badge>
                </header>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{phase.intent}</p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-foreground/80 transition-all" style={{ width: `${ratio}%` }} />
                </div>
                <ul className="mt-3 space-y-0.5 text-[11px] text-muted-foreground">
                  {sections.map((s) => (
                    <li key={s.id} className="flex items-center gap-1.5">
                      <span
                        className={
                          sectionProgress[s.id].status === "COMPLETE"
                            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                            : sectionProgress[s.id].status === "STARTED"
                              ? "h-1.5 w-1.5 rounded-full bg-amber-400"
                              : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                        }
                      />
                      <Link
                        href={`/projects/${snap.projectId}/atelier/2/${s.id}`}
                        className="truncate hover:underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
