// Atelier 6 — Gouvernance, risques et conformité IA
//
// L'engine fait 3 choses :
//   1. AUTO-SCORE 6 dimensions de gouvernance (governance, validations,
//      risks, security, compliance, monitoring) basées sur ce qui a été
//      collecté dans les ateliers 1-5.
//   2. AGRÈGE en score gouvernance /100 + niveau (CRITICAL → EXCELLENT)
//      utilisable comme indicateur "industrialisation possible ?"
//   3. RAISONNE pour identifier points forts, points faibles, actions
//      prioritaires.

import { prisma } from "@/lib/prisma";
import {
  ATELIER6_PHASES,
  allA6Sections,
  governanceLevelFromScore,
  type Atelier6PhaseId,
  type Atelier6SectionId,
  type ComplianceFramework,
  type GovernanceLevel,
  type SecurityDomain,
} from "@/types/atelier6";

export type Atelier6Snapshot = {
  projectId: string;
  projectName: string;
  // Atelier 6 — data spécifique
  governanceRoles: Awaited<ReturnType<typeof prisma.governanceRole.findMany>>;
  securityControls: Awaited<ReturnType<typeof prisma.securityControl.findMany>>;
  complianceItems: Awaited<ReturnType<typeof prisma.complianceItem.findMany>>;
  monitoringKpis: Awaited<ReturnType<typeof prisma.monitoringKpi.findMany>>;
  incidentProcedures: Awaited<ReturnType<typeof prisma.incidentProcedure.findMany>>;
  synthesis: Awaited<ReturnType<typeof prisma.atelier6Synthesis.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier6Gate.findUnique>>;
  // Données dérivées (ateliers 2/3/4 + base)
  humanValidations: Awaited<ReturnType<typeof prisma.humanValidationPoint.findMany>>;
  regulatoryAnalysis: Awaited<ReturnType<typeof prisma.regulatoryAnalysis.findUnique>>;
  riskAssessment: Awaited<ReturnType<typeof prisma.riskAssessment.findUnique>>;
  dataAssessment: Awaited<ReturnType<typeof prisma.dataAssessment.findUnique>>;
  scorecard: Awaited<ReturnType<typeof prisma.projectScorecard.findUnique>>;
};

export async function loadAtelier6Snapshot(projectId: string): Promise<Atelier6Snapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  const [
    governanceRoles,
    securityControls,
    complianceItems,
    monitoringKpis,
    incidentProcedures,
    synthesis,
    gate,
    humanValidations,
    regulatoryAnalysis,
    riskAssessment,
    dataAssessment,
    scorecard,
  ] = await Promise.all([
    prisma.governanceRole.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.securityControl.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.complianceItem.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.monitoringKpi.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.incidentProcedure.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.atelier6Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier6Gate.findUnique({ where: { projectId } }),
    prisma.humanValidationPoint.findMany({ where: { projectId } }),
    prisma.regulatoryAnalysis.findUnique({ where: { projectId } }),
    prisma.riskAssessment.findUnique({ where: { projectId } }),
    prisma.dataAssessment.findUnique({ where: { projectId } }),
    prisma.projectScorecard.findUnique({ where: { projectId } }),
  ]);

  return {
    projectId: project.id,
    projectName: project.name,
    governanceRoles,
    securityControls,
    complianceItems,
    monitoringKpis,
    incidentProcedures,
    synthesis,
    gate,
    humanValidations,
    regulatoryAnalysis,
    riskAssessment,
    dataAssessment,
    scorecard,
  };
}

// -------------------------------------------------------------
// AUTO-SCORE — 6 dimensions × 0..100
// -------------------------------------------------------------
export type GovernanceDimensionId =
  | "governance"
  | "validations"
  | "risks"
  | "security"
  | "compliance"
  | "monitoring";

export const GOVERNANCE_DIMENSION_LABELS: Record<GovernanceDimensionId, string> = {
  governance: "Gouvernance (RACI)",
  validations: "Validations humaines",
  risks: "Maîtrise des risques",
  security: "Sécurité & accès",
  compliance: "Conformité",
  monitoring: "Monitoring & supervision",
};

export type DimensionScore = {
  id: GovernanceDimensionId;
  label: string;
  score: number; // 0..100
  rationale: string;
};

