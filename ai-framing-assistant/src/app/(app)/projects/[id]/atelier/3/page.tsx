import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Layers, Sparkles, Brain } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ATELIER3_PHASES } from "@/types/atelier3";
import {
  a3OverallProgress,
  a3PhaseProgress,
  buildCoverageMap,
  computeA3Progress,
  coverageAverage,
  deriveMaturity,
  loadAtelier3Snapshot,
} from "@/lib/engines/atelier3";

export default async function Atelier3LandingPage(
  props: PageProps<"/projects/[id]/atelier/3">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA3Progress(snap);
  const overall = a3OverallProgress(snap);
  const derivedMaturity = deriveMaturity(snap);
  const coverage = buildCoverageMap(snap);
  const coverageAvg = coverageAverage(coverage);

  const allSec = ATELIER3_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 3 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Questionnaire de cadrage IA</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Ce n&apos;est pas un formulaire. C&apos;est un{" "}
              <strong>moteur de consolidation et de détection</strong> : on lit le travail
              des ateliers 1 et 2, on identifie les manques, on complète ce qui manque
              vraiment (documentaire, réglementaire), on auto-évalue maturité et faisabilité,
              et on prépare le scoring.
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/3/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Démarrer l'atelier" : "Reprendre"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Vue rapide : couverture + maturité dérivée */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-sky-50/40 to-background p-5 dark:from-sky-950/30">
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-5 w-5 text-foreground/70" />
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Couverture dossier
              </div>
              <div className="text-2xl font-semibold tabular-nums">{coverageAvg}%</div>
              <p className="text-xs text-muted-foreground">
                Moyenne pondérée sur les 16 sections du livrable consolidé (atelier 1 + 2 + atelier 3).
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-foreground transition-all" style={{ width: `${coverageAvg}%` }} />
              </div>
              <Link
                href={`/projects/${snap.projectId}/atelier/3/coverage`}
                className="mt-2 inline-block text-[11px] font-medium underline underline-offset-2"
              >
                Voir la vue de couverture →
              </Link>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-violet-50/40 to-background p-5 dark:from-violet-950/30">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 text-foreground/70" />
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Maturité dérivée par le moteur
              </div>
              <div className="text-2xl font-semibold capitalize">
                {derivedMaturity.overall === "LOW"
                  ? "Faible"
                  : derivedMaturity.overall === "MEDIUM"
                    ? "Moyenne"
                    : "Élevée"}
              </div>
              <p className="text-xs text-muted-foreground">
                Calculée à partir des données collectées (besoin, workflow, data, gouvernance,
                alignement, réalisme). Compare avec ta maturité auto-évaluée pour révéler les écarts.
              </p>
              <Link
                href={`/projects/${snap.projectId}/atelier/3/maturity`}
                className="mt-2 inline-block text-[11px] font-medium underline underline-offset-2"
              >
                Voir la maturité détaillée →
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parcours en 5 phases
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER3_PHASES.map((phase, idx) => {
            const ratio = a3PhaseProgress(snap, phase.id);
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
                      {idx < ATELIER3_PHASES.length - 1 ? " →" : ""}
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
                        href={`/projects/${snap.projectId}/atelier/3/${s.id}`}
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
