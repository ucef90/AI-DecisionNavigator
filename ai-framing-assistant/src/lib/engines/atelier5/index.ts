// Atelier 5 — Cartographie IA complète
//
// L'engine s'appuie sur 3 sources :
//   1. Le moteur cartography existant (qui produit 6 vues
//      depuis le ProjectSnapshot via buildCartography).
//   2. Les données spécifiques atelier 5 (annotations, synthèse).
//   3. Les données atelier 2 (target architecture).
// Il calcule :
//   - Le nombre de nœuds critiques par couche
//   - La progression par section
//   - Le verdict du gate atelier 6

import { prisma } from "@/lib/prisma";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import {
  CARTOGRAPHY_LAYERS,
  buildCartography,
  type Cartography,
  type CartographyLayerId,
} from "@/lib/engines/cartography";
import {
  ATELIER5_PHASES,
  allA5Sections,
  type Atelier5PhaseId,
  type Atelier5SectionId,
} from "@/types/atelier5";

export type Atelier5Snapshot = {
  projectId: string;
  projectName: string;
  cartography: Cartography | null;
  annotations: Awaited<ReturnType<typeof prisma.cartographyAnnotation.findMany>>;
  synthesis: Awaited<ReturnType<typeof prisma.atelier5Synthesis.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier5Gate.findUnique>>;
  // Données atelier 2 — pour l'archi cible
  targetArchNodes: Awaited<ReturnType<typeof prisma.targetArchitectureNode.findMany>>;
  targetArchEdges: Awaited<ReturnType<typeof prisma.targetArchitectureEdge.findMany>>;
};

export async function loadAtelier5Snapshot(projectId: string): Promise<Atelier5Snapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  const [snapshot, annotations, synthesis, gate, targetArchNodes, targetArchEdges] = await Promise.all([
    buildProjectSnapshot(projectId),
    prisma.cartographyAnnotation.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } }),
    prisma.atelier5Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier5Gate.findUnique({ where: { projectId } }),
    prisma.targetArchitectureNode.findMany({ where: { projectId } }),
    prisma.targetArchitectureEdge.findMany({ where: { projectId } }),
  ]);

  const cartography = snapshot ? buildCartography(snapshot) : null;

  return {
    projectId: project.id,
    projectName: project.name,
    cartography,
    annotations,
    synthesis,
    gate,
    targetArchNodes,
    targetArchEdges,
  };
}

// -------------------------------------------------------------
// Stats par couche
// -------------------------------------------------------------
export type LayerStats = {
  layer: CartographyLayerId;
  nodeCount: number;
  edgeCount: number;
  criticalAnnotations: number;
  totalAnnotations: number;
  emptyReason?: string;
};

export function computeLayerStats(snap: Atelier5Snapshot): Record<CartographyLayerId, LayerStats> {
  const out = {} as Record<CartographyLayerId, LayerStats>;
  for (const layer of CARTOGRAPHY_LAYERS) {
    const graph = snap.cartography?.layers[layer];
    const annotsLayer = snap.annotations.filter((a) => a.layer === layer);
    out[layer] = {
      layer,
      nodeCount: graph?.nodes.length ?? 0,
      edgeCount: graph?.edges.length ?? 0,
      criticalAnnotations: annotsLayer.filter(
        (a) => a.kind === "WARNING" || a.criticality === "HIGH" || a.criticality === "CRITICAL",
      ).length,
      totalAnnotations: annotsLayer.length,
      emptyReason: graph?.emptyReason,
    };
  }
  return out;
}

// -------------------------------------------------------------
// Progression
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";
export type SectionProgress = { id: Atelier5SectionId; status: SectionStatus; note?: string };

