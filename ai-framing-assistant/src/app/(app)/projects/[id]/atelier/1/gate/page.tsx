import { notFound } from "next/navigation";
import { CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeGateCriteria, loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function GateA1Page(props: PageProps<"/projects/[id]/atelier/1/gate">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  const criteria = computeGateCriteria(snap);
  const metCount = criteria.filter((c) => c.met).length;
  const verdict = (snap.gate?.verdict ?? "NOT_READY") as "NOT_READY" | "READY" | "OVERRIDE";

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Gate atelier 2"
      livrableRef="§18 — gate de passage à l'atelier 2"
      intent="5 critères go/no-go pour passer à l'atelier IA vs automatisation."
      pourquoi={[
        "Sans gate, on passe à l'atelier 2 sur un cadrage incomplet = boucle d'échec.",
        "Le gate est explicite — pas une décision tacite.",
        "OVERRIDE possible avec justification (audit trail).",
      ]}
      cherche={[
        "Tous les critères au vert (5/5) → READY.",
        "Si critères manquants : combler avant de bouger.",
        "OVERRIDE seulement si contrainte calendrier + justification écrite.",
      ]}
    >
      <div className="space-y-5">
        <div className={cn("rounded-md border p-4",
          verdict === "READY" ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" :
          verdict === "OVERRIDE" ? "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100" :
          "border-foreground/20 bg-muted/30",
        )}>
          <div className="flex items-start gap-3">
            {verdict === "READY" ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : verdict === "OVERRIDE" ? <ShieldAlert className="mt-0.5 h-5 w-5" /> : <AlertTriangle className="mt-0.5 h-5 w-5" />}
            <div>
              <div className="text-sm font-semibold">
                {verdict === "READY" ? "Prêt pour l'atelier 2" : verdict === "OVERRIDE" ? "Passage forcé (override)" : "Pas encore prêt"}
              </div>
              <p className="text-xs opacity-80">{metCount}/{criteria.length} critères validés.</p>
              {snap.gate?.decidedBy ? <p className="text-[10px] opacity-70">Décidé par : {snap.gate.decidedBy}{snap.gate.decidedAt ? ` — ${new Date(snap.gate.decidedAt).toISOString().slice(0, 10)}` : ""}</p> : null}
            </div>
          </div>
        </div>

        <ul className="space-y-1.5">
          {criteria.map((c) => (
            <li key={c.id} className={cn("flex items-start gap-3 rounded-md border px-3 py-2 text-sm", c.met ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-border bg-background")}>
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", c.met ? "bg-emerald-500" : "bg-muted")} />
              <div className="flex-1">
                <div className={c.met ? "text-foreground" : "text-foreground/70"}>{c.label}</div>
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
