import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier4Snapshot } from "@/lib/engines/atelier4";

// §13 Matrice risques — 5x5 (probabilité × impact).
//
// On reprend les 10 axes risques scorés 1..5 dans RiskAssessment.
// On affiche un cartouche par axe positionné sur la matrice avec
// une heuristique simple :
//   - impact (Y)        = score brut du risque (1..5)
//   - probabilité (X)   = dérivée de la maîtrise (5 - mitigation_score)
// Le but est PÉDAGOGIQUE : voir d'un coup d'œil quels risques
// méritent une attention prioritaire.

type RiskItem = {
  axis: string;
  label: string;
  score: number;
  probability: number;
  impact: number;
};

const AXES: { axis: keyof RiskBindings; label: string }[] = [
  { axis: "rgpdRisk", label: "RGPD" },
  { axis: "sensitiveDataRisk", label: "Données sensibles" },
  { axis: "hallucinationRisk", label: "Hallucinations" },
  { axis: "biasRisk", label: "Biais" },
  { axis: "classificationRisk", label: "Erreur classification" },
  { axis: "autoDecisionRisk", label: "Décision automatisée" },
  { axis: "securityRisk", label: "Sécurité" },
  { axis: "vendorLockRisk", label: "Vendor lock-in" },
  { axis: "adoptionRisk", label: "Adoption" },
  { axis: "supervisionRisk", label: "Supervision insuffisante" },
];

type RiskBindings = {
  rgpdRisk: number | null;
  sensitiveDataRisk: number | null;
  hallucinationRisk: number | null;
  biasRisk: number | null;
  classificationRisk: number | null;
  autoDecisionRisk: number | null;
  securityRisk: number | null;
  vendorLockRisk: number | null;
  adoptionRisk: number | null;
  supervisionRisk: number | null;
};

export default async function RiskMatrixPage(
  props: PageProps<"/projects/[id]/atelier/4/risk-matrix">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const r = snap.riskAssessment as RiskBindings | null;
  const items: RiskItem[] = r
    ? AXES.map(({ axis, label }) => {
        const score = r[axis] ?? 0;
        // Heuristique : si le projet a un plan de mitigation et
        // beaucoup de validations humaines, on baisse la probabilité.
        const hasMitigation = Boolean(snap.riskAssessment?.mitigationPlan?.trim());
        const validations = snap.humanValidations.length;
        let probability = score; // par défaut, score brut
        if (hasMitigation) probability = Math.max(1, probability - 1);
        if (validations >= 2) probability = Math.max(1, probability - 1);
        return { axis, label, score, probability, impact: score };
      }).filter((it) => it.score > 0)
    : [];

  // Compose un index par cellule
  const grid: Record<string, RiskItem[]> = {};
  for (const it of items) {
    const key = `${it.probability}-${it.impact}`;
    if (!grid[key]) grid[key] = [];
    grid[key].push(it);
  }

  const totalScored = items.length;
  const criticalCount = items.filter((i) => i.impact >= 4 && i.probability >= 4).length;

  return (
    <SectionShell
      phaseLabel="Phase B — Visualisations"
      title="Matrice des risques"
      livrableRef="§13 du livrable atelier 4"
      intent="Visualiser les risques projet sur la matrice probabilité × impact pour prioriser les actions de mitigation."
      pourquoi={[
        "La matrice rend visible ce qui est CRITIQUE (haut-droite) vs ACCEPTABLE (bas-gauche).",
        "Elle force à challenger : si tous les risques sont en zone rouge → revoir le plan de mitigation.",
        "Elle prépare la suite : les risques rouges deviennent des actions du plan d'action atelier 7.",
      ]}
      cherche={[
        "Les risques en zone rouge (probabilité ≥ 4 ET impact ≥ 4) → action immédiate.",
        "Les risques en zone orange (un seul axe ≥ 4) → plan de mitigation.",
        "Les risques en zone verte (les deux axes ≤ 2) → surveillance suffit.",
        "Les risques non scorés → à compléter dans le wizard risques.",
      ]}
      pieges={[
        "Sous-estimer une probabilité parce qu'on a un plan : la matrice doit refléter la réalité AVANT mitigation, pas après.",
        "Oublier les risques d'adoption : un projet IA techniquement parfait peut être un échec d'usage.",
      ]}
      aside={
        <div className="space-y-3">
          <div className="rounded-md border border-foreground/15 bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Risques scorés
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {totalScored}/{AXES.length}
            </div>
          </div>
          <div className="rounded-md border border-rose-500/40 bg-rose-50/50 p-3 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
            <div className="text-[10px] uppercase tracking-wider opacity-80">
              Zone critique
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{criticalCount}</div>
            <p className="mt-1 text-[10px] opacity-80">risque(s) probabilité ≥ 4 ET impact ≥ 4</p>
          </div>
          <Link
            href={`/projects/${id}/wizard/risks`}
            className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background"
          >
            Compléter les risques →
          </Link>
        </div>
      }
    >
      {!r ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Aucun risque évalué pour l&apos;instant.{" "}
          <Link href={`/projects/${id}/wizard/risks`} className="underline">
            Ouvrir le wizard risques
          </Link>
          .
        </p>
      ) : (
        <RiskHeatmap grid={grid} />
      )}

      {/* Légende risques individuels */}
      {items.length > 0 ? (
        <div className="mt-6 grid gap-2 text-xs sm:grid-cols-2">
          {items
            .sort((a, b) => b.impact * b.probability - a.impact * a.probability)
            .map((it) => (
              <div
                key={it.axis}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2",
                  cellColor(it.probability, it.impact, true),
                )}
              >
                <div className="font-semibold">{it.label}</div>
                <div className="text-[11px] opacity-80">
                  Prob {it.probability}/5 · Imp {it.impact}/5
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

function cellColor(prob: number, imp: number, withBorder = false): string {
  const c = prob * imp;
  const border = withBorder ? "border" : "";
  if (c >= 16) return `${border} border-rose-500/40 bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100`;
  if (c >= 12) return `${border} border-orange-500/40 bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100`;
  if (c >= 6) return `${border} border-amber-500/40 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100`;
  if (c >= 3) return `${border} border-lime-500/40 bg-lime-100 text-lime-900 dark:bg-lime-950/40 dark:text-lime-100`;
  return `${border} border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100`;
}

function RiskHeatmap({ grid }: { grid: Record<string, { label: string }[]> }) {
  // Axes : Y = impact (5 en haut, 1 en bas), X = probabilité (1 à gauche, 5 à droite)
  const yLabels = [5, 4, 3, 2, 1];
  const xLabels = [1, 2, 3, 4, 5];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th />
            {xLabels.map((x) => (
              <th key={x} className="text-center text-[10px] text-muted-foreground">
                Prob {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((y) => (
            <tr key={y}>
              <th className="pr-2 text-right text-[10px] text-muted-foreground">Imp {y}</th>
              {xLabels.map((x) => {
                const cell = grid[`${x}-${y}`] ?? [];
                return (
                  <td
                    key={`${x}-${y}`}
                    className={cn("h-16 rounded-md p-1 align-top", cellColor(x, y))}
                  >
                    <div className="flex h-full flex-col gap-0.5">
                      {cell.length === 0 ? (
                        <span className="m-auto opacity-30 text-[10px]">·</span>
                      ) : (
                        cell.map((it, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="truncate border-foreground/30 bg-background/80 text-[9px]"
                          >
                            {it.label}
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
