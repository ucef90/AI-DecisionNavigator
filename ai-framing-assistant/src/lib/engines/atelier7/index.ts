// Atelier 7 — Architecture cible, roadmap et décision finale IA
//
// LE SOMMET du framework. L'engine :
//   1. Consolide les données des 7 ateliers (1 → 6 + spécifique 7)
//   2. Calcule le SCORE GLOBAL PROJET (consolidation atelier 4 + 6)
//   3. Produit la DÉCISION FINALE argumentée (GO / POC / Auto / Étude / NO GO)
//   4. Suggère une roadmap si vide
//   5. Évalue la readiness industrialisation
//   6. Génère la synthèse stratégique exécutive

import { prisma } from "@/lib/prisma";
import type { Decision } from "@/types";
import {
  aggregateScore,
  computeAutoScorecard,
  loadAtelier4Snapshot,
  recommendDecision,
  type Atelier4Snapshot,
} from "@/lib/engines/atelier4";
import {
  aggregateGovernanceScore,
  computeDimensionScores,
  reasonGovernance,
  type Atelier6Snapshot,
} from "@/lib/engines/atelier6";
import {
  ATELIER7_PHASES,
  allA7Sections,
  classifyQuadrant,
  type Atelier7PhaseId,
  type Atelier7SectionId,
  type IndustrializationStage,
  type RoadmapPhase,
} from "@/types/atelier7";

export type Atelier7Snapshot = {
  projectId: string;
  projectName: string;
  // Données ateliers 1-6 (réutilisation des snapshots)
  a4: Atelier4Snapshot;
  a6: Atelier6Snapshot;
  // Données spécifiques atelier 7
  vision: Awaited<ReturnType<typeof prisma.strategicVision.findUnique>>;
  roadmapItems: Awaited<ReturnType<typeof prisma.roadmapItem.findMany>>;
  industrializationSteps: Awaited<ReturnType<typeof prisma.industrializationStep.findMany>>;
  synthesis: Awaited<ReturnType<typeof prisma.atelier7Synthesis.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier7Gate.findUnique>>;
};

export async function loadAtelier7Snapshot(projectId: string): Promise<Atelier7Snapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  // On charge les snapshots atelier 4 et 6 (qui chargent eux-mêmes les
  // données amont). Atelier 4 = score scoring. Atelier 6 = gouvernance.
  const [a4Maybe, a6Maybe, vision, roadmapItems, industrializationSteps, synthesis, gate] =
    await Promise.all([
      loadAtelier4Snapshot(projectId),
      // Atelier 6 : on récupère ses données via une fonction dédiée
      loadA6ForA7(projectId),
      prisma.strategicVision.findUnique({ where: { projectId } }),
      prisma.roadmapItem.findMany({
        where: { projectId },
        orderBy: [{ phase: "asc" }, { position: "asc" }, { createdAt: "asc" }],
      }),
      prisma.industrializationStep.findMany({
        where: { projectId },
        orderBy: { stage: "asc" },
      }),
      prisma.atelier7Synthesis.findUnique({ where: { projectId } }),
      prisma.atelier7Gate.findUnique({ where: { projectId } }),
    ]);

  if (!a4Maybe || !a6Maybe) return null;

  return {
    projectId: project.id,
    projectName: project.name,
    a4: a4Maybe,
    a6: a6Maybe,
    vision,
    roadmapItems,
    industrializationSteps,
    synthesis,
    gate,
  };
}

