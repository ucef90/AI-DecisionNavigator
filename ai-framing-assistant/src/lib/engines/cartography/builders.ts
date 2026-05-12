// Builders — turn a ProjectSnapshot into one Graph per layer.
//
// Each builder is pure: same input → same output, no I/O. Builders never
// throw on partial data; they instead set `emptyReason` so the UI can show
// a hint about which wizard step to complete.

import type { ProjectSnapshot, Signal } from "@/lib/engines/types";
import type { DecisionResult } from "@/lib/engines/decision";
import type { ScoringResult } from "@/lib/engines/scoring";
import {
  CARTOGRAPHY_LAYER_LABELS,
  type Edge,
  type Graph,
  type Node,
  type CartographyLayerId,
} from "./types";

function emptyGraph(layer: CartographyLayerId, reason: string): Graph {
  return {
    layer,
    title: CARTOGRAPHY_LAYER_LABELS[layer],
    description: reason,
    nodes: [],
    edges: [],
    emptyReason: reason,
  };
}

// -------------------------------------------------------------
// BUSINESS — besoin métier, utilisateurs, irritants, KPIs
// -------------------------------------------------------------
export function buildBusinessGraph(snap: ProjectSnapshot): Graph {
  const need = snap.businessNeed;
  if (!need) {
    return emptyGraph(
      "BUSINESS",
      "Remplir le bloc 'Besoin métier' pour générer la cartographie.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const root: Node = {
    id: "need.root",
    layer: "BUSINESS",
    category: "NEED",
    label: truncate(need.reformulatedNeed || snap.name, 72),
    description: need.expectedValue ?? undefined,
  };
  nodes.push(root);

  if (need.usersImpacted) {
    const usersList = splitInline(need.usersImpacted);
    for (let i = 0; i < usersList.length; i++) {
      const id = `need.user.${i}`;
      nodes.push({
        id,
        layer: "BUSINESS",
        category: "USER",
        label: usersList[i],
      });
      edges.push({
        id: `${id}.owns`,
        source: id,
        target: root.id,
        kind: "OWNS",
        label: "concerné",
      });
    }
  }

  need.painPoints.forEach((pain, i) => {
    const id = `need.pain.${i}`;
    nodes.push({
      id,
      layer: "BUSINESS",
      category: "NEED",
      label: truncate(pain, 80),
      severity: "WARNING",
    });
    edges.push({ id: `${id}.triggers`, source: id, target: root.id, kind: "TRIGGERS" });
  });

  need.currentKpis.forEach((kpi, i) => {
    const id = `need.kpi.${i}`;
    nodes.push({
      id,
      layer: "BUSINESS",
      category: "NEED",
      label: truncate(kpi, 80),
      severity: "INFO",
    });
    edges.push({ id: `${id}.produces`, source: root.id, target: id, kind: "PRODUCES" });
  });

  return {
    layer: "BUSINESS",
    title: CARTOGRAPHY_LAYER_LABELS["BUSINESS"],
    description: "Vue systémique : besoin reformulé, utilisateurs, irritants et KPIs.",
    nodes,
    edges,
    metrics: [
      { label: "Irritants", value: String(need.painPoints.length) },
      { label: "KPIs documentés", value: String(need.currentKpis.length) },
    ],
  };
}

// -------------------------------------------------------------
// WORKFLOW — étapes manuelles, validations, automatisations
// -------------------------------------------------------------
export function buildWorkflowGraph(snap: ProjectSnapshot): Graph {
  const arch = snap.architecture;
  if (!arch || (!arch.workflowCurrent && !arch.workflowTarget)) {
    return emptyGraph(
      "WORKFLOW",
      "Documenter le workflow (actuel / cible) dans l'analyse architecture.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const current = splitSteps(arch.workflowCurrent);
  const target = splitSteps(arch.workflowTarget);

  current.forEach((step, i) => {
    const id = `wf.cur.${i}`;
    nodes.push({
      id,
      layer: "WORKFLOW",
      category: "PROCESS",
      label: truncate(step, 80),
      description: "Workflow actuel",
    });
    if (i > 0) {
      edges.push({
        id: `${id}.next`,
        source: `wf.cur.${i - 1}`,
        target: id,
        kind: "TRIGGERS",
      });
    }
  });

  target.forEach((step, i) => {
    const id = `wf.tgt.${i}`;
    nodes.push({
      id,
      layer: "WORKFLOW",
      category: "PROCESS",
      label: truncate(step, 80),
      description: "Workflow cible",
      severity: "INFO",
    });
    if (i > 0) {
      edges.push({
        id: `${id}.next`,
        source: `wf.tgt.${i - 1}`,
        target: id,
        kind: "TRIGGERS",
      });
    }
  });

  if (arch.humanValidation) {
    const id = "wf.human-validation";
    nodes.push({
      id,
      layer: "WORKFLOW",
      category: "CONTROL",
      label: "Validation humaine",
      severity: "INFO",
    });
    if (target.length > 0) {
      edges.push({
        id: `${id}.validates`,
        source: id,
        target: `wf.tgt.${target.length - 1}`,
        kind: "VALIDATES",
      });
    }
  }

  return {
    layer: "WORKFLOW",
    title: CARTOGRAPHY_LAYER_LABELS["WORKFLOW"],
    description: "Étapes actuelles, cibles et points de validation humaine.",
    nodes,
    edges,
    metrics: [
      { label: "Étapes actuelles", value: String(current.length) },
      { label: "Étapes cibles", value: String(target.length) },
      { label: "Supervision humaine", value: arch.humanValidation ? "Oui" : "Non" },
    ],
  };
}

// -------------------------------------------------------------
// DATA — sources, sensibilité, RGPD, qualité
// -------------------------------------------------------------
export function buildDataGraph(snap: ProjectSnapshot): Graph {
  const da = snap.dataAssessment;
  if (!da) {
    return emptyGraph(
      "DATA",
      "Compléter l'analyse data pour générer la cartographie des données.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const sink: Node = {
    id: "data.project",
    layer: "DATA",
    category: "TECH",
    label: snap.name,
    description: "Cible des flux data",
  };
  nodes.push(sink);

  da.dataSources.forEach((src, i) => {
    const id = `data.src.${i}`;
    nodes.push({
      id,
      layer: "DATA",
      category: "DATA_SOURCE",
      label: truncate(src, 80),
      severity:
        da.sensitivity === "SENSITIVE"
          ? "CRITICAL"
          : da.sensitivity === "CONFIDENTIAL"
            ? "WARNING"
            : undefined,
    });
    edges.push({
      id: `${id}.feeds`,
      source: id,
      target: sink.id,
      kind: "FEEDS",
      label: da.structured && da.unstructured ? "mixte" : da.unstructured ? "non structuré" : "structuré",
    });
  });

  if (da.personalData) {
    const id = "data.personal";
    nodes.push({
      id,
      layer: "DATA",
      category: "CONTROL",
      label: "Données personnelles (RGPD)",
      severity: "CRITICAL",
      description: da.rgpdConstraints ?? "Contraintes RGPD à instruire",
    });
    edges.push({
      id: `${id}.mitigates`,
      source: id,
      target: sink.id,
      kind: "MITIGATES",
    });
  }

  return {
    layer: "DATA",
    title: CARTOGRAPHY_LAYER_LABELS["DATA"],
    description: "Sources, sensibilité, RGPD et flux vers la cible.",
    nodes,
    edges,
    metrics: [
      { label: "Sources", value: String(da.dataSources.length) },
      { label: "Sensibilité", value: da.sensitivity ?? "—" },
      { label: "Données personnelles", value: da.personalData ? "Oui" : "Non" },
    ],
  };
}

// -------------------------------------------------------------
// TECHNOLOGY — approches IA retenues + intégration SI
// -------------------------------------------------------------
export function buildTechnologyGraph(
  snap: ProjectSnapshot,
  decision?: DecisionResult,
): Graph {
  const ai = snap.aiAnalysis;
  const arch = snap.architecture;
  if (!ai && !arch) {
    return emptyGraph(
      "TECHNOLOGY",
      "Compléter l'analyse IA et l'architecture pour générer la cartographie technologique.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const center: Node = {
    id: "tech.solution",
    layer: "TECHNOLOGY",
    category: "TECH",
    label:
      decision?.recommendedApproach ??
      ai?.recommendedApproach ??
      "Approche à confirmer",
  };
  nodes.push(center);

  const approachFlags: [boolean | undefined, string, string][] = [
    [ai?.automationRelevant, "tech.automation", "Automatisation"],
    [ai?.ruleEngineRelevant, "tech.rule", "Moteur de règles"],
    [ai?.mlRelevant, "tech.ml", "Machine Learning"],
    [ai?.llmRelevant, "tech.llm", "LLM"],
    [ai?.ragRelevant, "tech.rag", "RAG"],
    [ai?.agentRelevant, "tech.agent", "Agent IA"],
    [ai?.hybridRelevant, "tech.hybrid", "Workflow hybride"],
    [ai?.classicRelevant, "tech.classic", "Solution classique"],
  ];

  for (const [flag, id, label] of approachFlags) {
    if (!flag) continue;
    nodes.push({
      id,
      layer: "TECHNOLOGY",
      category: "TECH",
      label,
    });
    edges.push({ id: `${id}.requires`, source: id, target: center.id, kind: "REQUIRES" });
  }

  arch?.applications.forEach((app, i) => {
    const id = `tech.app.${i}`;
    nodes.push({ id, layer: "TECHNOLOGY", category: "APP", label: truncate(app, 60) });
    edges.push({ id: `${id}.exposes`, source: id, target: center.id, kind: "EXPOSES" });
  });

  arch?.apis.forEach((api, i) => {
    const id = `tech.api.${i}`;
    nodes.push({ id, layer: "TECHNOLOGY", category: "API", label: truncate(api, 60) });
    edges.push({ id: `${id}.exposes`, source: id, target: center.id, kind: "EXPOSES" });
  });

  return {
    layer: "TECHNOLOGY",
    title: CARTOGRAPHY_LAYER_LABELS["TECHNOLOGY"],
    description: "Approches IA envisagées, applications et APIs.",
    nodes,
    edges,
    metrics: [
      { label: "Approches retenues", value: String(approachFlags.filter(([f]) => !!f).length) },
      { label: "Applications", value: String(arch?.applications.length ?? 0) },
      { label: "APIs", value: String(arch?.apis.length ?? 0) },
    ],
  };
}

// -------------------------------------------------------------
// RISK — risques évalués + signaux du moteur de maturité
// -------------------------------------------------------------
export function buildRiskGraph(
  snap: ProjectSnapshot,
  signals: Signal[],
): Graph {
  const r = snap.riskAssessment;
  if (!r && signals.length === 0) {
    return emptyGraph(
      "RISK",
      "Évaluer les risques pour générer la cartographie.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const center: Node = {
    id: "risk.project",
    layer: "RISK",
    category: "TECH",
    label: snap.name,
  };
  nodes.push(center);

  const axes: [string | null, number | null | undefined][] = [
    ["RGPD", r?.rgpdRisk],
    ["Données sensibles", r?.sensitiveDataRisk],
    ["Hallucinations", r?.hallucinationRisk],
    ["Biais", r?.biasRisk],
    ["Classification", r?.classificationRisk],
    ["Décision automatisée", r?.autoDecisionRisk],
    ["Sécurité", r?.securityRisk],
    ["Dépendance fournisseur", r?.vendorLockRisk],
    ["Adoption", r?.adoptionRisk],
    ["Supervision", r?.supervisionRisk],
  ];

  axes.forEach(([label, value], i) => {
    if (label == null || value == null) return;
    const id = `risk.ax.${i}`;
    nodes.push({
      id,
      layer: "RISK",
      category: "RISK",
      label,
      weight: value,
      severity: value >= 4 ? "CRITICAL" : value >= 3 ? "WARNING" : "INFO",
      description: `Niveau ${value}/5`,
    });
    edges.push({ id: `${id}.triggers`, source: id, target: center.id, kind: "TRIGGERS" });
  });

  // Surface engine-detected signals as risk nodes too.
  signals
    .filter((s) => s.category === "RISK" || s.category === "GOVERNANCE")
    .forEach((s) => {
      const id = `risk.sig.${s.id}`;
      nodes.push({
        id,
        layer: "RISK",
        category: "RISK",
        label: s.title,
        description: s.detail,
        severity: s.severity,
      });
      edges.push({ id: `${id}.triggers`, source: id, target: center.id, kind: "TRIGGERS" });
    });

  return {
    layer: "RISK",
    title: CARTOGRAPHY_LAYER_LABELS["RISK"],
    description: "Risques évalués sur les 10 axes + signaux détectés par le moteur.",
    nodes,
    edges,
    metrics: [
      { label: "Niveau global", value: r?.overallRisk ?? "—" },
      {
        label: "Risques critiques",
        value: String(
          nodes.filter((n) => n.layer === "RISK" && n.severity === "CRITICAL").length,
        ),
      },
    ],
  };
}

// -------------------------------------------------------------
// GOVERNANCE — rôles, validations, contrôles, supervision
// -------------------------------------------------------------
export function buildGovernanceGraph(snap: ProjectSnapshot): Graph {
  const arch = snap.architecture;
  const risk = snap.riskAssessment;
  const da = snap.dataAssessment;

  const hasAnything =
    arch?.humanValidation ||
    arch?.traceability ||
    da?.personalData ||
    snap.sponsor ||
    risk?.mitigationPlan;

  if (!hasAnything) {
    return emptyGraph(
      "GOVERNANCE",
      "Compléter sponsor, validation humaine, traçabilité, RGPD ou plan de mitigation.",
    );
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const project: Node = {
    id: "gov.project",
    layer: "GOVERNANCE",
    category: "TECH",
    label: snap.name,
  };
  nodes.push(project);

  if (snap.sponsor) {
    const id = "gov.sponsor";
    nodes.push({ id, layer: "GOVERNANCE", category: "ROLE", label: `Sponsor : ${snap.sponsor}` });
    edges.push({ id: `${id}.owns`, source: id, target: project.id, kind: "OWNS" });
  }
  if (snap.direction) {
    const id = "gov.direction";
    nodes.push({ id, layer: "GOVERNANCE", category: "ROLE", label: `Direction : ${snap.direction}` });
    edges.push({ id: `${id}.owns`, source: id, target: project.id, kind: "OWNS" });
  }
  if (arch?.humanValidation) {
    const id = "gov.human";
    nodes.push({
      id,
      layer: "GOVERNANCE",
      category: "CONTROL",
      label: "Validation humaine",
      severity: "INFO",
    });
    edges.push({ id: `${id}.validates`, source: id, target: project.id, kind: "VALIDATES" });
  }
  if (arch?.traceability) {
    const id = "gov.trace";
    nodes.push({
      id,
      layer: "GOVERNANCE",
      category: "CONTROL",
      label: "Traçabilité / audit",
      description: arch.traceability,
    });
    edges.push({ id: `${id}.mitigates`, source: id, target: project.id, kind: "MITIGATES" });
  }
  if (da?.personalData) {
    const id = "gov.dpo";
    nodes.push({
      id,
      layer: "GOVERNANCE",
      category: "ROLE",
      label: "DPO / RSSI",
      severity: "WARNING",
    });
    edges.push({ id: `${id}.validates`, source: id, target: project.id, kind: "VALIDATES" });
  }
  if (risk?.mitigationPlan) {
    const id = "gov.mitigation";
    nodes.push({
      id,
      layer: "GOVERNANCE",
      category: "CONTROL",
      label: "Plan de mitigation",
      description: truncate(risk.mitigationPlan, 200),
    });
    edges.push({ id: `${id}.mitigates`, source: id, target: project.id, kind: "MITIGATES" });
  }

  return {
    layer: "GOVERNANCE",
    title: CARTOGRAPHY_LAYER_LABELS["GOVERNANCE"],
    description: "Sponsors, contrôles, supervision humaine et plan de mitigation.",
    nodes,
    edges,
    metrics: [
      { label: "Supervision humaine", value: arch?.humanValidation ? "Oui" : "Non" },
      { label: "Traçabilité", value: arch?.traceability ? "Oui" : "Non" },
      { label: "Plan de mitigation", value: risk?.mitigationPlan ? "Oui" : "Non" },
    ],
  };
}

// -------------------------------------------------------------
// helpers
// -------------------------------------------------------------
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function splitInline(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function splitSteps(s: string | null): string[] {
  if (!s) return [];
  // Recognise "1.", "1)", "- ", "→", "puis", newlines, bullets.
  const cleaned = s
    .replace(/(\d+[.)])\s*/g, "\n")
    .replace(/\s*→\s*/g, "\n")
    .replace(/\s*-\s+/g, "\n")
    .replace(/\s+puis\s+/gi, "\n");
  return cleaned
    .split(/\n+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .slice(0, 12); // Cap at 12 steps for layout sanity.
}

// -------------------------------------------------------------
// Orchestrator: build all layers in one shot.
// -------------------------------------------------------------
import type { Cartography } from "./types";

export function buildCartography(
  snap: ProjectSnapshot,
  scoring?: ScoringResult,
  decision?: DecisionResult,
): Cartography {
  const signals = scoring?.signals ?? [];
  return {
    projectId: snap.id,
    generatedAt: new Date().toISOString(),
    layers: {
      BUSINESS: buildBusinessGraph(snap),
      WORKFLOW: buildWorkflowGraph(snap),
      DATA: buildDataGraph(snap),
      TECHNOLOGY: buildTechnologyGraph(snap, decision),
      RISK: buildRiskGraph(snap, signals),
      GOVERNANCE: buildGovernanceGraph(snap),
    },
  };
}
