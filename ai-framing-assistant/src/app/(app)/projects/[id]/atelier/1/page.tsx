import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Compass, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ATELIER_PHASES } from "@/types/atelier1";
import {
  computeSectionProgress,
  loadAtelierSnapshot,
  overallProgress,
  phaseProgress,
} from "@/lib/engines/atelier1";

// Atelier 1 — landing page.
//
// Two roles:
//   - briefer pédagogique : rappelle l'objectif et la philosophie
//     "pas d'IA d'abord" pour ancrer la posture du CDP.
//   - cockpit : montre les 5 phases avec leur progression, et
//     un bouton pour reprendre où on en est.

export default async function AtelierLandingPage(
  props: PageProps<"/projects/[id]/atelier/1">,
) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeSectionProgress(snap);
  const overall = overallProgress(snap);

  // Première section "non complète" pour le CTA "reprendre".
  const allSec = ATELIER_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 1 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Comprendre le vrai problème métier
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Avant toute réflexion IA, nous allons reformuler le besoin, cartographier
              le métier, diagnostiquer les irritants, fixer une cible mesurable, et
              identifier les risques de cadrage.
              {" "}
              <em>Un mauvais cadrage métier produit presque toujours un mauvais projet IA.</em>
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/1/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Démarrer l'atelier" : "Reprendre où je m'étais arrêté"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parcours en 5 phases (19 sections du livrable)
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER_PHASES.map((phase, idx) => {
            const ratio = phaseProgress(snap, phase.id);
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
                      {idx < ATELIER_PHASES.length - 1 ? " →" : ""}
                    </div>
                    <div className="mt-0.5 font-semibold leading-tight">{phase.title}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {done}/{sections.length}
                  </Badge>
                </header>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{phase.intent}</p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-foreground/80 transition-all"
                    style={{ width: `${ratio}%` }}
                  />
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
                        href={`/projects/${snap.projectId}/atelier/1/${s.id}`}
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

      <section className="rounded-xl border border-dashed border-border p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground/60" />
          <div className="space-y-1 text-sm">
            <div className="font-semibold">Comment l&apos;assistant t&apos;accompagne</div>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                Chaque section commence par <strong>pourquoi elle existe</strong> et{" "}
                <strong>ce qu&apos;on cherche</strong> — pas un formulaire vide.
              </li>
              <li>
                Le panneau de droite affiche des <strong>signaux live</strong> : reformulation
                orientée solution, irritants sans workflow, KPI sans baseline, etc.
              </li>
              <li>
                À tout moment, tu vois <strong>l&apos;avancement du gate atelier 2</strong>{" "}
                (5 critères go/no-go) qui détermine si tu peux passer à l&apos;atelier suivant.
              </li>
              <li>
                Quand un provider LLM est configuré (<Link href="/settings" className="underline">Paramètres</Link>),
                des boutons <em>Reformuler</em>, <em>Challenger</em>, <em>Suggérer des KPI</em>{" "}
                apparaissent. Sans LLM, l&apos;assistant fonctionne en mode coach déterministe.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
