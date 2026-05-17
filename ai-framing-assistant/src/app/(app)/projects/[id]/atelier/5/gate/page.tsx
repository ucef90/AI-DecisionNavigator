import { notFound } from "next/navigation";
import { CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeA5Gate, loadAtelier5Snapshot } from "@/lib/engines/atelier5";

export default async function A5GatePage(props: PageProps<"/projects/[id]/atelier/5/gate">) {
  const { id } = await props.params;
  const snap = await loadAtelier5Snapshot(id);
  if (!snap) notFound();
  const criteria = computeA5Gate(snap);
  const metCount = criteria.filter((c) => c.met).length;
  const verdict = (snap.gate?.verdict ?? "NOT_READY") as "NOT_READY" | "READY" | "OVERRIDE";

  return (
    <SectionShell
      phaseLabel="Phase E — Gate"
      title="Gate atelier 6 (gouvernance)"
      livrableRef="Gate de sortie atelier 5"
      intent="5 critères pour passer à l'atelier gouvernance."
      pourquoi={["Sans cartographie complète, pas de gouvernance solide.", "Le gate force l'annotation des nœuds critiques."]}
      cherche={["≥ 4 couches actives.", "≥ 2 couches annotées.", "Synthèse rédigée."]}
    >
      <div className="space-y-5">
        <div className={cn("rounded-md border p-4",
          verdict === "READY" ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40" :
          verdict === "OVERRIDE" ? "border-amber-500/40 bg-amber-50 dark:bg-amber-950/40" :
          "border-foreground/20 bg-muted/30",
        )}>
          <div className="flex items-start gap-3">
            {verdict === "READY" ? <CheckCircle2 className="h-5 w-5" /> : verdict === "OVERRIDE" ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <div>
              <div className="text-sm font-semibold">
                {verdict === "READY" ? "Prêt pour l'atelier 6" : verdict === "OVERRIDE" ? "Passage forcé" : "Pas encore prêt"}
              </div>
              <p className="text-xs opacity-80">{metCount}/{criteria.length} critères validés.</p>
            </div>
          </div>
        </div>
        <ul className="space-y-1.5">
          {criteria.map((c) => (
            <li key={c.id} className={cn("flex items-start gap-3 rounded-md border px-3 py-2 text-sm", c.met ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-border")}>
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", c.met ? "bg-emerald-500" : "bg-muted")} />
              <div className="flex-1">
                <div className={c.met ? "" : "text-foreground/70"}>{c.label}</div>
                {!c.met && c.why ? <div className="mt-0.5 text-[11px] text-muted-foreground">{c.why}</div> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">{c.met ? "OK" : "—"}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
