import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/data-block";
import { loadAtelier2Snapshot } from "@/lib/engines/atelier2";
import { NODE_TYPE_LABELS, type ArchNodeType } from "@/types/atelier2";

const NODE_COLOR: Record<ArchNodeType, string> = {
  INPUT: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20",
  PROCESS: "border-foreground/30 bg-muted/40",
  AI_COMPONENT: "border-violet-500/40 bg-violet-50/40 dark:bg-violet-950/20",
  AUTO_COMPONENT: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
  HUMAN_VALIDATION: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
  DATA_STORE: "border-foreground/30 bg-background",
  OUTPUT: "border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20",
};

export default async function A2TargetArchitecturePage(props: PageProps<"/projects/[id]/atelier/2/target-architecture">) {
  const { id } = await props.params;
  const snap = await loadAtelier2Snapshot(id);
  if (!snap) notFound();

  const nodes = snap.archNodes;
  const edges = snap.archEdges;
  const nodeIdx = new Map(nodes.map((n) => [n.id, n]));
  const byType: Record<string, typeof nodes> = {};
  for (const n of nodes) {
    if (!byType[n.nodeType]) byType[n.nodeType] = [];
    byType[n.nodeType].push(n);
  }

  return (
    <SectionShell
      phaseLabel="Phase D — Architecture cible"
      title="Architecture logique cible"
      livrableRef="§15 du livrable atelier 2"
      intent="Esquisser les composants logiques + flux du système IA cible."
      pourquoi={[
        "L'archi cible matérialise la décision IA en composants concrets.",
        "Sert d'input à la DSI pour estimer coûts/délais.",
        "Validée en atelier 5 (cartographie) puis exécutée en atelier 7 (roadmap).",
      ]}
      cherche={[
        "≥ 4 composants (entrée → traitements → sortie).",
        "Composants IA isolés (LLM, RAG, ML, OCR).",
        "Points de validation humaine explicites.",
      ]}
    >
      {nodes.length === 0 ? <EmptyState message="Architecture cible non esquissée." /> : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{nodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Composants</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{edges.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Flux</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{byType.AI_COMPONENT?.length ?? 0}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">IA</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{byType.HUMAN_VALIDATION?.length ?? 0}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Validations</div>
            </div>
          </div>

          {Object.entries(byType).map(([type, list]) => (
            <div key={type} className="rounded-md border border-border bg-background p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {NODE_TYPE_LABELS[type as ArchNodeType] ?? type} ({list.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((n) => (
                  <span key={n.id} className={cn("rounded-md border px-2.5 py-1 text-xs font-medium", NODE_COLOR[type as ArchNodeType] ?? "border-border")}>
                    {n.label}
                    {n.techCode ? <Badge variant="outline" className="ml-1.5 text-[9px]">{n.techCode}</Badge> : null}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {edges.length > 0 ? (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flux ({edges.length})</div>
              <ul className="space-y-1 text-xs">
                {edges.map((e) => {
                  const from = nodeIdx.get(e.fromId);
                  const to = nodeIdx.get(e.toId);
                  if (!from || !to) return null;
                  return <li key={e.id} className="flex items-center gap-2"><span>{from.label}</span><ArrowRight className="h-3 w-3 text-foreground/40" /><span>{to.label}</span></li>;
                })}
              </ul>
            </div>
          ) : null}

          <Link href={`/projects/${id}/atelier/7/architecture`} className="inline-block text-xs underline underline-offset-2">→ Architecture détaillée (atelier 7)</Link>
        </div>
      )}
    </SectionShell>
  );
}
