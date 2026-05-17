import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CARTOGRAPHY_LAYERS, CARTOGRAPHY_LAYER_LABELS } from "@/lib/engines/cartography";
import { LAYER_TO_SECTION } from "@/types/atelier5";
import { computeLayerStats, loadAtelier5Snapshot } from "@/lib/engines/atelier5";

// LA section pivot atelier 5 — vue d'ensemble des 6 cartographies
// avec aperçu des nœuds par couche, annotations associées, et
// liens deep vers la cartographie complète (page /cartography
// existante) et vers la section détail atelier 5.

export default async function OverviewSectionPage(
  props: PageProps<"/projects/[id]/atelier/5/overview">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();

  const stats = computeLayerStats(snap);
  const cartography = snap.cartography;

  return (
    <SectionShell
      phaseLabel="Phase A — Vue d'ensemble"
      title="Vue d'ensemble · 6 couches cartographiques"
      livrableRef="Vue globale de l'atelier 5"
      intent="Voir d'un coup d'œil les 6 vues du projet IA, identifier les couches vides ou critiques, et préparer les annotations."
      pourquoi={[
        "Les 6 vues sont générées AUTOMATIQUEMENT depuis les données des ateliers 1-4 — pas de re-saisie.",
        "Cette vue d'ensemble révèle les couches sous-développées (ex. gouvernance vide = atelier 6 fragile).",
        "Chaque carte peut être annotée pour transmettre les points d'attention à l'équipe.",
      ]}
      cherche={[
        "Les couches vides (0 nœud) — quelle donnée manque dans les ateliers précédents ?",
        "Les couches denses (>10 nœuds) — sont-elles cohérentes ou faut-il simplifier ?",
        "Les annotations critiques déjà posées — elles iront dans l'atelier 6.",
        "L'alignement entre les couches (ex. tech IA déclarée mais aucune donnée associée).",
      ]}
      pieges={[
        "Considérer une couche complète parce qu'elle a beaucoup de nœuds : la densité ne fait pas la qualité.",
        "Ignorer une couche vide : c'est précisément le signal que l'atelier amont est incomplet.",
        "Annoter trop : 1-3 notes critiques par couche suffisent — le reste devient du bruit.",
      ]}
    >
      <div className="space-y-4">
        {/* Lien vers la cartographie complète existante */}
        <Link
          href={`/projects/${id}/cartography`}
          className="group flex items-center justify-between gap-3 rounded-lg border border-foreground/20 bg-gradient-to-br from-muted/40 to-background p-4 transition hover:border-foreground/50"
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vue interactive complète
            </div>
            <div className="mt-0.5 font-semibold">
              Ouvrir la cartographie graphique (toutes couches)
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Affiche les 6 couches avec graphes positionnés (nœuds, relations, légendes).
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-foreground/40 transition group-hover:text-foreground" />
        </Link>

        {/* Grid des 6 couches avec aperçu nœuds */}
        <div className="space-y-3">
          {CARTOGRAPHY_LAYERS.map((layer) => {
            const s = stats[layer];
            const graph = cartography?.layers[layer];
            const sectionId = LAYER_TO_SECTION[layer];
            const layerAnnots = snap.annotations.filter((a) => a.layer === layer);
            return (
              <article
                key={layer}
                className={cn(
                  "rounded-lg border bg-background p-4",
                  s.nodeCount === 0 ? "border-dashed border-border" : "border-border",
                )}
              >
                <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{CARTOGRAPHY_LAYER_LABELS[layer]}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {s.nodeCount} nœud(s)
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {s.edgeCount} relation(s)
                      </Badge>
                      {layerAnnots.length > 0 ? (
                        <Badge variant="outline" className="text-[10px]">
                          {layerAnnots.length} note(s)
                        </Badge>
                      ) : null}
                    </div>
                    {graph?.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{graph.description}</p>
                    ) : null}
                    {graph?.emptyReason ? (
                      <p className="mt-1 text-xs italic text-amber-700 dark:text-amber-300">
                        {graph.emptyReason}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/projects/${id}/atelier/5/${sectionId}`}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-md border border-foreground/20 bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground/40"
                  >
                    Détails
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </header>

                {/* Aperçu des nœuds (max 8) */}
                {graph && graph.nodes.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {graph.nodes.slice(0, 8).map((node) => (
                      <span
                        key={node.id}
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px]",
                          node.severity === "CRITICAL"
                            ? "border-rose-500/40 bg-rose-50/60 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100"
                            : node.severity === "WARNING"
                              ? "border-amber-500/40 bg-amber-50/60 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                              : "border-border bg-muted/40 text-foreground/80",
                        )}
                        title={node.description ?? node.label}
                      >
                        {node.label}
                      </span>
                    ))}
                    {graph.nodes.length > 8 ? (
                      <span className="rounded-md border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{graph.nodes.length - 8}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* Metrics graph */}
                {graph?.metrics && graph.metrics.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    {graph.metrics.map((m, i) => (
                      <span key={i}>
                        <span className="font-semibold">{m.label}</span> : {m.value}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Annotations existantes */}
                {layerAnnots.length > 0 ? (
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Annotations
                    </div>
                    <ul className="space-y-1 text-xs">
                      {layerAnnots.slice(0, 3).map((a) => (
                        <li key={a.id} className="flex gap-1.5">
                          <span className="font-semibold text-foreground/80">[{a.kind}]</span>
                          <span className="flex-1 text-foreground/80">{a.content}</span>
                        </li>
                      ))}
                      {layerAnnots.length > 3 ? (
                        <li className="text-[10px] italic text-muted-foreground">
                          +{layerAnnots.length - 3} autres
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
