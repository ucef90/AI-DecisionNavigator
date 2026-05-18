import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DocumentAnalysisEditor } from "@/components/atelier3/editors/document-analysis-editor";
import { safeJSON } from "@/components/common/data-block";
import { saveDocumentAnalysis } from "@/lib/actions/atelier3";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";

export default async function A3DocAnalysisPage(props: PageProps<"/projects/[id]/atelier/3/document-analysis">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const d = snap.documentAnalysis;

  async function action(formData: FormData) {
    "use server";
    await saveDocumentAnalysis(id, formData);
  }

  return (
    <SectionShell
      phaseLabel="Phase B — Compléments d'analyse"
      title="Analyse documentaire"
      livrableRef="§6 du livrable atelier 3"
      intent="Évaluer si les documents nécessitent OCR/NLP/RAG — impact direct sur les technos."
      pourquoi={["OCR + NLP = pré-requis si docs scannés.", "RAG = recherche contextuelle si base documentaire.", "Complexité documentaire = axe scoring atelier 4."]}
      cherche={["Formats listés.", "Niveau de structure.", "Décisions tech (OCR, NLP, RAG ?)."]}
    >
      <DocumentAnalysisEditor
        defaults={{
          documentsExist: d?.documentsExist ?? false,
          formats: safeJSON<string[]>(d?.formats, []).join(", "),
          structureLevel: d?.structureLevel ?? "MIXED",
          exploitability: d?.exploitability ?? "MODERATE",
          interpretationNeeded: d?.interpretationNeeded ?? false,
          estimatedVolume: d?.estimatedVolume ?? "",
          ocrNeeded: d?.ocrNeeded ?? false,
          nlpNeeded: d?.nlpNeeded ?? false,
          ragNeeded: d?.ragNeeded ?? false,
          complexityLevel: d?.complexityLevel ?? "MEDIUM",
          notes: d?.notes ?? "",
        }}
        action={action}
      />
    </SectionShell>
  );
}