export function computeA5Progress(snap: Atelier5Snapshot): Record<Atelier5SectionId, SectionProgress> {
  const out = {} as Record<Atelier5SectionId, SectionProgress>;
  const set = (id: Atelier5SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };
  const stats = computeLayerStats(snap);

  const hasAnyCarto = Object.values(stats).some((s) => s.nodeCount > 0);
  set("overview", { status: hasAnyCarto ? "COMPLETE" : "EMPTY" });

  const setLayer = (sectionId: Atelier5SectionId, layer: CartographyLayerId) => {
    const s = stats[layer];
    const status: SectionStatus =
      s.nodeCount === 0 ? "EMPTY" : s.totalAnnotations > 0 ? "COMPLETE" : "STARTED";
    set(sectionId, { status, note: `${s.nodeCount} nœud(s) · ${s.totalAnnotations} note(s)` });
  };

  setLayer("business-map", "BUSINESS");
  setLayer("workflow-map", "WORKFLOW");
  setLayer("data-map", "DATA");
  setLayer("ai-map", "TECHNOLOGY");
  setLayer("risk-map", "RISK");
  setLayer("governance-map", "GOVERNANCE");

  set("target-architecture", {
    status:
      snap.targetArchNodes.length === 0
        ? "EMPTY"
        : snap.targetArchNodes.length < 4
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.targetArchNodes.length} nœud(s)`,
  });

  const s = snap.synthesis;
  const synthFilled =
    (s?.systemOverview ? 1 : 0) +
    (s?.governanceObservations ? 1 : 0) +
    (s?.criticalNodes ? 1 : 0);
  set("synthesis", { status: synthFilled === 0 ? "EMPTY" : synthFilled >= 2 ? "COMPLETE" : "STARTED" });

  const g = snap.gate;
  set("gate", {
    status: g?.verdict === "READY" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY",
  });

  return out;
}

export function a5OverallProgress(snap: Atelier5Snapshot): number {
  const sections = allA5Sections();
  const prog = computeA5Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a5PhaseProgress(snap: Atelier5Snapshot, phaseId: Atelier5PhaseId): number {
  const phase = ATELIER5_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA5Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

// -------------------------------------------------------------
// Gate atelier 6
// -------------------------------------------------------------
export type A5GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier5Snapshot["gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA5Gate(snap: Atelier5Snapshot): A5GateCriterion[] {
  const stats = computeLayerStats(snap);
  const layersWithContent = Object.values(stats).filter((s) => s.nodeCount > 0).length;
  const annotatedLayers = Object.values(stats).filter((s) => s.totalAnnotations > 0).length;
  const govNodes = stats.GOVERNANCE.nodeCount;
  const riskNodes = stats.RISK.nodeCount;
  const synthOk = Boolean(snap.synthesis?.systemOverview?.trim());

  return [
    {
      id: "sixLayersReviewed",
      label: "≥ 4 couches cartographiées (sur 6)",
      met: layersWithContent >= 4,
      why: layersWithContent < 4 ? `${layersWithContent}/6 couches avec données.` : undefined,
    },
    {
      id: "criticalNodesAnnotated",
      label: "≥ 2 couches annotées",
      met: annotatedLayers >= 2,
      why: annotatedLayers < 2 ? `${annotatedLayers}/2 couche(s) annotée(s).` : undefined,
    },
    {
      id: "governanceMapDefined",
      label: "Cartographie gouvernance présente",
      met: govNodes > 0,
      why: govNodes === 0 ? "Couche gouvernance vide." : undefined,
    },
    {
      id: "riskMapDefined",
      label: "Cartographie risques présente",
      met: riskNodes > 0,
      why: riskNodes === 0 ? "Couche risques vide — compléter le wizard risques." : undefined,
    },
    {
      id: "synthesisWritten",
      label: "Synthèse cartographique rédigée",
      met: synthOk,
      why: !synthOk ? "Pas de synthèse système écrite." : undefined,
    },
  ];
}

export function isA5GateReady(snap: Atelier5Snapshot): boolean {
  return computeA5Gate(snap).every((c) => c.met);
}
