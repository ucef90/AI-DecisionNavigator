import { notFound } from "next/navigation";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/data-block";
import { detectCriticalPoints, loadAtelier3Snapshot } from "@/lib/engines/atelier3";

const SEV_COLOR = {
  LOW: "border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20",
  MEDIUM: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  HIGH: "border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20",
  CRITICAL: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

const SEV_ICON = { LOW: Info, MEDIUM: Info, HIGH: AlertTriangle, CRITICAL: ShieldAlert };

export default async function A3CriticalPointsPage(props: PageProps<"/projects/[id]/atelier/3/critical-points">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const points = detectCriticalPoints(snap);

  return (
    <SectionShell
      phaseLabel="Phase D — Synthèses & opportunités"
      title="Points critiques (détection cross-source)"
      livrableRef="§16 du livrable atelier 3"
      intent="Points détectés automatiquement en croisant les données des ateliers 1, 2, 3."
      pourquoi={["Le moteur détecte les incohérences invisibles à l'œil nu.", "8 patterns scannés (data, DPO, IA-validation, hypothèses, deps…).", "Critique = à adresser avant POC."]}
      cherche={["Aucun CRITICAL (sinon adresser tout de suite).", "HIGH ≤ 2 idéalement.", "Réponses aux fixHints."]}
    >
      {points.length === 0 ? <EmptyState message="Aucun point critique détecté." /> : (
        <div className="space-y-2">
          {points.map((p) => {
            const Icon = SEV_ICON[p.severity];
            return (
              <div key={p.id} className={cn("rounded-md border p-3", SEV_COLOR[p.severity])}>
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.title}</span>
                      <Badge variant="outline" className="text-[9px]">{p.severity}</Badge>
                    </div>
                    <p className="mt-1 text-xs">{p.detail}</p>
                    <p className="mt-1 text-[10px] italic text-muted-foreground">Source : {p.source}</p>
                    {p.fixHint ? <p className="mt-1 text-[11px]"><strong>Recommandation :</strong> {p.fixHint}</p> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