export function computeDimensionScores(snap: Atelier6Snapshot): DimensionScore[] {
  // 1. Gouvernance : RACI couvert ? Au moins 1 R + 1 A par scope clé.
  const roles = snap.governanceRoles;
  const scopesWithRA = new Set(
    roles
      .filter((r) => r.responsibilityType === "R" || r.responsibilityType === "A")
      .map((r) => r.scope),
  ).size;
  const govScore = Math.min(100, Math.round((scopesWithRA / 5) * 100));

  // 2. Validations : nb de points + criticité
  const validations = snap.humanValidations.length;
  const blockingValidations = snap.humanValidations.filter((v) => v.validationMode === "BLOCKING").length;
  const valScore =
    validations === 0 ? 0 : Math.min(100, 30 + validations * 15 + blockingValidations * 10);

  // 3. Risques : combien d'axes IA scorés + plan de mitigation
  const r = snap.riskAssessment;
  const scoredRiskAxes =
    (r?.hallucinationRisk ? 1 : 0) +
    (r?.biasRisk ? 1 : 0) +
    (r?.classificationRisk ? 1 : 0) +
    (r?.autoDecisionRisk ? 1 : 0) +
    (r?.supervisionRisk ? 1 : 0);
  const hasMitigation = Boolean(r?.mitigationPlan?.trim());
  const riskScore = Math.round(
    (scoredRiskAxes / 5) * 60 +
      (hasMitigation ? 25 : 0) +
      (snap.incidentProcedures.length >= 2 ? 15 : 0),
  );

  // 4. Sécurité : nb contrôles in_place + tested + couverture domaines
  const controls = snap.securityControls;
  const inPlace = controls.filter((c) => c.status === "IN_PLACE" || c.status === "TESTED").length;
  const domainsCovered = new Set(controls.map((c) => c.domain)).size;
  const secScore = Math.round((inPlace / 6) * 50 + (domainsCovered / 6) * 50);

  // 5. Conformité : taux items COMPLIANT vs total
  const compItems = snap.complianceItems.filter((i) => i.status !== "NOT_APPLICABLE");
  const compliantCount = compItems.filter((i) => i.status === "COMPLIANT").length;
  const partialCount = compItems.filter((i) => i.status === "PARTIAL").length;
  let compScore = 0;
  if (compItems.length > 0) {
    compScore = Math.round(((compliantCount + partialCount * 0.5) / compItems.length) * 100);
  } else if (snap.regulatoryAnalysis?.dpoConsulted) {
    compScore = 40; // DPO consulté = base
  }

  // 6. Monitoring : nb KPI + diversité catégories
  const kpis = snap.monitoringKpis;
  const kpiCats = new Set(kpis.map((k) => k.category)).size;
  const monScore = Math.round((kpis.length / 5) * 50 + (kpiCats / 4) * 50);

  return [
    {
      id: "governance",
      label: GOVERNANCE_DIMENSION_LABELS.governance,
      score: Math.min(100, govScore),
      rationale:
        scopesWithRA === 0
          ? "Aucun rôle RACI défini."
          : `${scopesWithRA} scope(s) avec R+A · ${roles.length} entrée(s) RACI.`,
    },
    {
      id: "validations",
      label: GOVERNANCE_DIMENSION_LABELS.validations,
      score: Math.min(100, valScore),
      rationale:
        validations === 0
          ? "Aucun point de validation humaine défini."
          : `${validations} point(s) · ${blockingValidations} bloquant(s).`,
    },
    {
      id: "risks",
      label: GOVERNANCE_DIMENSION_LABELS.risks,
      score: Math.min(100, riskScore),
      rationale:
        scoredRiskAxes === 0
          ? "Risques IA non évalués."
          : `${scoredRiskAxes}/5 axes IA scorés · ${hasMitigation ? "plan de mitigation" : "pas de plan"} · ${snap.incidentProcedures.length} procédure(s) incident.`,
    },
    {
      id: "security",
      label: GOVERNANCE_DIMENSION_LABELS.security,
      score: Math.min(100, secScore),
      rationale:
        controls.length === 0
          ? "Aucun contrôle sécurité défini."
          : `${inPlace}/${controls.length} contrôles actifs · ${domainsCovered}/6 domaines.`,
    },
    {
      id: "compliance",
      label: GOVERNANCE_DIMENSION_LABELS.compliance,
      score: Math.min(100, compScore),
      rationale:
        compItems.length === 0
          ? "Pas d'item conformité saisi."
          : `${compliantCount}/${compItems.length} conformes · ${partialCount} partiels.`,
    },
    {
      id: "monitoring",
      label: GOVERNANCE_DIMENSION_LABELS.monitoring,
      score: Math.min(100, monScore),
      rationale:
        kpis.length === 0
          ? "Aucun KPI à surveiller défini."
          : `${kpis.length} KPI · ${kpiCats} catégorie(s).`,
    },
  ];
}

