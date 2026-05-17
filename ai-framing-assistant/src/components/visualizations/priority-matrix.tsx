// Matrice de priorisation 4 quadrants (impact × complexité).
// Quick wins (haut-gauche), Major projects (haut-droite),
// Fill-in (bas-gauche), À éviter (bas-droite).

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PRIORITY_QUADRANT_COLORS,
  PRIORITY_QUADRANT_LABELS,
  classifyQuadrant,
} from "@/types/atelier7";

export type PriorityPoint = {
  id: string;
  title: string;
  impact: number;     // 1..5
  complexity: number; // 1..5
};

export function PriorityMatrix({ items }: { items: PriorityPoint[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Aucun item à positionner. La matrice se construit à partir des items de roadmap.
      </p>
    );
  }

  // Group by cell
  const cells = new Map<string, PriorityPoint[]>();
  for (const p of items) {
    const key = `${p.complexity}-${p.impact}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key)!.push(p);
  }

  // Stats par quadrant
  const counts: Record<ReturnType<typeof classifyQuadrant>, number> = {
    QUICK_WIN: 0,
    MAJOR_PROJECT: 0,
    FILL_IN: 0,
    AVOID: 0,
  };
  for (const p of items) counts[classifyQuadrant(p.impact, p.complexity)]++;

  const yLabels = [5, 4, 3, 2, 1]; // impact (haut)
  const xLabels = [1, 2, 3, 4, 5]; // complexité (gauche → droite)

  return (
    <div className="space-y-3">
      {/* Quadrants stats */}
      <div className="grid gap-2 sm:grid-cols-4">
        {(["QUICK_WIN", "MAJOR_PROJECT", "FILL_IN", "AVOID"] as const).map((q) => (
          <div
            key={q}
            className={cn("rounded-md border px-2.5 py-2 text-xs", PRIORITY_QUADRANT_COLORS[q])}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-80">
              {PRIORITY_QUADRANT_LABELS[q]}
            </div>
            <div className="text-lg font-semibold tabular-nums">{counts[q]}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-end gap-2">
          {/* Y axis label */}
          <div className="flex flex-col items-center justify-center pr-2 text-[10px] text-muted-foreground" style={{ height: 320, transform: "rotate(0deg)" }}>
            <div className="rotate-180" style={{ writingMode: "vertical-rl" }}>
              Impact ↑
            </div>
          </div>

          <table className="border-separate border-spacing-1 text-xs">
            <tbody>
              {yLabels.map((y) => (
                <tr key={y}>
                  <th className="pr-2 text-right text-[10px] font-normal text-muted-foreground">
                    {y}
                  </th>
                  {xLabels.map((x) => {
                    const cell = cells.get(`${x}-${y}`) ?? [];
                    const q = classifyQuadrant(y, x);
                    return (
                      <td
                        key={`${x}-${y}`}
                        className={cn(
                          "h-14 w-24 rounded-md p-1 align-top",
                          PRIORITY_QUADRANT_COLORS[q],
                        )}
                      >
                        <div className="flex h-full flex-col gap-0.5 overflow-hidden">
                          {cell.length === 0 ? (
                            <span className="m-auto text-[10px] opacity-30">·</span>
                          ) : (
                            cell.map((it) => (
                              <Badge
                                key={it.id}
                                variant="outline"
                                className="truncate border-foreground/30 bg-background/80 text-[9px]"
                                title={it.title}
                              >
                                {it.title}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th />
                {xLabels.map((x) => (
                  <th key={x} className="text-center text-[10px] font-normal text-muted-foreground">
                    {x}
                  </th>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ml-12 mt-1 text-center text-[10px] text-muted-foreground">
          Complexité →
        </div>
      </div>
    </div>
  );
}
