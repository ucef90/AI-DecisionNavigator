import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { StatRow } from "@/components/common/data-block";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function BusinessMapPage(props: PageProps<"/projects/[id]/atelier/1/business-map">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Cartographie métier (vue agrégée)"
      livrableRef="§3 du livrable atelier 1"
      intent="Vue d'ensemble : acteurs + activités + flux + outils + irritants."
      pourquoi={[
        "Cette vue agrège ce qui a été collecté en acteurs + workflow + irritants.",
        "Elle sert de support visuel COPIL/atelier (1 écran = compréhension).",
        "Vue interactive complète disponible dans l'atelier 5 (cartographie IA).",
      ]}
      cherche={[
        "Ratio MANUAL / AUTOMATED des étapes.",
        "Densité d'acteurs (qui fait quoi).",
        "Concentration des irritants (où ça fait mal).",
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatRow label="Acteurs" value={snap.actors.length} accent={snap.actors.length >= 3 ? "good" : "warn"} />
          <StatRow label="Étapes workflow" value={snap.processSteps.length} accent={snap.processSteps.length >= 3 ? "good" : "warn"} />
          <StatRow label="Irritants" value={snap.irritants.length} accent={snap.irritants.length >= 3 ? "good" : "warn"} />
          <StatRow label="Impacts" value={snap.impacts.length} accent={snap.impacts.length >= 3 ? "good" : "warn"} />
        </div>

        <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Snapshot acteurs principaux
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {snap.actors.slice(0, 8).map((a) => (
              <Badge key={a.id} variant="outline" className="text-[10px]">
                {a.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Snapshot workflow
          </h3>
          <ol className="ml-5 list-decimal space-y-0.5 text-xs">
            {snap.processSteps.slice(0, 8).map((s) => (
              <li key={s.id}>{s.name} <span className="text-[10px] text-muted-foreground">({s.mode})</span></li>
            ))}
            {snap.processSteps.length > 8 ? <li className="italic text-muted-foreground">+{snap.processSteps.length - 8} étapes</li> : null}
          </ol>
        </div>

        <Link href={`/projects/${id}/atelier/5/overview`} className="inline-flex items-center gap-2 rounded-md border border-foreground/20 bg-background px-3 py-2 text-xs font-medium hover:border-foreground/40">
          Cartographie complète atelier 5 <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </SectionShell>
  );
}
