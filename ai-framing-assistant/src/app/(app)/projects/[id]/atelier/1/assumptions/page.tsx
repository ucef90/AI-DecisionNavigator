import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";
import { ASSUMPTION_STATUS_LABELS, ASSUMPTION_TYPE_LABELS, RISK_LEVEL_LABELS, type AssumptionStatus, type AssumptionType, type RiskLevel } from "@/types/atelier1";

const STATUS_COLOR = {
  UNVERIFIED: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  IN_PROGRESS: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20",
  VALIDATED: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  INVALIDATED: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
} as const;

export default async function AssumptionsPage(props: PageProps<"/projects/[id]/atelier/1/assumptions">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const critical = snap.assumptions.filter((a) => (a.riskIfWrong === "HIGH" || a.riskIfWrong === "CRITICAL") && a.status === "UNVERIFIED");

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Hypothèses projet"
      livrableRef="§9 du livrable atelier 1"
      intent="Expliciter ce qu'on TIENT POUR ACQUIS — et qu'il faut vérifier."
      pourquoi={[
        "Une hypothèse non explicitée est un risque caché.",
        "Une hypothèse non vérifiée à fort impact = risque CRITIQUE pour le projet.",
        "L'atelier 7 utilise les hypothèses critiques pour challenger la décision finale.",
      ]}
      cherche={[
        "≥ 3 hypothèses typées (business, data, technique, orga, réglo).",
        "Niveau de risque si fausse (LOW → CRITICAL).",
        "Plan de vérification pour chacune.",
      ]}
    >
      {critical.length > 0 ? (
        <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
          ⚠ <strong>{critical.length} hypothèse(s) critique(s) non vérifiée(s)</strong> — à investiguer en priorité.
        </div>
      ) : null}
      <ItemList
        items={snap.assumptions}
        empty="Aucune hypothèse explicitée."
        render={(a) => (
          <div key={a.id} className={cn("rounded-md border p-3", STATUS_COLOR[a.status as AssumptionStatus])}>
            <p className="text-sm">{a.statement}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <Badge variant="outline">{ASSUMPTION_TYPE_LABELS[a.assumptionType as AssumptionType] ?? a.assumptionType}</Badge>
              <Badge variant="outline">Risque si fausse : {RISK_LEVEL_LABELS[a.riskIfWrong as RiskLevel] ?? a.riskIfWrong}</Badge>
              <Badge variant="outline">{ASSUMPTION_STATUS_LABELS[a.status as AssumptionStatus] ?? a.status}</Badge>
            </div>
            {a.validationPlan ? <p className="mt-2 text-[11px] italic text-muted-foreground">Vérification : {a.validationPlan}</p> : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