export function aggregateGovernanceScore(dims: DimensionScore[]): {
  overall: number;
  level: GovernanceLevel;
} {
  if (dims.length === 0) return { overall: 0, level: "CRITICAL" };
  const overall = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  return { overall, level: governanceLevelFromScore(overall) };
}

// -------------------------------------------------------------
// Reasoner — points forts / points faibles / actions prioritaires
// -------------------------------------------------------------
export type GovernanceReasoning = {
  strongPoints: string[];
  weakPoints: string[];
  priorityActions: string[];
  overallStatement: string;
  industrializationReadiness: boolean;
};

export function reasonGovernance(
  snap: Atelier6Snapshot,
  dims: DimensionScore[],
): GovernanceReasoning {
  const { overall, level } = aggregateGovernanceScore(dims);

  const strongPoints = dims
    .filter((d) => d.score >= 70)
    .map((d) => `${d.label} (${d.score}/100)`);

  const weakPoints = dims
    .filter((d) => d.score < 40)
    .map((d) => `${d.label} (${d.score}/100)`);

  const priorityActions: string[] = [];
  for (const d of dims) {
    if (d.score < 40) {
      switch (d.id) {
        case "governance":
          priorityActions.push("Définir le RACI : pour chaque scope (IA, validation, sécurité, RGPD), nommer R + A.");
          break;
        case "validations":
          priorityActions.push("Identifier ≥ 2 points de validation humaine bloquante (réponses sensibles, données personnelles).");
          break;
        case "risks":
          priorityActions.push("Scorer les 5 axes risques IA + rédiger un plan de mitigation.");
          break;
        case "security":
          priorityActions.push("Mettre en place ≥ 4 contrôles sécurité (AUTH, RBAC, chiffrement, logs).");
          break;
        case "compliance":
          priorityActions.push("Compléter la checklist RGPD + EU AI Act, consulter DPO.");
          break;
        case "monitoring":
          priorityActions.push("Définir ≥ 3 KPI à surveiller (performance, qualité, dérive).");
          break;
      }
    }
  }

  if (snap.dataAssessment?.personalData && !snap.regulatoryAnalysis?.dpoConsulted) {
    priorityActions.unshift("URGENT : données personnelles présentes mais DPO non consulté.");
  }

  // Industrialisation prête ?
  const industrializationReadiness = level === "HIGH" || level === "EXCELLENT";

  const overallStatement =
    level === "EXCELLENT"
      ? `Gouvernance excellente (${overall}/100) — projet IA industrialisable avec un cadre robuste.`
      : level === "HIGH"
        ? `Gouvernance solide (${overall}/100) — passage à l'industrialisation envisageable.`
        : level === "MEDIUM"
          ? `Gouvernance partielle (${overall}/100) — combler les faiblesses avant industrialisation.`
          : level === "LOW"
            ? `Gouvernance faible (${overall}/100) — projet à risque sans renforcement.`
            : `Gouvernance critique (${overall}/100) — pas d'industrialisation possible en l'état.`;

  return {
    strongPoints,
    weakPoints,
    priorityActions: priorityActions.slice(0, 6),
    overallStatement,
    industrializationReadiness,
  };
}

// -------------------------------------------------------------
// Risk heatmap data — réutilise RiskAssessment
// -------------------------------------------------------------
export type RiskHeatmapItem = {
  axis: string;
  label: string;
  impact: number;
  probability: number;
};

