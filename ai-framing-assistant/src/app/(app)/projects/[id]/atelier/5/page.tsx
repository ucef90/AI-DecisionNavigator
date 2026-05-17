import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Map, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CARTOGRAPHY_LAYERS, CARTOGRAPHY_LAYER_LABELS } from "@/lib/engines/cartography";
import {
  a5OverallProgress,
  a5PhaseProgress,
  computeA5Progress,
  computeLayerStats,
  loadAtelier5Snapshot,
} from "@/lib/engines/atelier5";
import { ATELIER5_PHASES, LAYER_TO_SECTION } from "@/types/atelier5";

export default async function Atelier5LandingPage(
  props: PageProps<"/projects/[id]/atelier/5">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  const sectionProgress = computeA5Progress(snap);
  const overall = a5OverallProgress(snap);
  const stats = computeLayerStats(snap);

  const allSec = ATELIER5_PHASES.flatMap((p) => p.sections);
  const resume = allSec.find((s) => sectionProgress[s.id].status !== "COMPLETE") ?? allSec[0];

  const totalNodes = CARTOGRAPHY_LAYERS.reduce((sum, l) => sum + stats[l].nodeCount, 0);
  const filledLayers = CARTOGRAPHY_LAYERS.filter((l) => stats[l].nodeCount > 0).length;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Atelier de cadrage IA — étape 5 sur 7</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Cartographie IA complète</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              6 cartographies générées automatiquement à partir de tout ce qui a été collecté
              dans les ateliers 1 à 4 — métier, workflow, data, technologies IA, risques,
              gouvernance. Tu peux annoter chaque nœud pour préparer l&apos;atelier 6.
            </p>
          </div>
          <Link
            href={`/projects/${snap.projectId}/atelier/5/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {overall === 0 ? "Ouvrir la cartographie" : "Reprendre"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Hero : 3 KPIs */}
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-muted/40 to-background p-5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Couches actives
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums">{filledLayers}/6</div>
        </article>
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-sky-50/40 to-background p-5 text-center dark:from-sky-950/30">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nœuds cartographiés
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums">{totalNodes}</div>
        </article>
        <article className="rounded-xl border border-foreground/15 bg-gradient-to-br from-violet-50/40 to-background p-5 text-center dark:from-violet-950/30">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Annotations
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums">{snap.annotations.length}</div>
        </article>
      </section>

      {/* 6 cards : 1 par couche */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Les 6 cartographies
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CARTOGRAPHY_LAYERS.map((layer) => {
            const s = stats[layer];
            const sectionId = LAYER_TO_SECTION[layer];
            const status = sectionProgress[sectionId].status;
            return (
              <Link
                key={layer}
                href={`/projects/${snap.projectId}/atelier/5/${sectionId}`}
                className="group block rounded-lg border border-border bg-background p-4 shadow-sm transition hover:border-foreground/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold leading-tight">
                      {CARTOGRAPHY_LAYER_LABELS[layer]}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.nodeCount} nœud(s) · {s.edgeCount} relation(s)
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {s.totalAnnotations} note(s)
                  </Badge>
                </div>
                {s.emptyReason ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">{s.emptyReason}</p>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span
                      className={
                        status === "COMPLETE"
                          ? "h-2 w-2 rounded-full bg-emerald-500"
                          : status === "STARTED"
                            ? "h-2 w-2 rounded-full bg-amber-400"
                            : "h-2 w-2 rounded-full bg-muted-foreground/30"
                      }
                    />
                    <span className="flex-1">
                      {s.criticalAnnotations > 0
                        ? `${s.criticalAnnotations} note(s) critique(s)`
                        : status === "EMPTY"
                          ? "Vide — compléter les ateliers en amont"
                          : "Couche disponible"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Phases */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parcours en 5 phases
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ATELIER5_PHASES.map((phase, idx) => {
            const ratio = a5PhaseProgress(snap, phase.id);
            const sections = phase.sections;
            const done = sections.filter((s) => sectionProgress[s.id].status === "COMPLETE").length;
            return (
              <article key={phase.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Phase {phase.id}
                      {idx < ATELIER5_PHASES.length - 1 ? " →" : ""}
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
                        href={`/projects/${snap.projectId}/atelier/5/${s.id}`}
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
