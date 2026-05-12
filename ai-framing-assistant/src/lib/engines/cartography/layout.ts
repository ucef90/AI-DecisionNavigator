// Layout — simple deterministic placement for the SVG renderer.
//
// We don't ship a force-directed graph library yet (would add a heavy
// runtime dep). Instead, this module emits XY positions using two layouts:
//
//   - radial: one central node with satellites around (used for BUSINESS,
//     DATA, TECHNOLOGY, RISK, GOVERNANCE).
//   - sequence: linear left-to-right chain (used for WORKFLOW).
//
// The output is a positioned-graph: same node shape but with x/y/r.

import type { Graph, Node, Edge, CartographyLayerId } from "./types";

export type PositionedNode = Node & { x: number; y: number; r: number };

export type PositionedGraph = {
  layer: CartographyLayerId;
  title: string;
  description: string;
  nodes: PositionedNode[];
  edges: Edge[];
  metrics?: { label: string; value: string }[];
  emptyReason?: string;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 480;

export function layoutGraph(graph: Graph): PositionedGraph {
  if (graph.nodes.length === 0) {
    return {
      ...graph,
      nodes: [],
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    };
  }
  if (graph.layer === "WORKFLOW") {
    return sequenceLayout(graph);
  }
  return radialLayout(graph);
}

// -------------------------------------------------------------
// Radial layout: pick a "central" node, place others on a circle.
// -------------------------------------------------------------
function radialLayout(graph: Graph): PositionedGraph {
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  // Pick centre: the node with the most connections.
  const degree = new Map<string, number>();
  for (const e of graph.edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const centre =
    [...graph.nodes].sort(
      (a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0),
    )[0];

  const others = graph.nodes.filter((n) => n.id !== centre.id);
  const positioned: PositionedNode[] = [];

  positioned.push({ ...centre, x: cx, y: cy, r: 28 });

  // Use two rings when many nodes to avoid overlap.
  const ring1Count = Math.min(others.length, 10);
  const ring2Count = others.length - ring1Count;
  const radius1 = 170;
  const radius2 = 230;

  for (let i = 0; i < ring1Count; i++) {
    const angle = (i / ring1Count) * Math.PI * 2 - Math.PI / 2;
    positioned.push({
      ...others[i],
      x: cx + Math.cos(angle) * radius1,
      y: cy + Math.sin(angle) * radius1,
      r: nodeRadius(others[i]),
    });
  }
  for (let i = 0; i < ring2Count; i++) {
    const angle = (i / Math.max(ring2Count, 1)) * Math.PI * 2;
    positioned.push({
      ...others[ring1Count + i],
      x: cx + Math.cos(angle) * radius2,
      y: cy + Math.sin(angle) * radius2,
      r: nodeRadius(others[ring1Count + i]),
    });
  }

  return {
    ...graph,
    nodes: positioned,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  };
}

// -------------------------------------------------------------
// Sequence layout: chain nodes left-to-right, two lanes (current/target).
// -------------------------------------------------------------
function sequenceLayout(graph: Graph): PositionedGraph {
  const current = graph.nodes.filter((n) => n.id.startsWith("wf.cur."));
  const target = graph.nodes.filter((n) => n.id.startsWith("wf.tgt."));
  const others = graph.nodes.filter(
    (n) => !n.id.startsWith("wf.cur.") && !n.id.startsWith("wf.tgt."),
  );

  const placed: PositionedNode[] = [];

  const placeLane = (lane: Node[], y: number) => {
    if (lane.length === 0) return;
    const stepX = (CANVAS_WIDTH - 80) / Math.max(lane.length, 1);
    lane.forEach((n, i) => {
      placed.push({
        ...n,
        x: 40 + stepX * (i + 0.5),
        y,
        r: nodeRadius(n),
      });
    });
  };

  placeLane(current, CANVAS_HEIGHT * 0.3);
  placeLane(target, CANVAS_HEIGHT * 0.7);

  others.forEach((n, i) => {
    placed.push({
      ...n,
      x: CANVAS_WIDTH - 80,
      y: 40 + i * 40,
      r: nodeRadius(n),
    });
  });

  return {
    ...graph,
    nodes: placed,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  };
}

function nodeRadius(n: Node): number {
  if (n.weight && n.weight >= 4) return 22;
  if (n.severity === "CRITICAL") return 20;
  if (n.severity === "WARNING") return 18;
  return 16;
}
