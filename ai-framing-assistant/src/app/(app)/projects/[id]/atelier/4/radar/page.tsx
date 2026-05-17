import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RadarChart } from "@/components/scoring/radar-chart";
import { Badge } from "@/components/ui/badge";
import { SCORECARD_AXES, SCORECARD_AXIS_LABELS, SCORECARD_AXIS_SHORT, type ScorecardAxis } from "@/types/atelier4";
import { computeAutoScorecard, loadAtelier4Snapshot } from "@/lib/engines/atelier4";

export default async function A4RadarPage(props: PageProps<"/projects/[id]/atelier/4/radar">) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();
  const results = computeAutoScorecard(snap);

  const axes = SCORECARD_AXES.map((a) => ({ key: a, label: a, short: SCORECARD_AXIS_SHORT[a] }));
  const series = [
    { label: "Effectif", values: results.map((r) => r.effective), color: "#0ea5e9", fillOpacity: 0.22 },
  ];
  const hasOverrides = results.some((r) => r.isOverride);
  if (hasOverrides) series.push({ label: "Auto", values: results.map((r) => r.auto), color: "#94a3b8", fillOpacity: 0.08 });

  return (
    <SectionShell
      phaseLabel="Phase B — Visualisations"
      title="Radar maturité (11 axes)"
      livrableRef="§12 du livrable atelier 4"
      intent="Vue radar des 11 axes scoring. Si overrides : superpose la version auto pour révéler les écarts."
      pourquoi={["Vue holistique = repérage immédiat des faiblesses.", "Forme du radar = profil du projet.", "Overrides vs auto = lectures différentes à expliquer."]}
      cherche={["Radar régulier = projet équilibré.", "Décrochage sur 1 axe = point à adresser.", "Écart auto/effectif justifié."]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,18rem)]">
        <div className="rounded-md border border-border bg-background p-4 text-foreground">
          <RadarChart axes={axes} series={series} size={400} />
          {hasOverrides ? (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Effectif</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Auto</span>
            </div>
          ) : null}
        </div>
        <div className="space-y-1.5">
          {results.map((r) => (
            <div key={r.axis} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2 text-xs">
              <span className="truncate">{SCORECARD_AXIS_LABELS[r.axis as ScorecardAxis] ?? r.axis}</span>
              <Badge variant="outline" className="shrink-0 text-[9px]">{r.effective}/5</Badge>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
