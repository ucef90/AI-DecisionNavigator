import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { DataBlock, EmptyState, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier3Snapshot } from "@/lib/engines/atelier3";
import { DOC_COMPLEXITY_LABELS, DOC_EXPLOITABILITY_LABELS, DOC_STRUCTURE_LABELS, type DocComplexityLevel, type DocExploitability, type DocStructureLevel } from "@/types/atelier3";

export default async function A3DocumentAnalysisPage(props: PageProps<"/projects/[id]/atelier/3/document-analysis">) {
  const { id } = await props.params;
  const snap = await loadAtelier3Snapshot(id);
  if (!snap) notFound();
  const d = snap.documentAnalysis;

  return (
    <SectionShell
      phaseLabel="Phase B — Compléments d'analyse"
      title="Analyse documentaire"
      livrableRef="§6 du livrable atelier 3"
      intent="Évaluer si les documents nécessitent OCR/NLP/RAG — impact direct sur les technos."
      pourquoi={["OCR + NLP = pré-requis si docs scannés.", "RAG = recherche contextuelle si base documentaire.", "Complexité documentaire = axe scoring atelier 4."]}
      cherche={["Formats listés.", "Niveau de structure (structuré/semi/non).", "Décisions tech (OCR, NLP, RAG nécessaire ?)."]}
    >
      {!d ? <EmptyState message="Analyse documentaire non faite." /> : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <DataBlock title="Documents existants" body={d.documentsExist ? "Oui" : "Non"} />
            <DataBlock title="Structure" body={d.structureLevel ? DOC_STRUCTURE_LABELS[d.structureLevel as DocStructureLevel] : null} />
            <DataBlock title="Exploitabilité" body={d.exploitability ? DOC_EXPLOITABILITY_LABELS[d.exploitability as DocExploitability] : null} />
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formats</h3>
            <div className="flex flex-wrap gap-1.5">
              {safeJSON<string[]>(d.formats, []).map((f, i) => <Badge key={i} variant="outline">{f}</Badge>)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Technos nécessaires</h3>
            <div className="flex flex-wrap gap-1.5">
              {d.ocrNeeded ? <Badge variant="outline">OCR</Badge> : null}
              {d.nlpNeeded ? <Badge variant="outline">NLP</Badge> : null}
              {d.ragNeeded ? <Badge variant="outline">RAG</Badge> : null}
              {!d.ocrNeeded && !d.nlpNeeded && !d.ragNeeded ? <span className="text-xs italic text-muted-foreground">Aucune</span> : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DataBlock title="Volume estimé" body={d.estimatedVolume} />
            <DataBlock title="Complexité" body={d.complexityLevel ? DOC_COMPLEXITY_LABELS[d.complexityLevel as DocComplexityLevel] : null} />
          </div>
          <DataBlock title="Notes" body={d.notes} />
        </div>
      )}
    </SectionShell>
  );
}
