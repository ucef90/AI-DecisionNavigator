// Cartography engine — Node / Edge / Graph primitives.
//
// Reference: CARTOGRAPHY_ENGINE.md and BUSINESS_LOGIC.md §291-303, §815-824.
//
// The system must produce six interactive cartographies (business, workflow,
// data, technology, risk, governance). They share the same graph model so
// renderers, exporters and search can be implemented once.
//
// The model is intentionally serialisable: a graph is plain JSON (no class
// instances, no functions on nodes), so it can be persisted, sent to the
// client as a server-component prop, or stored as a Deliverable.

export type CartographyLayerId =
  | "BUSINESS"
  | "WORKFLOW"
  | "DATA"
  | "TECHNOLOGY"
  | "RISK"
  | "GOVERNANCE";

export const CARTOGRAPHY_LAYERS: CartographyLayerId[] = [
  "BUSINESS",
  "WORKFLOW",
  "DATA",
  "TECHNOLOGY",
  "RISK",
  "GOVERNANCE",
];

export const CARTOGRAPHY_LAYER_LABELS: Record<CartographyLayerId, string> = {
  BUSINESS: "Cartographie métier",
  WORKFLOW: "Cartographie workflow",
  DATA: "Cartographie des données",
  TECHNOLOGY: "Cartographie technologique",
  RISK: "Cartographie des risques",
  GOVERNANCE: "Cartographie gouvernance",
};

// Each node has a semantic category so renderers can pick icons / colours.
export type NodeCategory =
  | "NEED"        // problème métier, irritant, KPI
  | "USER"        // utilisateur / persona
  | "PROCESS"     // étape de workflow
  | "DATA_SOURCE" // source de données
  | "DATA_FLOW"   // transformation / flux
  | "APP"         // application SI
  | "API"         // API
  | "TECH"        // technologie IA (LLM, RAG, ML, agent...)
  | "RISK"        // risque évalué
  | "CONTROL"     // contrôle / supervision
  | "ROLE"        // rôle (DPO, sponsor, chef de projet)
  | "DECISION";   // nœud terminal "décision"

export type Node = {
  id: string;
  layer: CartographyLayerId;
  category: NodeCategory;
  label: string;
  // Optional fields surfaced in tooltips / detail pane.
  description?: string;
  // Severity tints risk / control nodes.
  severity?: "INFO" | "WARNING" | "CRITICAL";
  // Numeric weight, used by some layouts (e.g. risk score 1..5).
  weight?: number;
};

export type EdgeKind =
  | "USES"        // process → data source
  | "FEEDS"       // data source → tech
  | "VALIDATES"   // role → process
  | "EXPOSES"     // app → api
  | "MITIGATES"   // control → risk
  | "TRIGGERS"    // step → step
  | "OWNS"        // role → asset
  | "PRODUCES"    // process → output
  | "REQUIRES";   // tech → data

export type Edge = {
  id: string;
  source: string; // node id
  target: string; // node id
  kind: EdgeKind;
  label?: string;
};

export type Graph = {
  layer: CartographyLayerId;
  title: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  // Optional summary metrics, e.g. "3 risques critiques, 8 sources data".
  metrics?: { label: string; value: string }[];
  // Set when the layer cannot be built because upstream data is missing.
  emptyReason?: string;
};

export type Cartography = {
  projectId: string;
  generatedAt: string; // ISO timestamp
  layers: Record<CartographyLayerId, Graph>;
};
