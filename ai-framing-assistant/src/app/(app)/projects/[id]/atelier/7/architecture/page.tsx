import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/atelier1/section-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

const NODE_COLORS: Record<string, string> = {
  INPUT: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  PROCESS: "border-foreground/30 bg-muted/40",
  AI_COMPONENT: "border-violet-500/40 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
  AUTO_COMPONENT: "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  HUMAN_VALIDATION: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  DATA_STORE: "border-foreground/30 bg-background",
  OUTPUT: "border-sky-500/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
};

const NODE_LABELS: Record<string, string> = {
  INPUT: "Entrée",
  PROCESS: "Traitement",
  AI_COMPONENT: "Composant IA",
  AUTO_COMPONENT: "Auto",
  HUMAN_VALIDATION: "Validation humaine",
  DATA_STORE: "Stockage",
  OUTPUT: "Sortie",
};

export default async function ArchitectureSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/architecture">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();

  const nodes = snap.a4.taskQualifications.length > 0 ? null : null; // placeholder
  const archNodes = snap.a4.taskQualifications ? [] : [];
  // On utilise les TargetArchitectureNode chargés via le snapshot atelier 4 — non, ils sont sur snap directement
  // Ici on lit via Prisma les TargetArchitectureNode/Edge si besoin
  // Pour simplifier on ré-utilise les données ateliers 2 disponibles dans le snapshot
  void nodes;
  void archNodes;

  // Récupération via une 2e requête simple
  const { prisma } = await import("@/lib/prisma");
  const [allNodes, allEdges] = await Promise.all([
    prisma.targetArchitectureNode.findMany({ where: { projectId: id } }),
    prisma.targetArchitectureEdge.findMany({ where: { projectId: id } }),
  ]);

  const nodeIndex = new Map(allNodes.map((n) => [n.id, n]));
  // Group nodes by nodeType
  const byType: Record<string, typeof allNodes> = {};
  for (const n of allNodes) {
    if (!byType[n.nodeType]) byType[n.nodeType] = [];
    byType[n.nodeType].push(n);
  }

  return (
    <SectionShell
      phaseLabel="Phase B — Vision & architecture"
      title="Architecture cible"
      livrableRef="§2 du livrable atelier 7 — repris de l'atelier 2"
      intent="Vision système cible : composants IA, validations humaines, flux."
      pourquoi={[
        "L'architecture cible matérialise la décision IA en composants concrets.",
        "Elle sert de base à la DSI pour estimer coûts/délais.",
        "Elle révèle les points d'intégration et les dépendances.",
      ]}
      cherche={[
        "Les composants IA bien isolés (LLM, RAG, ML, OCR).",
        "Les points de validation humaine explicites.",
        "Les flux entre composants (entrée → traitements → sortie).",
        "L'orchestration (BPM) qui coordonne le tout.",
      ]}
    >
      {allNodes.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
          Architecture cible non définie.{" "}
          <Link href={`/projects/${id}/atelier/2/matrix`} className="underline">
            Construire dans l&apos;atelier 2 →
          </Link>
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{allNodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Composants</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{allEdges.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Flux</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{(byType.AI_COMPONENT?.length ?? 0)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Composants IA</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="text-2xl font-semibold">{(byType.HUMAN_VALIDATION?.length ?? 0)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Validations humaines</div>
            </div>
          </div>

          {/* Composants par type */}
          <div className="space-y-3">
            {Object.entries(byType).map(([type, list]) => (
              <div key={type} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {NODE_LABELS[type] ?? type} ({list.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((n) => (
                    <span
                      key={n.id}
                      className={cn("rounded-md border px-2.5 py-1 text-xs font-medium", NODE_COLORS[type] ?? "border-border bg-muted")}
                      title={n.notes ?? n.label}
                    >
                      {n.label}
                      {n.techCode ? <Badge variant="outline" className="ml-1.5 text-[9px]">{n.techCode}</Badge> : null}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Flux */}
          {allEdges.length > 0 ? (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Flux ({allEdges.length})
              </div>
              <ul className="space-y-1 text-xs">
                {allEdges.map((e) => {
                  const from = nodeIndex.get(e.fromId);
                  const to = nodeIndex.get(e.toId);
                  if (!from || !to) return null;
                  return (
                    <li key={e.id} className="flex items-center gap-2">
                      <span className="font-medium">{from.label}</span>
                      <ArrowRight className="h-3 w-3 text-foreground/40" />
                      <span className="font-medium">{to.label}</span>
                      {e.label ? <span className="text-muted-foreground">— {e.label}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