// Helper minimal pour charger un Atelier6Snapshot (évite import circulaire)
async function loadA6ForA7(projectId: string): Promise<Atelier6Snapshot | null> {
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
    prisma.governanceRole.findMany({ where: { projectId } }),
    prisma.securityControl.findMany({ where: { projectId } }),
    prisma.complianceItem.findMany({ where: { projectId } }),
    prisma.monitoringKpi.findMany({ where: { projectId } }),
    prisma.incidentProcedure.findMany({ where: { projectId } }),
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
// CONSOLIDATION SCORE GLOBAL PROJET
// -------------------------------------------------------------
export type GlobalProjectScore = {
  overall: number; // 0..100
  scoringScore: number; // atelier 4
  governanceScore: number; // atelier 6
  visionScore: number; // atelier 7 (business + transformation)
  readinessScore: number; // industrialisation readiness
};

export function computeGlobalProjectScore(snap: Atelier7Snapshot): GlobalProjectScore {
  const a4Results = computeAutoScorecard(snap.a4);
  const { overallScore: scoringScore } = aggregateScore(a4Results);

  const a6Dims = computeDimensionScores(snap.a6);
  const { overall: governanceScore } = aggregateGovernanceScore(a6Dims);

  const bv = snap.vision?.businessValueScore ?? 0;
  const ts = snap.vision?.transformationScore ?? 0;
  const visionScore = Math.round(((bv + ts) / 10) * 100);

  // Readiness = somme des stages DONE + IN_PROGRESS
  const stagesDone = snap.industrializationSteps.filter((s) => s.status === "DONE").length;
  const stagesInProg = snap.industrializationSteps.filter((s) => s.status === "IN_PROGRESS").length;
  const readinessScore = Math.min(100, Math.round((stagesDone * 20 + stagesInProg * 10) * 1.0));

  // Pondération : scoring 40%, gouvernance 30%, vision 20%, readiness 10%
  const overall = Math.round(
    scoringScore * 0.4 + governanceScore * 0.3 + visionScore * 0.2 + readinessScore * 0.1,
  );

  return { overall, scoringScore, governanceScore, visionScore, readinessScore };
}

// -------------------------------------------------------------
// DÉCISION FINALE IA — reasoner consolidé
// -------------------------------------------------------------
export type FinalDecisionResult = {
  decision: Decision;
  rationale: string;
  strongPoints: string[];
  weakPoints: string[];
  mainRisks: string[];
  sponsorReadyToSign: boolean;
};

export function computeFinalDecision(snap: Atelier7Snapshot): FinalDecisionResult {
  // 1. Si une décision a été éditée en synthèse atelier 4, on l'utilise comme suggestion forte
  const a4Decision = snap.a4.a4Synthesis?.recommendedDecision as Decision | undefined;
  // 2. Sinon on recalcule via le reasoner atelier 4
  const a4Results = computeAutoScorecard(snap.a4);
  const a4Reco = recommendDecision(snap.a4, a4Results);

  // 3. Critère gouvernance : si gouvernance < FRAGILE (40), on dégrade
  const a6Dims = computeDimensionScores(snap.a6);
  const { overall: govScore } = aggregateGovernanceScore(a6Dims);
  const govReasoning = reasonGovernance(snap.a6, a6Dims);

  let decision: Decision = a4Decision ?? a4Reco.decision;
  let rationale = a4Reco.rationale;

  // Gouvernance critique override : si décision = GO_IA mais gouvernance < 40, retourner POC
  if (decision === "GO_IA" && govScore < 40) {
    decision = "POC_IA";
    rationale = `Score scoring favorable mais gouvernance encore insuffisante (${govScore}/100) — POC requis avant industrialisation.`;
  }
  // Si décision = POC mais gouvernance critique (< 20), retourner STUDY
  if (decision === "POC_IA" && govScore < 20) {
    decision = "STUDY";
    rationale = `Gouvernance critique (${govScore}/100) — sécuriser le cadre avant POC.`;
  }

  // Strong/weak points consolidés
  const strongPoints = [...a4Reco.strongPoints, ...govReasoning.strongPoints].slice(0, 6);
  const weakPoints = [...a4Reco.weakPoints, ...govReasoning.weakPoints].slice(0, 6);

  // Risques principaux : tous les axes risques scorés >= 4
  const r = snap.a4.riskAssessment;
  const mainRisks: string[] = [];
  if (r) {
    const axes: { key: keyof typeof r; label: string }[] = [
      { key: "rgpdRisk", label: "RGPD" },
      { key: "sensitiveDataRisk", label: "Données sensibles" },
      { key: "hallucinationRisk", label: "Hallucinations" },
      { key: "biasRisk", label: "Biais" },
      { key: "securityRisk", label: "Sécurité" },
      { key: "supervisionRisk", label: "Supervision insuffisante" },
      { key: "adoptionRisk", label: "Adoption" },
    ];
    for (const { key, label } of axes) {
      const v = r[key] as number | null;
      if (v && v >= 4) mainRisks.push(`${label} (${v}/5)`);
    }
  }

  const sponsorReadyToSign =
    decision === "GO_IA" || (decision === "POC_IA" && govScore >= 50 && weakPoints.length < 3);

  return {
    decision,
    rationale,
    strongPoints,
    weakPoints,
    mainRisks: mainRisks.slice(0, 5),
    sponsorReadyToSign,
  };
}

// -------------------------------------------------------------
// ROADMAP suggestion auto (si vide)
// -------------------------------------------------------------
export type RoadmapSuggestion = {
  phase: RoadmapPhase;
  title: string;
  description: string;
  impact: number;
  complexity: number;
  effortMonths: number;
  itemType: "QUICK_WIN" | "STRATEGIC" | "DEPENDENCY" | "RUN";
};

export function suggestRoadmap(snap: Atelier7Snapshot): RoadmapSuggestion[] {
  // Si la roadmap est déjà remplie, ne propose rien
  if (snap.roadmapItems.length > 0) return [];

  const suggestions: RoadmapSuggestion[] = [];

  // Phase 0 — POC
  suggestions.push({
    phase: "PHASE_0_POC",
    title: "POC sur 1 cas d'usage prioritaire",
    description: "Valider la pertinence techno sur 1 cas d'usage à fort impact et faible risque.",
    impact: 4,
    complexity: 2,
    effortMonths: 2,
    itemType: "QUICK_WIN",
  });
  // Si les données ne sont pas top
  if (snap.a4.dataAssessment?.quality && /faible|insuffisant|partiel/i.test(snap.a4.dataAssessment.quality)) {
    suggestions.push({
      phase: "PHASE_0_POC",
      title: "Améliorer la qualité data avant POC",
      description: "Nettoyage, désilotage, mise en place pipeline data minimal.",
      impact: 4,
      complexity: 3,
      effortMonths: 3,
      itemType: "DEPENDENCY",
    });
  }
  // Si DPO non consulté + données personnelles
  if (snap.a4.dataAssessment?.personalData && !snap.a4.regulatoryAnalysis?.dpoConsulted) {
    suggestions.push({
      phase: "PHASE_0_POC",
      title: "Consultation DPO + analyse impact RGPD",
      description: "Pré-requis légal avant tout traitement de données personnelles.",
      impact: 5,
      complexity: 2,
      effortMonths: 1,
      itemType: "DEPENDENCY",
    });
  }

  // Phase 1 — MVP
  suggestions.push({
    phase: "PHASE_1_MVP",
    title: "MVP avec supervision humaine systématique",
    description: "Mettre en production une version IA avec validation humaine bloquante sur 100% des cas.",
    impact: 4,
    complexity: 3,
    effortMonths: 4,
    itemType: "STRATEGIC",
  });
  // Si gouvernance faible
  const a6Dims = computeDimensionScores(snap.a6);
  const govDim = a6Dims.find((d) => d.id === "governance");
  if ((govDim?.score ?? 0) < 60) {
    suggestions.push({
      phase: "PHASE_1_MVP",
      title: "Mise en place gouvernance IA (RACI + comité)",
      description: "Comité gouvernance mensuel, RACI complet, formation équipe.",
      impact: 4,
      complexity: 3,
      effortMonths: 2,
      itemType: "STRATEGIC",
    });
  }

  // Phase 2 — Pilote
  suggestions.push({
    phase: "PHASE_2_PILOT",
    title: "Pilote sur périmètre élargi",
    description: "Élargir à plusieurs cas d'usage, monitorer dérives, KPI quotidiens.",
    impact: 5,
    complexity: 3,
    effortMonths: 4,
    itemType: "STRATEGIC",
  });

  // Phase 3 — Rollout
  suggestions.push({
    phase: "PHASE_3_ROLLOUT",
    title: "Déploiement progressif (waves)",
    description: "Rollout par vagues, formation utilisateurs, change management.",
    impact: 5,
    complexity: 4,
    effortMonths: 6,
    itemType: "STRATEGIC",
  });

  // Phase 4 — Run
  suggestions.push({
    phase: "PHASE_4_RUN",
    title: "Exploitation + amélioration continue",
    description: "Monitoring continu, re-training modèle, gouvernance opérationnelle.",
    impact: 3,
    complexity: 2,
    effortMonths: 12,
    itemType: "RUN",
  });

  return suggestions;
}

// -------------------------------------------------------------
// INDUSTRIALIZATION readiness check
// -------------------------------------------------------------
export type IndustrializationReadiness = {
  stage: IndustrializationStage;
  ready: boolean;
  why?: string;
};

export function computeIndustrializationReadiness(
  snap: Atelier7Snapshot,
): IndustrializationReadiness[] {
  const a6Dims = computeDimensionScores(snap.a6);
  const { overall: govScore } = aggregateGovernanceScore(a6Dims);
  const a4Results = computeAutoScorecard(snap.a4);
  const { overallScore: scoringScore } = aggregateScore(a4Results);

  return [
    {
      stage: "POC",
      ready: scoringScore >= 40,
      why: scoringScore < 40 ? `Score scoring < 40 (${scoringScore})` : undefined,
    },
    {
      stage: "MVP",
      ready: scoringScore >= 50 && snap.a6.humanValidations.length >= 1,
      why:
        scoringScore < 50
          ? `Score < 50 (${scoringScore})`
          : snap.a6.humanValidations.length === 0
            ? "Aucun point de validation humaine"
            : undefined,
    },
    {
      stage: "PILOT",
      ready: scoringScore >= 60 && govScore >= 40,
      why: scoringScore < 60 ? `Score < 60 (${scoringScore})` : govScore < 40 ? `Gouv < 40 (${govScore})` : undefined,
    },
    {
      stage: "ROLLOUT",
      ready: scoringScore >= 70 && govScore >= 60 && snap.a6.monitoringKpis.length >= 3,
      why:
        scoringScore < 70
          ? `Score < 70 (${scoringScore})`
          : govScore < 60
            ? `Gouv < 60 (${govScore})`
            : snap.a6.monitoringKpis.length < 3
              ? "Moins de 3 KPI monitoring"
              : undefined,
    },
    {
      stage: "RUN",
      ready: scoringScore >= 75 && govScore >= 70 && snap.a6.incidentProcedures.length >= 2,
      why:
        scoringScore < 75
          ? `Score < 75 (${scoringScore})`
          : govScore < 70
            ? `Gouv < 70 (${govScore})`
            : snap.a6.incidentProcedures.length < 2
              ? "Moins de 2 procédures incident"
              : undefined,
    },
  ];
}

// -------------------------------------------------------------
// IMPACT/COMPLEXITY matrix (priorisation)
// -------------------------------------------------------------
export type PriorityMatrixItem = {
  id: string;
  title: string;
  impact: number;
  complexity: number;
  quadrant: ReturnType<typeof classifyQuadrant>;
  phase: RoadmapPhase;
};

export function computePriorityMatrix(snap: Atelier7Snapshot): PriorityMatrixItem[] {
  return snap.roadmapItems.map((i) => ({
    id: i.id,
    title: i.title,
    impact: i.impact,
    complexity: i.complexity,
    quadrant: classifyQuadrant(i.impact, i.complexity),
    phase: i.phase as RoadmapPhase,
  }));
}

// -------------------------------------------------------------
// Progress + gate
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";
export type SectionProgress = { id: Atelier7SectionId; status: SectionStatus; note?: string };

export function computeA7Progress(snap: Atelier7Snapshot): Record<Atelier7SectionId, SectionProgress> {
  const out = {} as Record<Atelier7SectionId, SectionProgress>;
  const set = (id: Atelier7SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };

  set("executive-cockpit", { status: snap.synthesis?.globalProjectScore ? "COMPLETE" : "STARTED" });

  const v = snap.vision;
  const vFilled =
    (v?.visionStatement ? 1 : 0) + (v?.strategicObjectives ? 1 : 0) + (v?.businessValue ? 1 : 0);
  set("vision", { status: vFilled === 0 ? "EMPTY" : vFilled >= 2 ? "COMPLETE" : "STARTED" });

  // Architecture cible : on regarde si TargetArchitectureNode atelier 2 existe
  set("architecture", {
    status: snap.a4.taskQualifications.length > 0 ? "COMPLETE" : "EMPTY",
    note: snap.a4.taskQualifications.length > 0 ? "depuis atelier 2" : undefined,
  });

  set("prioritization", {
    status:
      snap.roadmapItems.length === 0
        ? "EMPTY"
        : snap.roadmapItems.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.roadmapItems.length} item(s)`,
  });

  set("roadmap", {
    status:
      snap.roadmapItems.length === 0
        ? "EMPTY"
        : snap.roadmapItems.length < 4
          ? "STARTED"
          : "COMPLETE",
  });

  set("industrialization", {
    status:
      snap.industrializationSteps.length === 0
        ? "EMPTY"
        : snap.industrializationSteps.length < 3
          ? "STARTED"
          : "COMPLETE",
  });

  // governance-consolidation : reprend atelier 6
  set("governance-consolidation", {
    status: snap.a6.synthesis?.overallStatement ? "COMPLETE" : "EMPTY",
  });

  // pilotage : on regarde monitoring atelier 6
  set("pilotage", {
    status: snap.a6.monitoringKpis.length >= 3 ? "COMPLETE" : "EMPTY",
  });

  const s = snap.synthesis;
  set("final-decision", {
    status: s?.finalDecision ? (s.decisionRationale ? "COMPLETE" : "STARTED") : "EMPTY",
  });

  set("deliverable", { status: snap.gate?.deliverableExported ? "COMPLETE" : "EMPTY" });

  const g = snap.gate;
  set("gate", {
    status: g?.verdict === "CLOSED" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY",
  });

  return out;
}

export function a7OverallProgress(snap: Atelier7Snapshot): number {
  const sections = allA7Sections();
  const prog = computeA7Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a7PhaseProgress(snap: Atelier7Snapshot, phaseId: Atelier7PhaseId): number {
  const phase = ATELIER7_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA7Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

export type A7GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier7Snapshot["gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA7Gate(snap: Atelier7Snapshot): A7GateCriterion[] {
  const v = snap.vision;
  const visionDefined = Boolean(v?.visionStatement?.trim() && v?.businessValue?.trim());
  const roadmapBuilt = snap.roadmapItems.length >= 4;
  const indusPlanned = snap.industrializationSteps.length >= 3;
  const fd = snap.synthesis?.finalDecision;
  const sponsor = snap.synthesis?.sponsorDecision;

  return [
    {
      id: "visionDefined",
      label: "Vision stratégique définie (énoncé + valeur business)",
      met: visionDefined,
      why: !visionDefined ? "Vision ou valeur business manquante." : undefined,
    },
    {
      id: "roadmapBuilt",
      label: "Roadmap construite (≥ 4 items)",
      met: roadmapBuilt,
      why: !roadmapBuilt ? `${snap.roadmapItems.length}/4 item(s).` : undefined,
    },
    {
      id: "industrializationPlanned",
      label: "Plan industrialisation (≥ 3 stages)",
      met: indusPlanned,
      why: !indusPlanned ? `${snap.industrializationSteps.length}/3 stage(s).` : undefined,
    },
    {
      id: "finalDecisionMade",
      label: "Décision finale prise",
      met: Boolean(fd),
      why: !fd ? "Pas de décision saisie." : undefined,
    },
    {
      id: "sponsorSignOff",
      label: "Sponsor a validé (OK)",
      met: sponsor === "OK",
      why: sponsor !== "OK" ? `Sponsor : ${sponsor ?? "non décidé"}.` : undefined,
    },
    {
      id: "deliverableExported",
      label: "Dossier stratégique exporté",
      met: Boolean(snap.gate?.deliverableExported),
      why: !snap.gate?.deliverableExported ? "Pas encore exporté." : undefined,
    },
  ];
}

export function isA7GateReady(snap: Atelier7Snapshot): boolean {
  return computeA7Gate(snap).every((c) => c.met);
}
