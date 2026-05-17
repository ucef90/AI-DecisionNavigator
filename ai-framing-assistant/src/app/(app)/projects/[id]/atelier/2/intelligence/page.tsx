import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList, safeJSON } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { INTELLIGENCE_NECESSITY_LABELS, INTELLIGENCE_TYPE_LABELS, type IntelligenceNecessity, type IntelligenceType } from "@/types/atelier2";

export default async function A2IntelligencePage(props: PageProps<"/projects/[id]/atelier/2/intelligence">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase C — Qualification IA"
      title="Besoins d'intelligence"
      livrableRef="§7 du livrable atelier 2"
      intent="Identifier le type d'intelligence requis (compréhension, classification, génération…)."
      pourquoi={[
        "Chaque type d'intelligence pointe vers une famille techno (NLP, ML, LLM, RAG…).",
        "Empêche d'aller chercher la techno tendance par défaut.",
        "Base pour le mix techno atelier 7.",
      ]}
      cherche={[
        "≥ 3 types d'intelligence identifiés.",
        "Nécessité (REQUIRED / OPTIONAL / NOT_NEEDED).",
        "Technos suggérées par besoin.",
      ]}
    >
      <ItemList
        items={snap.intelligenceNeeds}
        empty="Aucun besoin d'intelligence listé."
        render={(n) => (
          <div key={n.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{INTELLIGENCE_TYPE_LABELS[n.intelligenceType as IntelligenceType] ?? n.intelligenceType}</div>
                {n.justification ? <p className="mt-1 text-xs">{n.justification}</p> : null}
              </div>
              <Badge variant="outline" className="shrink-0 text-[9px]">{INTELLIGENCE_NECESSITY_LABELS[n.necessity as IntelligenceNecessity] ?? n.necessity}</Badge>
            </div>
            {n.suggestedTech ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {safeJSON<string[]>(n.suggestedTech, []).map((tech, i) => (
                  <Badge key={i} variant="outline" className="text-[9px]">{tech}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}
      />
    </SectionShell>
  );
}