export function computeRiskHeatmap(snap: Atelier6Snapshot): RiskHeatmapItem[] {
  const r = snap.riskAssessment;
  if (!r) return [];
  const items: { axis: keyof typeof r; label: string }[] = [
    { axis: "rgpdRisk", label: "RGPD" },
    { axis: "sensitiveDataRisk", label: "Données sensibles" },
    { axis: "hallucinationRisk", label: "Hallucinations" },
    { axis: "biasRisk", label: "Biais" },
    { axis: "classificationRisk", label: "Erreur classification" },
    { axis: "autoDecisionRisk", label: "Décision automatisée" },
    { axis: "securityRisk", label: "Sécurité" },
    { axis: "vendorLockRisk", label: "Vendor lock-in" },
    { axis: "adoptionRisk", label: "Adoption" },
    { axis: "supervisionRisk", label: "Supervision insuffisante" },
  ];
  const hasMitigation = Boolean(r.mitigationPlan?.trim());
  const validations = snap.humanValidations.length;
  return items
    .map((it) => {
      const score = (r[it.axis] as number | null) ?? 0;
      let probability = score;
      if (hasMitigation) probability = Math.max(1, probability - 1);
      if (validations >= 2) probability = Math.max(1, probability - 1);
      return { axis: it.axis as string, label: it.label, impact: score, probability };
    })
    .filter((it) => it.impact > 0);
}

// -------------------------------------------------------------
// Conformité — score par framework
// -------------------------------------------------------------
export type FrameworkScore = {
  framework: ComplianceFramework;
  total: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  score: number; // 0..100
};

export function computeComplianceByFramework(snap: Atelier6Snapshot): FrameworkScore[] {
  const groups = new Map<ComplianceFramework, FrameworkScore>();
  for (const item of snap.complianceItems) {
    if (item.status === "NOT_APPLICABLE") continue;
    const fw = item.framework as ComplianceFramework;
    if (!groups.has(fw)) {
      groups.set(fw, { framework: fw, total: 0, compliant: 0, partial: 0, nonCompliant: 0, score: 0 });
    }
    const g = groups.get(fw)!;
    g.total += 1;
    if (item.status === "COMPLIANT") g.compliant += 1;
    else if (item.status === "PARTIAL") g.partial += 1;
    else g.nonCompliant += 1;
  }
  for (const g of groups.values()) {
    g.score = g.total === 0 ? 0 : Math.round(((g.compliant + g.partial * 0.5) / g.total) * 100);
  }
  return Array.from(groups.values());
}

// -------------------------------------------------------------
// Sécurité — couverture par domaine
// -------------------------------------------------------------
export type SecurityCoverage = {
  domain: SecurityDomain;
  controls: number;
  active: number;
  status: "ACTIVE" | "PARTIAL" | "MISSING";
};

const ALL_SECURITY_DOMAINS: SecurityDomain[] = [
  "AUTH",
  "RBAC",
  "ENCRYPTION",
  "LOGS",
  "SEGMENTATION",
  "MONITORING",
  "BACKUP",
  "OTHER",
];

export function computeSecurityCoverage(snap: Atelier6Snapshot): SecurityCoverage[] {
  return ALL_SECURITY_DOMAINS.map((domain) => {
    const list = snap.securityControls.filter((c) => c.domain === domain);
    const active = list.filter((c) => c.status === "IN_PLACE" || c.status === "TESTED").length;
    const status: SecurityCoverage["status"] =
      list.length === 0
        ? "MISSING"
        : active === list.length
          ? "ACTIVE"
          : active > 0
            ? "PARTIAL"
            : "MISSING";
    return { domain, controls: list.length, active, status };
  });
}

// -------------------------------------------------------------
// Progress + gate
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";
export type SectionProgress = { id: Atelier6SectionId; status: SectionStatus; note?: string };

