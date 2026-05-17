import Link from "next/link";
import { Map, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CARTOGRAPHY_LAYERS, CARTOGRAPHY_LAYER_LABELS } from "@/lib/engines/cartography";
import type { A5GateCriterion, LayerStats } from "@/lib/engines/atelier5";
import { LAYER_TO_SECTION } from "@/types/atelier5";

type Props = {
  projectId: string;
  layerStats: Record<string, LayerStats>;
  gate: A5GateCriterion[];
  gateVerdict: "NOT_READY" | "READY" | "OVERRIDE" | null;
  totalAnnotations: number;
};

export function Atelier5LivePanel({ projectId, layerStats, gate, gateVerdict, totalAnnotations }: Props) {
  const metCount = gate.filter((c) => c.met).length;
  const filledLayers = CARTOGRAPHY_LAYERS.filter((l) => layerStats[l].nodeCount > 0).length;

  return (
    <aside className="space-y-5 text-sm">
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Map className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Couches cartographiques
          </h3>
        </header>
        <div className="rounded-md border border-foreground/15 bg-muted/30 px-3 py-2.5">
          <div className="text-2xl font-semibold tabular-nums">
            {filledLayers}<span className="text-sm text-muted-foreground">/6</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {totalAnnotations} annotation(s) au total
          </div>
        </div>
        <ul className="space-y-1">
          {CARTOGRAPHY_LAYERS.map((layer) => {
            const s = layerStats[layer];
            const section = LAYER_TO_SECTION[layer];
            const empty = s.nodeCount === 0;
            return (
              <li key={layer}>
                <Link
                  href={`/projects/${projectId}/atelier/5/${section}`}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                    empty
                      ? "border-dashed border-border text-muted-foreground hover:bg-muted/50"
                      : "border-border bg-background hover:border-foreground/30",
                  )}
                >
                  <span className="truncate">{CARTOGRAPHY_LAYER_LABELS[layer]}</span>
                  <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-[10px]">
                    {s.nodeCount > 0 ? <Badge variant="outline">{s.nodeCount}n</Badge> : null}
                    {s.totalAnnotations > 0 ? (
                      <Badge variant="outline" className="text-[10px]">
                        {s.totalAnnotations}a
                      </Badge>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate atelier 6
          </h3>
          <Badge
            variant={
              gateVerdict === "READY" || gateVerdict === "OVERRIDE" || metCount === gate.length
                ? "default"
                : "outline"
            }
            className="ml-auto"
          >
            {metCount}/{gate.length}
          </Badge>
        </header>
        <ul className="space-y-1">
          {gate.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  c.met ? "bg-emerald-500" : "bg-muted",
                )}
              />
              <div className="flex-1">
                <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>{c.label}</div>
                {!c.met && c.why ? (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{c.why}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href={`/projects/${projectId}/atelier/5/gate`}
          className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background hover:bg-foreground/90"
        >
          Évaluer le gate →
        </Link>
      </section>
    </aside>
  );
}
