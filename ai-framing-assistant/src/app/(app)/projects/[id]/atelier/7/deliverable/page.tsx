import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DeliverableViewer } from "@/components/atelier7/deliverable-viewer";
import { generateGlobalDossier } from "@/lib/deliverables/global-dossier";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

// Génération du livrable global : consolidation markdown des 7 ateliers.
// Côté serveur on construit le markdown en lisant tout, côté client on
// affiche aperçu + bouton de téléchargement.
export default async function DeliverableSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/deliverable">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const markdown = generateGlobalDossier(snap);

  return (
    <SectionShell
      phaseLabel="Phase E — Décision finale + livrable"
      title="Dossier stratégique final IA"
      livrableRef="Consolidation des 7 ateliers en markdown exportable"
      intent="Générer le dossier final consolidé — prêt à présenter en COPIL, signer par sponsor, archiver."
      pourquoi={[
        "Le markdown est le format pivot : copiable dans Notion / Confluence / Slack / mail.",
        "Il consolide TOUT ce qui a été collecté en 7 ateliers en un document professionnel cohérent.",
        "C'est la trace officielle de la décision IA — utilisable pour audit.",
      ]}
      cherche={[
        "Cohérence narrative : la synthèse exécutive doit refléter le reste du dossier.",
        "Absence de zones vides : les sections vides indiquent les manques à combler.",
        "Lisibilité : le dossier doit être compréhensible par un sponsor non technique.",
      ]}
      pieges={[
        "Exporter trop tôt : si scoring/gouvernance vides, le dossier sera peu crédible.",
        "Ne pas relire avant envoi : le moteur agrège, c'est à toi de challenger le contenu.",
      ]}
    >
      <DeliverableViewer markdown={markdown} projectName={snap.projectName} />
    </SectionShell>
  );
}
