// Vue d'une couche cartographique : nodes + edges + annotations
// associées. Réutilisée par les 6 sections layer-map atelier 5.

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CartographyLayerId, Graph } from "@/lib/engines/cartography";
import type { Atelier5Snapshot } from "@/lib/engines/atelier5";
import { ANNOTATION_KIND_COLORS, type AnnotationKind } from "@/types/atelier5";

type Props = {
  projectId: string;
  layer: CartographyLayerId;
  graph: Graph | undefined;
  annotations: Atelier5Snapshot["annotations"];
};

export function LayerView({ projectId, layer, graph, annotations }: Props) {
  const layerAnnots = annotations.filter((a) => a.layer === layer);

  if (!graph || graph.nodes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
        Couche vide. {graph?.emptyReason ?? "Les données de cette couche viennent des ateliers en amont."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/projects/${projectId}/cartography`}
        className="inline-flex items-center gap-1.5 text-xs underline underline-offset-2"
      >
        Vue graphique complète <ExternalLink className="h-3 w-3" />
      </Link>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold">{graph.nodes.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Nœuds</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold">{graph.edges.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Relations</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <div className="text-2xl font-semibold">{layerAnnots.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Annotations</div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nœuds de cette couche
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {graph.nodes.map((n) => (
            <span
              key={n.id}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs",
                n.severity === "CRITICAL"
                  ? "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20"
                  : n.severity === "WARNING"
                    ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20"
                    : "border-border bg-muted/40",
              )}
              title={n.description ?? n.label}
            >
              {n.label}
            </span>
          ))}
        </div>
      </div>

      {graph.edges.length > 0 ? (
        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Relations
          </h3>
          <ul className="space-y-1 text-xs">
            {graph.edges.slice(0, 10).map((e) => {
              const from = graph.nodes.find((n) => n.id === e.source);
              const to = graph.nodes.find((n) => n.id === e.target);
              if (!from || !to) return null;
              return (
                <li key={e.id} className="flex items-center gap-2">
                  <span>{from.label}</span>
                  <ArrowRight className="h-3 w-3 text-foreground/40" />
                  <span>{to.label}</span>
                  {e.label ? <span className="text-muted-foreground">— {e.label}</span> : null}
                </li>
              );
            })}
            {graph.edges.length > 10 ? <li className="italic text-muted-foreground">+{graph.edges.length - 10} relations</li> : null}
          </ul>
        </div>
      ) : null}

      {layerAnnots.length > 0 ? (
        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Annotations ({layerAnnots.length})
          </h3>
          <ul className="space-y-1.5">
            {layerAnnots.map((a) => (
              <li key={a.id} className={cn("rounded-md border px-3 py-2 text-xs", ANNOTATION_KIND_COLORS[a.kind as AnnotationKind])}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{a.kind}</Badge>
                  {a.criticality ? <Badge variant="outline" className="text-[9px]">{a.criticality}</Badge> : null}
                </div>
                <p className="mt-1">{a.content}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {graph.metrics && graph.metrics.length > 0 ? (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {graph.metrics.map((m, i) => (
            <span key={i}><strong className="text-foreground">{m.label} :</strong> {m.value}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
