// Extrait depuis le snapshot atelier 7 (qui contient les données 1-6
// consolidées) un objet plat sérialisable utilisé par le composant
// VisualReport rendu côté client. Tout ce qui est calculé via les
// reasoners est aussi pré-calculé ici pour éviter d'importer prisma /
// engines dans le client.

import {
  aggregateScore,
  computeAutoScorecard,
} from "@/lib/engines/atelier4";
import {
  aggregateGovernanceScore,
  computeComplianceByFramework,
  computeDimensionScores,
  computeSecurityCoverage,
} from "@/lib/engines/atelier6";
import {
  computeFinalDecision,
  computeGlobalProjectScore,
  computeIndustrializationReadiness,
  type Atelier7Snapshot,
} from "@/lib/engines/atelier7";
import { DECISION_LABELS, type Decision } from "@/types";
import {
  OVERALL_LEVEL_LABELS,
  SCORECARD_AXES,
  SCORECARD_AXIS_LABELS,
  SCORECARD_AXIS_SHORT,
  type OverallLevel,
} from "@/types/atelier4";
import {
  COMPLIANCE_FRAMEWORK_LABELS,
  GOVERNANCE_LEVEL_LABELS,
  type ComplianceFramework,
  type GovernanceLevel,
  type IncidentType,
} from "@/types/atelier6";
import {
  INDUSTRIALIZATION_STAGE_LABELS,
  ROADMAP_PHASE_LABELS,
  SPONSOR_DECISION_LABELS,
  type IndustrializationStage,
  type RoadmapPhase,
  type SponsorDecision,
} from "@/types/atelier7";

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export type VisualReportData = {
  projectName: string;
  generatedAt: string;
  cover: {
    decision: Decision;
    decisionLabel: string;
    rationale: string;
    overall: number;
    scoringScore: number;
    governanceScore: number;
    visionScore: number;
    readinessScore: number;
    overallLevel: OverallLevel;
    overallLevelLabel: string;
    sponsorReadyToSign: boolean;
    sponsorDecisionLabel: string | null;
    sponsorName: string | null;
    sponsorDate: string | null;
    strongPoints: string[];
    weakPoints: string[];
    mainRisks: string[];
  };
  a1: {
    direction: string | null;
    sponsor: string | null;
    triggerEvent: string | null;
    priorityReason: string | null;
    initialRequest: string | null;
    reformulatedNeed: string | null;
    expectedValue: string | null;
    actors: { name: string; category: string; volume: number | null }[];
    irritants: { title: string; severity: string; category: string; estimatedMin: number | null }[];
    kpis: { name: string; currentValue: string | null; targetValue: string | null; unit: string | null; status: string }[];
    objectives: { title: string; priority: number }[];
    inScope: string[];
    outOfScope: string[];
  };
  a2: {
    workflowSteps: number;
    aiQualifiedSteps: number;
    automationQualifiedSteps: number;
    intelligenceNeeds: number;
    techCandidates: number;
    humanValidations: number;
  };
  a3: {
    docComplexity: string | null;
    formats: string[];
    rgpdApplicable: boolean;
    sensitiveData: boolean;
    euAiActTier: string | null;
    dpoConsulted: boolean;
    feasibilityLevel: string | null;
    maturityScores: { axis: string; label: string; score: number }[];
    finalRecommendation: string | null;
  };
  a4: {
    radarAxes: { key: string; label: string; short: string }[];
    radarValues: number[];
    autoFlags: Record<string, boolean>;
    overallScore: number;
    overallLevelLabel: string;
    recommendedDecisionLabel: string | null;
    decisionRationale: string | null;
    strongPoints: string[];
    weakPoints: string[];
    topRecommendations: string[];
  };
  a5: {
    annotations: number;
    criticalNodes: string[];
    missingComponents: string[];
    systemOverview: string | null;
  };
  a6: {
    governanceScore: number;
    governanceLevel: GovernanceLevel;
    governanceLevelLabel: string;
    dimensionScores: { id: string; label: string; score: number; rationale: string }[];
    raciActors: string[];
    raciScopes: string[];
    raciEntries: { actorRole: string; scope: string; responsibility: string }[];
    complianceByFramework: { framework: ComplianceFramework; frameworkLabel: string; score: number; compliant: number; partial: number; nonCompliant: number; total: number }[];
    securityCoverage: { domain: string; active: number; controls: number; status: string }[];
    monitoringKpis: { name: string; category: string; targetValue: string | null; alertThreshold: string | null }[];
    incidents: { type: IncidentType; severity: string; detection: string | null; postMortem: boolean }[];
    industrializationReadiness: boolean;
    synthesisStatement: string | null;
  };
  a7: {
    visionStatement: string | null;
    businessValue: string | null;
    businessValueScore: number | null;
    transformationScore: number | null;
    strategicObjectives: string[];
    successCriteria: string[];
    roadmapItems: {
      id: string;
      title: string;
      phase: RoadmapPhase;
      phaseLabel: string;
      effortMonths: number;
      status: "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
      impact: number;
      complexity: number;
      ownerRole: string | null;
    }[];
    industrializationStages: {
      stage: IndustrializationStage;
      stageLabel: string;
      ready: boolean;
      why?: string;
      planned: number;
    }[];
  };
};

