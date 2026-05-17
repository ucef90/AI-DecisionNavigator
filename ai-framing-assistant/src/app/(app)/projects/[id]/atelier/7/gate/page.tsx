import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeA7Gate, loadAtelier7Snapshot } from "@/lib/engines/atelier7";

export default async function FinalGateSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/gate">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const criteria = computeA7Gate(snap);
  const metCount = criteria.filter((c) => c.met).length;
  const allMet = metCount === criteria.length;
  const verdict = (snap.gate?.verdict ?? "NOT_READY") as "NOT_READY" | "CLOSED" | "OVERRIDE";

  return (
    <SectionShell
      phaseLabel="Phase E — Clôture du framework"
      title="Clôture du framework de cadrage IA"
      livrableRef="Gate final atelier 7"
      intent="Vérifier que tout est en place pour clôturer le cadrage et passer en exécution."
      pourquoi={[
        "Le gate final ferme officiellement le cadrage IA.",
        "Sans clôture, le projet flotte entre cadrage et exécution.",
        "Le verdict CLOSED autorise le passage en run projet (POC, MVP, etc.).",
      ]}
      cherche={[
        "Les 6 critères validés (vision, roadmap, industrialisation, décision, sponsor, livrable).",
        "Si un critère manque : compléter avant de fermer.",
        "OVERRIDE possible avec justification écrite (audit trail).",
      ]}
    >
      <div className="space-y-5">
        {/* Banner verdict */}
        <div
          className={cn(
            "rounded-md border p-4",
            verdict === "CLOSED"
              ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
              : verdict === "OVERRIDE"
                ? "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                : "border-foreground/20 bg-muted/30",
          )}
        >
          <div className="flex items-start gap-3">
            {verdict === "CLOSED" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
            ) : verdict === "OVERRIDE" ? (
              <ShieldAlert className="mt-0.5 h-5 w-5" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {verdict === "CLOSED"
                  ? "Framework clôturé — projet officiellement en exécution"
                  : verdict === "OVERRIDE"
                    ? "Clôture forcée (override)"
                    : "Pas encore prêt à clôturer"}
              </div>
              <p className="text-xs opacity-80">
                {metCount} critère(s) sur {criteria.length} validé(s).
              </p>
              {snap.gate?.decidedBy ? (
                <p className="text-[10px] opacity-70">Décidé par : {snap.gate.decidedBy}{snap.gate.decidedAt ? ` — ${new Date(snap.gate.decidedAt).toISOString().slice(0, 10)}` : ""}</p>
              ) : null}
              {snap.gate?.overrideNotes ? (
                <p className="mt-1 text-[11px] italic">{snap.gate.overrideNotes}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Critères */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            6 critères de clôture
          </h3>
          <ul className="space-y-1.5">
            {criteria.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "flex items-start gap-3 rounded-md border px-3 py-2 text-sm",
                  c.met
                    ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-border bg-background",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    c.met ? "bg-emerald-500" : "bg-muted",
                  )}
                />
                <div className="flex-1">
                  <div className={cn(c.met ? "text-foreground" : "text-foreground/70")}>{c.label}</div>
                  {!c.met && c.why ? (
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.why}</div>
                  ) : null}
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {c.met ? "OK" : "—"}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        {/* Next steps */}
        <div className="rounded-md border border-dashed border-foreground/20 bg-muted/30 p-4 text-sm">
          {allMet ? (
            <>
              <div className="font-semibold">Prochaine étape</div>
              <p className="text-xs text-muted-foreground">
                Le framework de cadrage est complet. Tu peux clore officiellement le projet et
                passer en mode exécution selon la décision et la roadmap définies.
              </p>
            </>
          ) : (
            <>
              <div className="font-semibold">Critères restants à valider</div>
              <ul className="mt-1 ml-4 list-disc text-xs text-muted-foreground">
                {criteria
                  .filter((c) => !c.met)
                  .map((c) => (
                    <li key={c.id}>{c.label}{c.why ? ` — ${c.why}` : ""}</li>
                  ))}
              </ul>
            </>
          )}
          <div className="mt-2 flex gap-2">
            <Link
              href={`/projects/${id}/atelier/7/deliverable`}
              className="inline-flex items-center gap-1 rounded-md border border-foreground/30 bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground/60"
            >
              Exporter le dossier
            </Link>
            <Link
              href={`/projects/${id}/atelier/7/executive-cockpit`}
              className="inline-flex items-center gap-1 rounded-md border border-foreground/30 bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground/60"
            >
              Cockpit exécutif
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
