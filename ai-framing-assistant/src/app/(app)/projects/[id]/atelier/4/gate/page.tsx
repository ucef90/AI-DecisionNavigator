import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { GateEditor } from "@/components/atelier4/gate-editor";
import { saveGate, type GatePatch } from "@/lib/actions/atelier4/synthesis";
import { computeA4Gate, loadAtelier4Snapshot } from "@/lib/engines/atelier4";

// Gate atelier 5 — go/no-go pour passer à la cartographie IA.
// 5 critères calculés automatiquement, possibilité d'override.
export default async function GateSectionPage(
  props: PageProps<"/projects/[id]/atelier/4/gate">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier4Snapshot(id);
  if (!snap) notFound();

  const criteria = computeA4Gate(snap);
  const currentVerdict = (snap.a4Gate?.verdict ?? "NOT_READY") as
    | "NOT_READY"
    | "READY"
    | "OVERRIDE";
  const decidedBy = snap.a4Gate?.decidedBy ?? "";
  const overrideNotes = snap.a4Gate?.overrideNotes ?? "";

  async function save(data: {
    verdict: "NOT_READY" | "READY" | "OVERRIDE";
    decidedBy: string;
    overrideNotes: string;
  }) {
    "use server";
    // On re-charge le snapshot à la sauvegarde pour avoir l'état
    // le plus à jour (et garder TS heureux : pas de capture de
    // valeur potentiellement null à travers la closure).
    const fresh = await loadAtelier4Snapshot(id);
    const patch: GatePatch = {
      verdict: data.verdict,
      decidedBy: data.decidedBy,
      overrideNotes: data.overrideNotes,
    };
    if (fresh) {
      const computed = computeA4Gate(fresh);
      for (const c of computed) {
        patch[c.id] = c.met;
      }
    }
    await saveGate(id, patch);
  }

  return (
    <SectionShell
      phaseLabel="Phase E — Gate atelier 5"
      title="Gate de passage vers la cartographie IA"
      livrableRef="Conclusion atelier 4 — gate de sortie"
      intent="Vérifier que le scoring est complet et la décision actionnable avant de passer à l'architecture cible (atelier 5)."
      pourquoi={[
        "Sans gate, on construit une cartographie IA sur un scoring incomplet — bullshit garanti.",
        "Le gate valide aussi que la décision a été DOCUMENTÉE (rationnel, points forts/faibles, recommandations).",
        "Il prépare l'export du livrable atelier 4 et le passage à l'atelier 5.",
      ]}
      cherche={[
        "Tous les critères au vert (5/5) → passage automatique recommandé.",
        "Critères au rouge : combler les manques avant de bouger.",
        "OVERRIDE possible si contrainte calendrier, mais à JUSTIFIER (audit trail).",
      ]}
      pieges={[
        "Forcer le gate sans justification : la décision deviendra contestable plus tard.",
        "Passer au gate suivant sans avoir rédigé la synthèse : l'atelier 5 démarre sans contexte.",
      ]}
    >
      <GateEditor
        criteria={criteria}
        currentVerdict={currentVerdict}
        decidedBy={decidedBy}
        overrideNotes={overrideNotes}
        onSave={save}
      />
    </SectionShell>
  );
}
