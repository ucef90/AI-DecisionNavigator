// Atelier 2 — engine.
//
// Same shape as the atelier 1 engine : a snapshot loader, per-section
// progress, live signals, gate criteria. Plus an extra reasoner that
// suggests a profile (AUTOMATION_ONLY / AI_HYBRID / etc.) based on
// the qualification matrix.

import { prisma } from "@/lib/prisma";
import {
  ATELIER2_PHASES,
  allA2Sections,
  type Atelier2PhaseId,
  type Atelier2Profile,
  type Atelier2SectionId,
  type TaskVerdict,
  type TechCode,
} from "@/types/atelier2";

export type Atelier2Snapshot = {
  projectId: string;
  projectName: string;
  // Atelier 1 — context referenced by atelier 2
  businessNeed: Awaited<ReturnType<typeof prisma.businessNeed.findUnique>>;
  processSteps: Awaited<ReturnType<typeof prisma.processStep.findMany>>;
  businessConstraints: Awaited<ReturnType<typeof prisma.businessConstraint.findMany>>;
  // Atelier 2 — specific data
  taskQualifications: Awaited<ReturnType<typeof prisma.taskQualification.findMany>>;
  complexity: Awaited<ReturnType<typeof prisma.complexityAssessment.findUnique>>;
  intelligenceNeeds: Awaited<ReturnType<typeof prisma.intelligenceNeed.findMany>>;
  technologies: Awaited<ReturnType<typeof prisma.technologyCandidate.findMany>>;
  humanValidations: Awaited<ReturnType<typeof prisma.humanValidationPoint.findMany>>;
  exceptions: Awaited<ReturnType<typeof prisma.processException.findMany>>;
  dependencies: Awaited<ReturnType<typeof prisma.technicalDependency.findMany>>;
  techRecommendations: Awaited<ReturnType<typeof prisma.techRecommendation.findMany>>;
  archNodes: Awaited<ReturnType<typeof prisma.targetArchitectureNode.findMany>>;
  archEdges: Awaited<ReturnType<typeof prisma.targetArchitectureEdge.findMany>>;
  synthesis: Awaited<ReturnType<typeof prisma.atelier2Synthesis.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier2Gate.findUnique>>;
  // Atelier 2 réutilise les risques existants (RiskAssessment) — mais
  // l'engine atelier 2 ne les modifie pas.
  riskAssessment: Awaited<ReturnType<typeof prisma.riskAssessment.findUnique>>;
};

export async function loadAtelier2Snapshot(projectId: string): Promise<Atelier2Snapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  const [
    businessNeed,
    processSteps,
    businessConstraints,
    taskQualifications,
    complexity,
    intelligenceNeeds,
    technologies,
    humanValidations,
    exceptions,
    dependencies,
    techRecommendations,
    archNodes,
    archEdges,
    synthesis,
    gate,
    riskAssessment,
  ] = await Promise.all([
    prisma.businessNeed.findUnique({ where: { projectId } }),
    prisma.processStep.findMany({ where: { projectId }, orderBy: { order: "asc" } }),
    prisma.businessConstraint.findMany({ where: { projectId } }),
    prisma.taskQualification.findMany({
      where: { projectId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
    prisma.complexityAssessment.findUnique({ where: { projectId } }),
    prisma.intelligenceNeed.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.technologyCandidate.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.humanValidationPoint.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.processException.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.technicalDependency.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.techRecommendation.findMany({ where: { projectId }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }] }),
    prisma.targetArchitectureNode.findMany({ where: { projectId }, orderBy: [{ posY: "asc" }, { posX: "asc" }] }),
    prisma.targetArchitectureEdge.findMany({ where: { projectId } }),
    prisma.atelier2Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier2Gate.findUnique({ where: { projectId } }),
    prisma.riskAssessment.findUnique({ where: { projectId } }),
  ]);

  return {
    projectId: project.id,
    projectName: project.name,
    businessNeed,
    processSteps,
    businessConstraints,
    taskQualifications,
    complexity,
    intelligenceNeeds,
    technologies,
    humanValidations,
    exceptions,
    dependencies,
    techRecommendations,
    archNodes,
    archEdges,
    synthesis,
    gate,
    riskAssessment,
  };
}

