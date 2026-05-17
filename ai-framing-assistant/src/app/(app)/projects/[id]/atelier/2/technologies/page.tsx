import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { TECH_FAMILY, TECH_LABELS, TECH_MATURITY_LABELS, type TechCode, type TechMaturity } from "@/types/atelier2";

export default async function A2TechnologiesPage(props: PageProps<"/projects/[id]/atelier/2/technologies">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase D — Architecture cible"
      title="Technologies candidates"
      livrableRef="§9 du livrable atelier 2"
      intent="Lister les briques techno potentielles avec maturité et fit projet."
      pourquoi={[
        "Chaque techno répond à un besoin précis (pas de techno-pour-techno).",
        "Maturité variable : MATURE = production OK, EXPERIMENTAL = risque.",
        "Le fit score (1-5) priorise les choix architecture cible.",
      ]}
      cherche={[
        "≥ 3 technos candidates avec purpose explicite.",
        "Maturité réaliste (pas tout MATURE…).",
        "Fit score justifié par le contexte projet.",
      ]}
    >
      <ItemList
        items={snap.technologies}
        empty="Aucune technologie candidate listée."
        render={(t) => (
          <div key={t.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{TECH_LABELS[t.tech as TechCode] ?? t.tech}</span>
                  <Badge variant="outline" className="text-[9px]">{TECH_FAMILY[t.tech as TechCode] ?? "—"}</Badge>
                </div>
                <p className="mt-1 text-xs">{t.purpose}</p>
                {t.notes ? <p className="mt-1 text-[11px] italic text-muted-foreground">{t.notes}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-[9px]">{TECH_MATURITY_LABELS[t.maturity as TechMaturity] ?? t.maturity}</Badge>
                <Badge variant="outline" className="text-[9px]">Fit {t.fitScore}/5</Badge>
              </div>
            </div>
          </div>
        )}
      />
    </SectionShell>
  );
}
