import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { PriorityEditor } from "@/components/atelier4/priority-editor";
import { type PriorityLevel } from "@/types/atelier4";
import { savePriority } from "@/lib/actions/atelier4/synthesis";
import {
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendPriority,
} from "@/lib/engines/atelier4";

// §17 Niveau de priorité — sélecteur + auto-suggestion + justification.
export default async function PrioritySectionPage(
  props: PageProps<"/projects/[id]/atelier/4/priority">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const results = computeAutoScorecard(snap);
  const suggested = recommendPriority(snap, results);

  const initial = {
    level: ((snap.priority?.level as PriorityLevel | null) ?? "") as PriorityLevel | "",
    justification: snap.priority?.justification ?? "",
    notes: snap.priority?.notes ?? "",
  };

  async function save(data: { level: PriorityLevel | ""; justification: string; notes: string }) {
    "use server";
    await savePriority(id, data);
  }

  return (
    <SectionShell
      phaseLabel="Phase C — Priorisation"
      title="Niveau de priorité projet"
      livrableRef="§17 du livrable atelier 4"
      intent="Positionner le projet sur l'échelle stratégique → dé-priorisé, pour aider la direction à arbitrer le portefeuille."
      pourquoi={[
        "Sans niveau de priorité explicite, tous les projets se disputent les ressources de façon implicite.",
        "Le moteur propose un niveau basé sur le score + le profil IA, mais la décision finale est stratégique.",
        "C'est une info clé pour la direction métier et la DSI lors des arbitrages de roadmap.",
      ]}
      cherche={[
        "STRATÉGIQUE = projet pilier de la transformation — embarquement maximal.",
        "HAUTE = à lancer rapidement, sponsor engagé, conditions réunies.",
        "MOYENNE = POC à cadrer, conditions à confirmer.",
        "BASSE = étude complémentaire requise avant tout investissement.",
        "DÉ-PRIORISÉ = projet immature ou inopportun — reporter ou abandonner.",
      ]}
      pieges={[
        "Mettre tout en STRATÉGIQUE : la priorisation perd son sens si on ne sait pas dire non.",
        "Justifier la priorité par la techno (« on veut faire du LLM ») : critère métier uniquement.",
      ]}
    >
      <PriorityEditor initial={initial} suggested={suggested} onSave={save} />
    </SectionShell>
  );
}
