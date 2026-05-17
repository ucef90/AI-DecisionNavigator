import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  KPI_CATEGORY_LABELS,
  KPI_FREQUENCY_LABELS,
  type KpiCategory,
  type KpiFrequency,
} from "@/types/atelier6";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

const CATEGORY_COLOR: Record<KpiCategory, string> = {
  PERFORMANCE: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20",
  QUALITY: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  DRIFT: "border-violet-500/40 bg-violet-50/40 dark:bg-violet-950/20",
  SECURITY: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  INCIDENT: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
  USAGE: "border-border bg-muted/30",
};

export default async function PilotageSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/pilotage">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();
  const kpis = snap.a6.monitoringKpis;

  // Group by category
  const byCategory = new Map<KpiCategory, typeof kpis>();
  for (const k of kpis) {
    const cat = k.category as KpiCategory;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(k);
  }

  return (
    <SectionShell
      phaseLabel="Phase D — Pilotage stratégique"
      title="Pilotage & KPI stratégiques"
      livrableRef="§7 du livrable atelier 7"
      intent="Cockpit KPI à surveiller en exploitation IA — vue consolidée du monitoring atelier 6."
      pourquoi={[
        "Le pilotage IA continue APRÈS le déploiement — c'est ce qui distingue un POC d'un projet réussi.",
        "Les KPI doivent être suivis à la bonne fréquence (REALTIME → MONTHLY selon le sujet).",
        "Sans seuil d'alerte explicite, les dérives passent inaperçues.",
      ]}
      cherche={[
        "Au moins 1 KPI par catégorie (performance/qualité/dérive/sécurité/incident/usage).",
        "Des seuils d'alerte définis et un responsable nommé.",
        "Une fréquence cohérente avec la criticité.",
        "Des KPI alignés avec les objectifs de l'atelier 1.",
      ]}
    >
      {kpis.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
          Aucun KPI défini.{" "}
          <Link href={`/projects/${id}/atelier/6/cockpit`} className="underline">
            Compléter atelier 6 →
          </Link>
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-2 sm:grid-cols-4">
            <KpiCard label="KPI total" value={kpis.length} helper="à monitorer" />
            <KpiCard label="Catégories couvertes" value={byCategory.size} unit="/6" helper="diversité monitoring" tone={byCategory.size >= 4 ? "good" : "warn"} />
            <KpiCard label="Avec seuil d'alerte" value={kpis.filter((k) => k.alertThreshold).length} helper="alertes prêtes" />
            <KpiCard label="Avec responsable" value={kpis.filter((k) => k.responsibleRole).length} helper="ownership défini" tone={kpis.filter((k) => k.responsibleRole).length === kpis.length ? "good" : "warn"} />
          </div>

          {Array.from(byCategory.entries()).map(([cat, list]) => (
            <div key={cat} className={cn("rounded-md border p-4", CATEGORY_COLOR[cat])}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">
                {KPI_CATEGORY_LABELS[cat]} ({list.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((k) => (
                  <div key={k.id} className="rounded-md border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{k.name}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {KPI_FREQUENCY_LABELS[k.frequency as KpiFrequency]}
                          {k.responsibleRole ? ` · ${k.responsibleRole}` : ""}
                        </div>
                      </div>
                      {k.targetValue ? (
                        <Badge variant="outline" className="text-[10px]">
                          🎯 {k.targetValue}{k.unit ? ` ${k.unit}` : ""}
                        </Badge>
                      ) : null}
                    </div>
                    {k.alertThreshold ? (
                      <div className="mt-2 rounded bg-rose-50/40 px-2 py-1 text-[10px] text-rose-900 dark:bg-rose-950/20 dark:text-rose-200">
                        ⚠ Alerte si {k.alertThreshold}{k.unit ? ` ${k.unit}` : ""}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