export type A5Extra = {
  annotations: number;
  criticalNodes: string[];
  missingComponents: string[];
  systemOverview: string | null;
};

export function buildVisualReportData(snap: Atelier7Snapshot, a5Data?: A5Extra): VisualReportData {
  const a4 = snap.a4;
  const a6 = snap.a6;

  const globalScore = computeGlobalProjectScore(snap);
  const finalDecision = computeFinalDecision(snap);
  const a4Results = computeAutoScorecard(a4);
  const a4Agg = aggregateScore(a4Results);
  const a6Dims = computeDimensionScores(a6);
  const a6Agg = aggregateGovernanceScore(a6Dims);
  const compliance = computeComplianceByFramework(a6);
  const security = computeSecurityCoverage(a6);
  const readiness = computeIndustrializationReadiness(snap);

  // ----- Cover -----
  const sponsorDec = snap.synthesis?.sponsorDecision as SponsorDecision | null;
  const cover: VisualReportData["cover"] = {
    decision: finalDecision.decision,
    decisionLabel: DECISION_LABELS[finalDecision.decision],
    rationale: snap.synthesis?.decisionRationale ?? finalDecision.rationale,
    overall: globalScore.overall,
    scoringScore: globalScore.scoringScore,
    governanceScore: globalScore.governanceScore,
    visionScore: globalScore.visionScore,
    readinessScore: globalScore.readinessScore,
    overallLevel: a4Agg.overallLevel,
    overallLevelLabel: OVERALL_LEVEL_LABELS[a4Agg.overallLevel],
    sponsorReadyToSign: finalDecision.sponsorReadyToSign,
    sponsorDecisionLabel: sponsorDec ? SPONSOR_DECISION_LABELS[sponsorDec] : null,
    sponsorName: snap.synthesis?.sponsorName ?? null,
    sponsorDate: snap.synthesis?.sponsorDecisionDate ? new Date(snap.synthesis.sponsorDecisionDate).toISOString().slice(0, 10) : null,
    strongPoints: safeJSON<string[]>(snap.synthesis?.strongPoints, finalDecision.strongPoints),
    weakPoints: safeJSON<string[]>(snap.synthesis?.weakPoints, finalDecision.weakPoints),
    mainRisks: safeJSON<string[]>(snap.synthesis?.mainRisks, finalDecision.mainRisks),
  };

  // ----- Atelier 1 -----
  const a1q = a4.qualification;
  const bn = a4.businessNeed;
  const a1: VisualReportData["a1"] = {
    direction: a1q?.directionConcerned ?? null,
    sponsor: a1q?.businessOwner ?? null,
    triggerEvent: a1q?.triggerEvent ?? null,
    priorityReason: a1q?.priorityReason ?? null,
    initialRequest: bn?.initialRequest ?? null,
    reformulatedNeed: bn?.reformulatedNeed ?? null,
    expectedValue: bn?.expectedValue ?? null,
    actors: a4.actors.map((a) => ({ name: a.name, category: a.category, volume: a.volume })),
    irritants: a4.irritants.map((i) => ({ title: i.title, severity: i.severity, category: i.category, estimatedMin: i.estimatedTimeWastedMinPerDay })),
    kpis: a4.kpis.map((k) => ({ name: k.name, currentValue: k.currentValue, targetValue: k.targetValue, unit: k.unit, status: k.measureStatus })),
    objectives: a4.objectives.map((o) => ({ title: o.title, priority: o.priority })),
    inScope: safeJSON<string[]>(a4.scope?.inScope, []),
    outOfScope: safeJSON<string[]>(a4.scope?.outOfScope, []),
  };

  // ----- Atelier 2 -----
  const a2: VisualReportData["a2"] = {
    workflowSteps: a4.processSteps.length,
    aiQualifiedSteps: a4.taskQualifications.filter((t) => t.verdict === "AI" || t.verdict === "HYBRID").length,
    automationQualifiedSteps: a4.taskQualifications.filter((t) => t.verdict === "AUTOMATION").length,
    intelligenceNeeds: 0,
    techCandidates: 0,
    humanValidations: a6.humanValidations.length,
  };

  // ----- Atelier 3 -----
  const doc = a4.documentAnalysis;
  const reg = a4.regulatoryAnalysis;
  const mat = a4.maturity;
  const feas = a4.feasibility;
  const a3Synth = a4.synthesis;
  const a3: VisualReportData["a3"] = {
    docComplexity: doc?.complexityLevel ?? null,
    formats: safeJSON<string[]>(doc?.formats, []),
    rgpdApplicable: Boolean(reg?.rgpdApplicable),
    sensitiveData: Boolean(reg?.sensitiveDataConcerned),
    euAiActTier: reg?.euAiActTier ?? null,
    dpoConsulted: Boolean(reg?.dpoConsulted),
    feasibilityLevel: feas?.overallFeasibility ?? null,
    maturityScores: mat
      ? [
          { axis: "needClarity", label: "Besoin clair", score: mat.needClarity ?? 0 },
          { axis: "workflowKnowledge", label: "Workflow", score: mat.workflowKnowledge ?? 0 },
          { axis: "dataMaturity", label: "Data", score: mat.dataMaturity ?? 0 },
          { axis: "governanceMaturity", label: "Gouvernance", score: mat.governanceMaturity ?? 0 },
          { axis: "stakeholderAlignment", label: "Alignement", score: mat.stakeholderAlignment ?? 0 },
          { axis: "realismLevel", label: "Réalisme", score: mat.realismLevel ?? 0 },
        ]
      : [],
    finalRecommendation: a3Synth?.finalRecommendation ?? null,
  };

  // ----- Atelier 4 — radar -----
  const sc = a4.scorecard;
  const autoFlags = safeJSON<Record<string, boolean>>(sc?.autoFlags, {});
  const radarValues = SCORECARD_AXES.map((axis) => Number(sc?.[axis as keyof typeof sc] ?? 0));
  const a4Data: VisualReportData["a4"] = {
    radarAxes: SCORECARD_AXES.map((axis) => ({
      key: axis,
      label: SCORECARD_AXIS_LABELS[axis],
      short: SCORECARD_AXIS_SHORT[axis],
    })),
    radarValues,
    autoFlags,
    overallScore: sc?.overallScore ?? a4Agg.overallScore,
    overallLevelLabel: OVERALL_LEVEL_LABELS[(sc?.overallLevel as OverallLevel) ?? a4Agg.overallLevel],
    recommendedDecisionLabel: a4.a4Synthesis?.recommendedDecision ? DECISION_LABELS[a4.a4Synthesis.recommendedDecision as Decision] : null,
    decisionRationale: a4.a4Synthesis?.decisionRationale ?? null,
    strongPoints: safeJSON<string[]>(a4.a4Synthesis?.strongPoints, []),
    weakPoints: safeJSON<string[]>(a4.a4Synthesis?.weakPoints, []),
    topRecommendations: safeJSON<string[]>(a4.a4Synthesis?.topRecommendations, []),
  };

  // ----- Atelier 5 -----
  // L'atelier 5 (cartographie / synthèse) n'est pas dans Atelier4Snapshot.
  // On le passe en option depuis la page (loadAtelier5Snapshot). Si absent,
  // la section reste compacte avec des placeholders.
  const a5: VisualReportData["a5"] = {
    annotations: a5Data?.annotations ?? 0,
    criticalNodes: a5Data?.criticalNodes ?? [],
    missingComponents: a5Data?.missingComponents ?? [],
    systemOverview: a5Data?.systemOverview ?? null,
  };

  // ----- Atelier 6 -----
  const raciActors = Array.from(new Set(a6.governanceRoles.map((r) => r.actorRole))).sort();
  const raciScopes = Array.from(new Set(a6.governanceRoles.map((r) => r.scope)));
  const a6Data: VisualReportData["a6"] = {
    governanceScore: a6Agg.overall,
    governanceLevel: a6Agg.level,
    governanceLevelLabel: GOVERNANCE_LEVEL_LABELS[a6Agg.level],
    dimensionScores: a6Dims.map((d) => ({ id: d.id, label: d.label, score: d.score, rationale: d.rationale })),
    raciActors,
    raciScopes,
    raciEntries: a6.governanceRoles.map((r) => ({ actorRole: r.actorRole, scope: r.scope, responsibility: r.responsibilityType })),
    complianceByFramework: compliance.map((c) => ({
      framework: c.framework,
      frameworkLabel: COMPLIANCE_FRAMEWORK_LABELS[c.framework],
      score: c.score,
      compliant: c.compliant,
      partial: c.partial,
      nonCompliant: c.nonCompliant,
      total: c.total,
    })),
    securityCoverage: security.map((s) => ({ domain: s.domain, active: s.active, controls: s.controls, status: s.status })),
    monitoringKpis: a6.monitoringKpis.map((k) => ({ name: k.name, category: k.category, targetValue: k.targetValue, alertThreshold: k.alertThreshold })),
    incidents: a6.incidentProcedures.map((p) => ({ type: p.incidentType as IncidentType, severity: p.severity, detection: p.detectionMethod, postMortem: p.postIncidentReview })),
    industrializationReadiness: Boolean(a6.synthesis?.industrializationReadiness),
    synthesisStatement: a6.synthesis?.overallStatement ?? null,
  };

  // ----- Atelier 7 -----
  const v = snap.vision;
  const a7: VisualReportData["a7"] = {
    visionStatement: v?.visionStatement ?? null,
    businessValue: v?.businessValue ?? null,
    businessValueScore: v?.businessValueScore ?? null,
    transformationScore: v?.transformationScore ?? null,
    strategicObjectives: safeJSON<string[]>(v?.strategicObjectives, []),
    successCriteria: safeJSON<string[]>(v?.successCriteria, []),
    roadmapItems: snap.roadmapItems.map((i) => ({
      id: i.id,
      title: i.title,
      phase: i.phase as RoadmapPhase,
      phaseLabel: ROADMAP_PHASE_LABELS[i.phase as RoadmapPhase],
      effortMonths: i.effortMonths ?? 1,
      status: i.status as "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED",
      impact: i.impact,
      complexity: i.complexity,
      ownerRole: i.ownerRole,
    })),
    industrializationStages: readiness.map((r) => ({
      stage: r.stage,
      stageLabel: INDUSTRIALIZATION_STAGE_LABELS[r.stage],
      ready: r.ready,
      why: r.why,
      planned: snap.industrializationSteps.filter((s) => s.stage === r.stage).length,
    })),
  };

  return {
    projectName: snap.projectName,
    generatedAt: new Date().toISOString().slice(0, 10),
    cover,
    a1,
    a2,
    a3,
    a4: a4Data,
    a5,
    a6: a6Data,
    a7,
  };
}
