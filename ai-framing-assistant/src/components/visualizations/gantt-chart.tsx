// Gantt chart simple (HTML) — roadmap par phases.
// Une ligne par item, colorée par phase, largeur proportionnelle
// à effortMonths. Pas de drag-and-drop pour rester simple.

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ROADMAP_PHASES,
  ROADMAP_PHASE_COLORS,
  ROADMAP_PHASE_LABELS,
  type RoadmapPhase,
} from "@/types/atelier7";

export type GanttItem = {
  id: string;
  title: string;
  phase: RoadmapPhase;
  effortMonths: number;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  impact: number;
  complexity: number;
};

type Props = {
  items: GanttItem[];
  /** Mois cumulés par phase (offset start) — calculé en interne */
};

const STATUS_OPACITY = {
  PLANNED: "opacity-70",
  IN_PROGRESS: "opacity-100",
  DONE: "opacity-100",
  CANCELLED: "opacity-30",
} as const;

export function GanttChart({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Aucun item dans la roadmap. Ajoute des phases (POC, MVP, pilote…) avec leur durée.
      </p>
    );
  }

  // Calcul offsets cumulés par phase
  const phaseStart = new Map<RoadmapPhase, number>();
  let cursor = 0;
  for (const phase of ROADMAP_PHASES) {
    phaseStart.set(phase, cursor);
    const phaseTotalEffort = items
      .filter((i) => i.phase === phase)
      .reduce((s, i) => s + Math.max(1, i.effortMonths || 1), 0);
    cursor += phaseTotalEffort;
  }
  const totalMonths = Math.max(12, cursor);

  // Pour chaque item dans une phase, position cumulée dans la phase
  const itemsByPhase = new Map<RoadmapPhase, GanttItem[]>();
  for (const phase of ROADMAP_PHASES) {
    itemsByPhase.set(
      phase,
      items.filter((i) => i.phase === phase),
    );
  }

  // Index ligne pour position verticale
  const ROW_HEIGHT = 28;
  type Row = { item: GanttItem; offsetMonths: number };
  const rows: Row[] = [];
  for (const phase of ROADMAP_PHASES) {
    const itemsForPhase = itemsByPhase.get(phase) ?? [];
    let localOffset = phaseStart.get(phase) ?? 0;
    for (const item of itemsForPhase) {
      rows.push({ item, offsetMonths: localOffset });
      localOffset += Math.max(1, item.effortMonths || 1);
    }
  }

  // Graduations mensuelles
  const ticks = Array.from({ length: totalMonths + 1 }, (_, i) => i);

  return (
    <div className="space-y-3">
      {/* Légende phases */}
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        {ROADMAP_PHASES.map((p) => (
          <div key={p} className="flex items-center gap-1">
            <span className={cn("h-2.5 w-2.5 rounded", ROADMAP_PHASE_COLORS[p])} />
            <span className="text-muted-foreground">{ROADMAP_PHASE_LABELS[p]}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background p-3">
        {/* Header timeline */}
        <div className="relative ml-44 flex border-b border-border text-[10px] text-muted-foreground" style={{ minWidth: 480 }}>
          {ticks.map((t) => (
            <div
              key={t}
              className="border-l border-border/30"
              style={{ width: `${100 / totalMonths}%`, minWidth: 20 }}
            >
              {t % 3 === 0 ? <span className="pl-1">M{t}</span> : null}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div>
          {rows.map(({ item, offsetMonths }) => {
            const duration = Math.max(1, item.effortMonths || 1);
            const leftPct = (offsetMonths / totalMonths) * 100;
            const widthPct = (duration / totalMonths) * 100;
            return (
              <div
                key={item.id}
                className="relative flex items-center border-b border-border/40"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex w-44 shrink-0 items-center gap-1.5 truncate pr-2 text-xs">
                  <span className="truncate" title={item.title}>
                    {item.title}
                  </span>
                </div>
                <div className="relative flex-1" style={{ minWidth: 480, height: ROW_HEIGHT }}>
                  {/* Barre */}
                  <div
                    className={cn(
                      "absolute top-1 h-5 rounded text-[10px] text-white",
                      ROADMAP_PHASE_COLORS[item.phase],
                      STATUS_OPACITY[item.status],
                    )}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      minWidth: 18,
                    }}
                    title={`${item.title} · ${ROADMAP_PHASE_LABELS[item.phase]} · ${duration} mois`}
                  >
                    <span className="ml-1 truncate">{duration}m</span>
                  </div>
                </div>
                {/* Méta */}
                <div className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[9px]">
                    I{item.impact}·C{item.complexity}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