export function computeA6Progress(snap: Atelier6Snapshot): Record<Atelier6SectionId, SectionProgress> {
  const out = {} as Record<Atelier6SectionId, SectionProgress>;
  const set = (id: Atelier6SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };
  const dims = computeDimensionScores(snap);

  set("cockpit", { status: dims.some((d) => d.score > 0) ? "COMPLETE" : "EMPTY" });

  set("governance-roles", {
    status:
      snap.governanceRoles.length === 0
        ? "EMPTY"
        : snap.governanceRoles.length < 4
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.governanceRoles.length} entrée(s)`,
  });

  set("human-validations", {
    status:
      snap.humanValidations.length === 0
        ? "EMPTY"
        : snap.humanValidations.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.humanValidations.length} point(s)`,
  });

  const r = snap.riskAssessment;
  const scored = (r?.hallucinationRisk ? 1 : 0) + (r?.biasRisk ? 1 : 0) + (r?.classificationRisk ? 1 : 0);
  set("ai-risks", { status: scored === 0 ? "EMPTY" : scored < 3 ? "STARTED" : "COMPLETE", note: `${scored}/3 axes IA` });

  set("security", {
    status:
      snap.securityControls.length === 0
        ? "EMPTY"
        : snap.securityControls.length < 4
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.securityControls.length} contrôle(s)`,
  });

  set("compliance", {
    status:
      snap.complianceItems.length === 0
        ? "EMPTY"
        : snap.complianceItems.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.complianceItems.length} item(s)`,
  });

  // Audit trail = dérivé (monitoring + logs)
  const hasLogs = snap.securityControls.some(
    (c) => c.domain === "LOGS" && (c.status === "IN_PLACE" || c.status === "TESTED"),
  );
  set("audit-trail", { status: hasLogs ? "COMPLETE" : "EMPTY" });

  set("monitoring", {
    status:
      snap.monitoringKpis.length === 0
        ? "EMPTY"
        : snap.monitoringKpis.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.monitoringKpis.length} KPI`,
  });

  set("incidents", {
    status:
      snap.incidentProcedures.length === 0
        ? "EMPTY"
        : snap.incidentProcedures.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.incidentProcedures.length} procédure(s)`,
  });

  const s = snap.synthesis;
  const synthFilled =
    (s?.overallStatement ? 1 : 0) + (s?.governanceScore != null ? 1 : 0) + (s?.strongPoints ? 1 : 0);
  set("synthesis", { status: synthFilled === 0 ? "EMPTY" : synthFilled >= 2 ? "COMPLETE" : "STARTED" });

  const g = snap.gate;
  set("gate", {
    status: g?.verdict === "READY" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY",
  });

  return out;
}

export function a6OverallProgress(snap: Atelier6Snapshot): number {
  const sections = allA6Sections();
  const prog = computeA6Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a6PhaseProgress(snap: Atelier6Snapshot, phaseId: Atelier6PhaseId): number {
  const phase = ATELIER6_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA6Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

// -------------------------------------------------------------
// Gate atelier 7
// -------------------------------------------------------------
export type A6GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier6Snapshot["gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA6Gate(snap: Atelier6Snapshot): A6GateCriterion[] {
  const dims = computeDimensionScores(snap);
  const dimByid = Object.fromEntries(dims.map((d) => [d.id, d])) as Record<GovernanceDimensionId, DimensionScore>;
  const synthOk = Boolean(snap.synthesis?.overallStatement?.trim());

  return [
    {
      id: "governanceDefined",
      label: "Gouvernance RACI définie (≥ 4 entrées + scopes R+A)",
      met: dimByid.governance.score >= 60,
      why: dimByid.governance.score < 60 ? dimByid.governance.rationale : undefined,
    },
    {
      id: "validationsMapped",
      label: "Validations humaines mappées (≥ 2 points)",
      met: dimByid.validations.score >= 40,
      why: dimByid.validations.score < 40 ? dimByid.validations.rationale : undefined,
    },
    {
      id: "risksControlled",
      label: "Risques IA contrôlés (axes scorés + mitigation)",
      met: dimByid.risks.score >= 60,
      why: dimByid.risks.score < 60 ? dimByid.risks.rationale : undefined,
    },
    {
      id: "securityDefined",
      label: "Sécurité couverte (≥ 4 contrôles actifs)",
      met: dimByid.security.score >= 60,
      why: dimByid.security.score < 60 ? dimByid.security.rationale : undefined,
    },
    {
      id: "complianceChecked",
      label: "Conformité vérifiée (RGPD + EU AI Act)",
      met: dimByid.compliance.score >= 60,
      why: dimByid.compliance.score < 60 ? dimByid.compliance.rationale : undefined,
    },
    {
      id: "monitoringPlanned",
      label: "Monitoring planifié (≥ 3 KPI)",
      met: dimByid.monitoring.score >= 50,
      why: dimByid.monitoring.score < 50 ? dimByid.monitoring.rationale : undefined,
    },
    {
      id: "incidentsPrepared",
      label: "Playbook incidents (≥ 2 procédures)",
      met: snap.incidentProcedures.length >= 2,
      why: snap.incidentProcedures.length < 2 ? `${snap.incidentProcedures.length}/2 procédure(s).` : undefined,
    },
    {
      id: "synthesisWritten",
      label: "Synthèse gouvernance rédigée",
      met: synthOk,
      why: !synthOk ? "Pas de synthèse écrite." : undefined,
    },
  ];
}

export function isA6GateReady(snap: Atelier6Snapshot): boolean {
  return computeA6Gate(snap).every((c) => c.met);
}
