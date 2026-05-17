import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { A2_PROFILE_LABELS, type Atelier2Profile } from "@/types/atelier2";
import { loadAtelier2Snapshot, recommendProfile } from "@/lib/engines/atelier2";

export default async function A2SynthesisPage(props: PageProps<"/projects/[id]/atelier/2/synthesis">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();
  const s = snap.synthesis;
  const reco = recommendProfile(snap);

  return (
    <SectionShell
      phaseLabel="Phase E — Synthèse"
      title="Synthèse finale atelier 2"
      livrableRef="§16 du livrable atelier 2"
      intent="Synthèse exécutive : besoin réel, complexité, profil, archi recommandée."
      pourquoi={[
        "Page de présentation pour le COPIL.",
        "Cristallise la décision IA vs auto vs humain.",
        "Sert d'input à l'atelier 3 et au scoring atelier 4.",
      ]}
      cherche={[
        "Profil clairement défini.",
        "Architecture cible esquissée.",
        "Recommandation finale chiffrée.",
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-md border border-foreground/15 bg-muted/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Profil pressenti (moteur)</div>
          <div className="mt-1 text-lg font-semibold">{A2_PROFILE_LABELS[reco.profile]}</div>
          <p className="mt-1 text-xs text-muted-foreground">{reco.rationale}</p>
          {reco.techMixHint && reco.techMixHint.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {reco.techMixHint.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
            </div>
          ) : null}
        </div>

        {!s ? <EmptyState message="Synthèse non rédigée." /> : (
          <div className="space-y-3">
            <DataBlock title="Besoin réel" body={s.realNeed} />
            <div className="grid gap-3 sm:grid-cols-3">
              <DataBlock title="Complexité" body={s.complexityLevel} />
              <DataBlock title="Gouvernance" body={s.governanceLevel} />
              <DataBlock title="Profil retenu" body={s.recommendedProfile ? A2_PROFILE_LABELS[s.recommendedProfile as Atelier2Profile] : null} />
            </div>
            <DataBlock title="Synthèse besoins intelligence" body={s.intelligenceSummary} />
            <DataBlock title="Architecture recommandée" body={s.recommendedArchitecture} />
            <DataBlock title="Recommandation finale" body={s.finalRecommendation} />
            <DataBlock title="Points à approfondir" body={s.openPoints} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