// -------------------------------------------------------------
// Section progress (same shape as atelier 1)
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";

export type SectionProgress = {
  id: Atelier2SectionId;
  status: SectionStatus;
  note?: string;
};

export function computeA2Progress(snap: Atelier2Snapshot): Record<Atelier2SectionId, SectionProgress> {
  const out = {} as Record<Atelier2SectionId, SectionProgress>;
  const set = (id: Atelier2SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };

  // qualification — réutilise l'atelier 1 (reformulation)
  const reformulated = (snap.businessNeed?.reformulatedNeed ?? "").trim();
  set("qualification", {
    status: reformulated.length === 0 ? "EMPTY" : reformulated.length >= 60 ? "COMPLETE" : "STARTED",
    note: reformulated ? `${reformulated.length} car.` : undefined,
  });

  // tasks
  set("tasks", {
    status:
      snap.taskQualifications.length === 0
        ? "EMPTY"
        : snap.taskQualifications.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.taskQualifications.length} tâche(s)`,
  });

  // workflows — réutilise les ProcessStep de l'atelier 1
  set("workflows", {
    status:
      snap.processSteps.length === 0
        ? "EMPTY"
        : snap.processSteps.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.processSteps.length} étape(s)`,
  });

  // rules — heuristique : compte les tâches dont rulesKnownAndFixed est positionné
  const rulesScored = snap.taskQualifications.filter(
    (t) => t.rulesKnownAndFixed || t.workflowStable || t.fewExceptions,
  ).length;
  set("rules", {
    status:
      snap.taskQualifications.length === 0
        ? "EMPTY"
        : rulesScored < snap.taskQualifications.length / 2
          ? "STARTED"
          : "COMPLETE",
    note: `${rulesScored}/${snap.taskQualifications.length} qualifiées`,
  });

  // complexity
  const c = snap.complexity;
  const cFilled =
    (c?.workflowComplexity ? 1 : 0) +
    (c?.documentComplexity ? 1 : 0) +
    (c?.decisionComplexity ? 1 : 0) +
    (c?.governanceComplexity ? 1 : 0);
  set("complexity", {
    status: cFilled === 0 ? "EMPTY" : cFilled === 4 ? "COMPLETE" : "STARTED",
    note: `${cFilled}/4 axes`,
  });

  // matrix — tâches avec verdict assigné (autre que default HUMAN)
  const verdictAssigned = snap.taskQualifications.filter(
    (t) => t.verdict && t.justification && t.justification.length > 0,
  ).length;
  set("matrix", {
    status:
      snap.taskQualifications.length === 0
        ? "EMPTY"
        : verdictAssigned < snap.taskQualifications.length
          ? "STARTED"
          : "COMPLETE",
    note: `${verdictAssigned}/${snap.taskQualifications.length} qualifiées`,
  });

  // intelligence needs
  set("intelligence", {
    status:
      snap.intelligenceNeeds.length === 0
        ? "EMPTY"
        : snap.intelligenceNeeds.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.intelligenceNeeds.length} besoin(s)`,
  });

  // treatments-map = vue agrégée (auto si taskQualifications & nodes existent)
  set("treatments-map", {
    status:
      snap.taskQualifications.length > 0 && snap.archNodes.length > 0
        ? "COMPLETE"
        : snap.taskQualifications.length > 0
          ? "STARTED"
          : "EMPTY",
  });

  // technologies
  set("technologies", {
    status:
      snap.technologies.length === 0
        ? "EMPTY"
        : snap.technologies.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.technologies.length} techno(s)`,
  });

  // target-architecture
  set("target-architecture", {
    status:
      snap.archNodes.length === 0
        ? "EMPTY"
        : snap.archNodes.length < 4
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.archNodes.length} noeud(s)`,
  });

  // human-validation
  set("human-validation", {
    status:
      snap.humanValidations.length === 0
        ? "EMPTY"
        : snap.humanValidations.length < 1
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.humanValidations.length} point(s)`,
  });

  // exceptions
  set("exceptions", {
    status:
      snap.exceptions.length === 0
        ? "EMPTY"
        : snap.exceptions.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.exceptions.length} exception(s)`,
  });

  // dependencies
  set("dependencies", {
    status:
      snap.dependencies.length === 0
        ? "EMPTY"
        : snap.dependencies.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.dependencies.length} dépendance(s)`,
  });

  // ai-risks — réutilise RiskAssessment de l'app existante
  const r = snap.riskAssessment;
  const riskScored =
    (r?.hallucinationRisk ? 1 : 0) +
    (r?.biasRisk ? 1 : 0) +
    (r?.classificationRisk ? 1 : 0) +
    (r?.autoDecisionRisk ? 1 : 0);
  set("ai-risks", {
    status: riskScored === 0 ? "EMPTY" : riskScored === 4 ? "COMPLETE" : "STARTED",
    note: `${riskScored}/4 axes IA`,
  });

  // recommendations
  set("recommendations", {
    status:
      snap.techRecommendations.length === 0
        ? "EMPTY"
        : snap.techRecommendations.length < 3
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.techRecommendations.length} reco(s)`,
  });

  // synthesis
  const s = snap.synthesis;
  const sFilled =
    (s?.recommendedProfile ? 1 : 0) +
    (s?.recommendedArchitecture ? 1 : 0) +
    (s?.finalRecommendation ? 1 : 0);
  set("synthesis", {
    status: sFilled === 0 ? "EMPTY" : sFilled < 3 ? "STARTED" : "COMPLETE",
  });

  // gate
  const g = snap.gate;
  set("gate", {
    status: g?.verdict === "READY" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY",
  });

  return out;
}

export function a2OverallProgress(snap: Atelier2Snapshot): number {
  const sections = allA2Sections();
  const prog = computeA2Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a2PhaseProgress(snap: Atelier2Snapshot, phaseId: Atelier2PhaseId): number {
  const phase = ATELIER2_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA2Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

// -------------------------------------------------------------
// Live signals — interprétation du raisonnement
// -------------------------------------------------------------
export type A2LiveSignal = {
  id: string;
  level: "INFO" | "WARNING" | "BLOCKER";
  title: string;
  detail?: string;
  sectionHint?: Atelier2SectionId;
};

export function detectA2Signals(snap: Atelier2Snapshot): A2LiveSignal[] {
  const signals: A2LiveSignal[] = [];
  const tasks = snap.taskQualifications;

  // 1. AI poussée partout : > 80% des tâches en AI / HYBRID sans justification
  if (tasks.length >= 3) {
    const aiCount = tasks.filter((t) => t.verdict === "AI" || t.verdict === "HYBRID").length;
    const aiRatio = aiCount / tasks.length;
    const unjustified = tasks.filter(
      (t) => (t.verdict === "AI" || t.verdict === "HYBRID") && !t.justification,
    ).length;
    if (aiRatio > 0.8 && unjustified > 0) {
      signals.push({
        id: "matrix.ai-everywhere",
        level: "WARNING",
        title: "IA poussée sur presque toutes les tâches",
        detail: `${aiCount}/${tasks.length} tâches qualifiées IA. Re-challenge : règles fixes + workflow stable → automatisation suffit.`,
        sectionHint: "matrix",
      });
    }

    // 2. Aucune validation humaine alors qu'on a des décisions IA
    const aiDecisions = tasks.filter(
      (t) => (t.verdict === "AI" || t.verdict === "HYBRID") && t.nature === "DECIDE",
    ).length;
    if (aiDecisions > 0 && snap.humanValidations.length === 0) {
      signals.push({
        id: "governance.no-human-on-ai-decisions",
        level: "BLOCKER",
        title: "Décisions IA sans validation humaine",
        detail: "Des décisions sont confiées à l'IA sans point de validation humaine. Cadre-les.",
        sectionHint: "human-validation",
      });
    }
  }

  // 3. Complexité gouvernance élevée sans points de validation
  if ((snap.complexity?.governanceComplexity ?? 0) >= 4 && snap.humanValidations.length === 0) {
    signals.push({
      id: "complexity.high-governance-no-validation",
      level: "WARNING",
      title: "Gouvernance complexe sans contrôle défini",
      detail: "La complexité gouvernance est élevée — il faut des points de validation humaine.",
      sectionHint: "human-validation",
    });
  }

  // 4. Tâches qualifiées mais aucune techno candidate
  if (tasks.length >= 3 && snap.technologies.length === 0) {
    signals.push({
      id: "tech.no-candidates",
      level: "INFO",
      title: "Tâches qualifiées sans techno candidate",
      detail: "Identifie les briques techno (OCR, ML, LLM, RAG, BPM…) qui supportent la matrice.",
      sectionHint: "technologies",
    });
  }

  // 5. Dépendances bloquantes non identifiées comme bloquantes
  const blocking = snap.dependencies.filter((d) => d.blocking).length;
  if (snap.dependencies.length >= 3 && blocking === 0) {
    signals.push({
      id: "deps.no-blocking",
      level: "INFO",
      title: "Aucune dépendance marquée bloquante",
      detail: "Vérifie si une dépendance SI/API conditionne le projet (à isoler vite).",
      sectionHint: "dependencies",
    });
  }

  // 6. Synthèse écrite sans matrice complète
  const synthDone = Boolean(snap.synthesis?.finalRecommendation?.trim());
  const matrixIncomplete = tasks.length === 0 || tasks.some((t) => !t.justification);
  if (synthDone && matrixIncomplete) {
    signals.push({
      id: "synth.before-matrix",
      level: "WARNING",
      title: "Synthèse rédigée avant la fin de la matrice",
      detail: "Au moins une tâche n'est pas justifiée — la synthèse risque d'être incohérente.",
      sectionHint: "matrix",
    });
  }

  // 7. Beaucoup d'exceptions → re-challenger la pertinence IA
  if (snap.exceptions.length >= 5) {
    const aiExceptions = snap.exceptions.filter((e) => e.handlingProposal === "AI").length;
    if (aiExceptions >= 3) {
      signals.push({
        id: "exceptions.ai-overload",
        level: "WARNING",
        title: "Beaucoup d'exceptions traitées par IA",
        detail: "Volumétrie élevée d'exceptions + IA = risque d'erreurs. Penser au design humain-first.",
        sectionHint: "exceptions",
      });
    }
  }

  return signals;
}

// -------------------------------------------------------------
// Gate atelier 3
// -------------------------------------------------------------
export type A2GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier2Snapshot["gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA2Gate(snap: Atelier2Snapshot): A2GateCriterion[] {
  const tasks = snap.taskQualifications;
  const tasksOk = tasks.length >= 3 && tasks.every((t) => t.justification && t.justification.length > 0);

  const intelOk = snap.intelligenceNeeds.length >= 3;

  const techOk = snap.technologies.length >= 2;

  const validationsOk = snap.humanValidations.length >= 1;

  const archOk = snap.archNodes.length >= 4;

  const synthOk = Boolean(snap.synthesis?.finalRecommendation?.trim());

  return [
    {
      id: "taskMatrixComplete",
      label: "Matrice tâches qualifiée (≥ 3 tâches justifiées)",
      met: tasksOk,
      why: !tasksOk
        ? tasks.length < 3
          ? `${tasks.length}/3 tâche(s).`
          : "Au moins une tâche n'est pas justifiée."
        : undefined,
    },
    {
      id: "intelligenceNeedsScored",
      label: "Besoins d'intelligence évalués (≥ 3)",
      met: intelOk,
      why: !intelOk ? `${snap.intelligenceNeeds.length}/3 besoin(s).` : undefined,
    },
    {
      id: "techCandidatesIdentified",
      label: "Technologies candidates retenues (≥ 2)",
      met: techOk,
      why: !techOk ? `${snap.technologies.length}/2 techno(s).` : undefined,
    },
    {
      id: "humanValidationsMapped",
      label: "Au moins un point de validation humaine défini",
      met: validationsOk,
      why: !validationsOk ? "Aucun point de validation humaine." : undefined,
    },
    {
      id: "targetArchSketched",
      label: "Architecture cible esquissée (≥ 4 noeuds)",
      met: archOk,
      why: !archOk ? `${snap.archNodes.length}/4 noeud(s).` : undefined,
    },
    {
      id: "synthesisWritten",
      label: "Synthèse finale rédigée",
      met: synthOk,
      why: !synthOk ? "Pas de recommandation finale rédigée." : undefined,
    },
  ];
}

export function isA2GateReady(snap: Atelier2Snapshot): boolean {
  return computeA2Gate(snap).every((c) => c.met);
}

// -------------------------------------------------------------
// Reasoner — recommande un profil basé sur la matrice + complexité
// -------------------------------------------------------------
export type ProfileRecommendation = {
  profile: Atelier2Profile;
  rationale: string;
  // counts pour debug / UI
  verdictCounts: Record<TaskVerdict, number>;
  techMixHint?: TechCode[];
};

export function recommendProfile(snap: Atelier2Snapshot): ProfileRecommendation {
  const tasks = snap.taskQualifications;
  if (tasks.length === 0) {
    return {
      profile: "NOT_QUALIFIED",
      rationale: "Aucune tâche qualifiée. Remplis la matrice IA vs automatisation pour obtenir une recommandation.",
      verdictCounts: { AUTOMATION: 0, AI: 0, HUMAN: 0, HYBRID: 0 },
    };
  }
  const verdictCounts: Record<TaskVerdict, number> = {
    AUTOMATION: 0,
    AI: 0,
    HUMAN: 0,
    HYBRID: 0,
  };
  for (const t of tasks) {
    const v = (t.verdict ?? "HUMAN") as TaskVerdict;
    verdictCounts[v] = (verdictCounts[v] ?? 0) + 1;
  }
  const total = tasks.length;
  const aiShare = (verdictCounts.AI + verdictCounts.HYBRID) / total;
  const autoShare = verdictCounts.AUTOMATION / total;
  const humanShare = verdictCounts.HUMAN / total;
  const govComplex = snap.complexity?.governanceComplexity ?? 0;

  if (aiShare === 0 && autoShare >= 0.6) {
    return {
      profile: "AUTOMATION_ONLY",
      rationale: `${verdictCounts.AUTOMATION}/${total} tâches sont automatisables sans IA. Privilégier BPM/RPA + APIs.`,
      verdictCounts,
      techMixHint: ["BPM", "RPA", "API", "RULE_ENGINE"],
    };
  }
  if (humanShare > 0.5) {
    return {
      profile: "HUMAN_FIRST",
      rationale: `${verdictCounts.HUMAN}/${total} tâches restent humaines (interprétation, validation). L'IA viendra en support, pas en remplacement.`,
      verdictCounts,
      techMixHint: ["LLM", "RAG"],
    };
  }
  if (aiShare >= 0.7 && govComplex <= 2) {
    return {
      profile: "AI_CENTRIC",
      rationale: `${(aiShare * 100).toFixed(0)}% des tâches relèvent de l'IA et la gouvernance est gérable — architecture IA-first envisageable.`,
      verdictCounts,
      techMixHint: ["LLM", "RAG", "ML", "AGENT"],
    };
  }
  if (aiShare >= 0.3) {
    return {
      profile: "AI_HYBRID",
      rationale: `${verdictCounts.AI + verdictCounts.HYBRID}/${total} tâches IA et ${verdictCounts.AUTOMATION}/${total} automatisables — architecture hybride.`,
      verdictCounts,
      techMixHint: ["BPM", "OCR", "ML", "LLM", "RAG"],
    };
  }
  return {
    profile: "NOT_QUALIFIED",
    rationale: "Pas assez de tâches IA pour justifier une architecture IA. Re-challenger avant POC.",
    verdictCounts,
  };
}
