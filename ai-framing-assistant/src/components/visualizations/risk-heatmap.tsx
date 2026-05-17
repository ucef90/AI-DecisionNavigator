// Heatmap 5×5 réutilisable (probabilité × impact).
// Utilisé par atelier 4 (matrice risques) et atelier 6 (cockpit).

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RiskHeatmapPoint = {
  label: string;
  impact: number;       // 1..5
  probability: number;  // 1..5
  /** Optionnel : libellé court à afficher dans la cellule (sinon label tronqué) */
  short?: string;
};

export function RiskHeatmap({ points, compact }: { points: RiskHeatmapPoint[]; compact?: boolean }) {
  const yLabels = [5, 4, 3, 2, 1];
  const xLabels = [1, 2, 3, 4, 5];
  const grid: Record<string, RiskHeatmapPoint[]> = {};
  for (const p of points) {
    const key = `${p.probability}-${p.impact}`;
    if (!grid[key]) grid[key] = [];
    grid[key].push(p);
  }

  const cellHeight = compact ? "h-10" : "h-16";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th />
            {xLabels.map((x) => (
              <th key={x} className="text-center text-[10px] font-normal text-muted-foreground">
                Prob {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((y) => (
            <tr key={y}>
              <th className="pr-2 text-right text-[10px] font-normal text-muted-foreground">
                Imp {y}
              </th>
              {xLabels.map((x) => {
                const cell = grid[`${x}-${y}`] ?? [];
                return (
                  <td
                    key={`${x}-${y}`}
                    className={cn(cellHeight, "rounded-md p-1 align-top", cellColor(x, y))}
                  >
                    <div className="flex h-full flex-col gap-0.5 overflow-hidden">
                      {cell.length === 0 ? (
                        <span className="m-auto text-[10px] opacity-30">·</span>
                      ) : (
                        cell.map((it, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="truncate border-foreground/30 bg-background/80 text-[9px]"
                            title={it.label}
                          >
                            {compact ? "•" : (it.short ?? it.label)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function cellColor(prob: number, imp: number): string {
  const c = prob * imp;
  if (c >= 16) return "border border-rose-500/40 bg-rose-100 dark:bg-rose-950/40";
  if (c >= 12) return "border border-orange-500/40 bg-orange-100 dark:bg-orange-950/40";
  if (c >= 6) return "border border-amber-500/40 bg-amber-100 dark:bg-amber-950/40";
  if (c >= 3) return "border border-lime-500/40 bg-lime-100 dark:bg-lime-950/40";
  return "border border-emerald-500/40 bg-emerald-100 dark:bg-emerald-950/40";
}
