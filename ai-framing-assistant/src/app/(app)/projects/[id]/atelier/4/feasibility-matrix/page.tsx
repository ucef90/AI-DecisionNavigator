import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { RadarChart } from "@/components/scoring/radar-chart";
import { cn } from "@/lib/utils";
import { loadAtelier4Snapshot } from "@/lib/engines/atelier4";

// §14 Matrice faisabilité — vue radar 5 axes
//   - faisabilité technique
//   - faisabilité organisationnelle
//   - faisabilité réglementaire
//   - ressources
//   - données
//
// On lit FeasibilityAssessment (atelier 3). Si manquant, on
// affiche un placeholder + lien deep-link.

type FeasibilityRow = { key: string; label: string; value: number; short: string };

export default async function FeasibilityMatrixPage(
  props: PageProps<"/projects/[id]/atelier/4/feasibility-matrix">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const f = snap.feasibility;
  const rows: FeasibilityRow[] = [
    { key: "tech", short: "Tech.", label: "Faisabilité technique", value: f?.technicallyFeasible ?? 0 },
    { key: "orga", short: "Orga.", label: "Faisabilité organisationnelle", value: f?.organizationallyFeasible ?? 0 },
    { key: "reg", short: "Réglo.", label: "Faisabilité réglementaire", value: f?.regulatorilyFeasible ?? 0 },
    { key: "resources", short: "Resso.", label: "Ressources", value: f?.resourcesAvailable ?? 0 },
    { key: "data", short: "Data", label: "Données", value: f?.dataAvailable ?? 0 },
  ];
  const scored = rows.filter((r) => r.value > 0);
  const avg = scored.length ? scored.reduce((s, r) => s + r.value, 0) / scored.length : 0;
  const overall: "LOW" | "MEDIUM" | "HIGH" =
    avg >= 4 ? "HIGH" : avg >= 2.5 ? "MEDIUM" : avg > 0 ? "LOW" : "LOW";

  const radarAxes = rows.map((r) => ({ key: r.key, label: r.label, short: r.short }));
  const radarSeries = [
    {
      label: "Faisabilité",
      values: rows.map((r) => r.value),
      color: "#10b981",
      fillOpacity: 0.22,
    },
  ];

  return (
    <SectionShell
      phaseLabel="Phase B — Visualisations"
      title="Matrice de faisabilité"
      livrableRef="§14 du livrable atelier 4"
      intent="Visualiser les 5 axes de faisabilité simultanément pour repérer les contraintes bloquantes."
      pourquoi={[
        "Un projet peut être techniquement faisable mais organisationnellement bloqué — la vue d'ensemble est essentielle.",
        "Le radar identifie immédiatement le point faible : c'est lui qui détermine la décision (POC ou STUDY).",
        "Cette vue alimente directement la synthèse et la décision recommandée.",
      ]}
      cherche={[
        "Le SCORE LE PLUS BAS — c'est le maillon faible qui conditionne la faisabilité globale.",
        "Les axes non scorés (0) — à compléter dans l'atelier 3 (feasibility).",
        "L'écart entre axes : un radar homogène est plus rassurant qu'un radar très déséquilibré.",
      ]}
      pieges={[
        "Ne regarder QUE la faisabilité technique : un projet IA réussit ou échoue souvent sur l'organisationnel.",
        "Confondre faisabilité et appétence : on peut avoir les moyens techniques mais pas l'envie organisationnelle.",
      ]}
      aside={
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-md border p-3 text-center",
              overall === "HIGH"
                ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                : overall === "MEDIUM"
                  ? "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                  : "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100",
            )}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-80">
              Faisabilité globale
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {overall === "HIGH" ? "Élevée" : overall === "MEDIUM" ? "Moyenne" : "Faible"}
            </div>
            <div className="mt-1 text-[10px] opacity-80">
              Moyenne : {avg ? avg.toFixed(1) : "—"}/5
            </div>
          </div>
          <Link
            href={`/projects/${id}/atelier/3/feasibility`}
            className="block rounded-md border border-foreground/90 bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background"
          >
            Compléter la faisabilité →
          </Link>
        </div>
      }
    >
      {scored.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Aucun axe de faisabilité scoré.{" "}
          <Link href={`/projects/${id}/atelier/3/feasibility`} className="underline">
            Aller à la faisabilité (atelier 3)
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,18rem)]">
          <div className="rounded-md border border-border bg-background p-4 text-foreground">
            <RadarChart axes={radarAxes} series={radarSeries} size={300} />
          </div>
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2.5 text-xs"
              >
                <div className="font-semibold">{r.label}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground tabular-nums">{r.value || "—"}/5</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full",
                        r.value === 0
                          ? "bg-transparent"
                          : r.value <= 2
                            ? "bg-rose-500"
                            : r.value <= 3
                              ? "bg-amber-500"
                              : "bg-emerald-500",
                      )}
                      style={{ width: `${(r.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {f?.blockingFactors ? (
              <div className="mt-3 rounded-md border border-rose-500/30 bg-rose-50/40 p-2.5 text-[11px] dark:bg-rose-950/20">
                <div className="font-semibold text-rose-800 dark:text-rose-200">Bloquants</div>
                <p className="mt-0.5 whitespace-pre-line text-foreground/80">{f.blockingFactors}</p>
              </div>
            ) : null}
            {f?.enablers ? (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-50/40 p-2.5 text-[11px] dark:bg-emerald-950/20">
                <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Leviers
                </div>
                <p className="mt-0.5 whitespace-pre-line text-foreground/80">{f.enablers}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </SectionShell>
  );
}
