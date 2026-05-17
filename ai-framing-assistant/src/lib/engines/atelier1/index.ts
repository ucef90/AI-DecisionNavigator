// Atelier 1 engine — orchestrates progress, live signals, synthesis,
// gate evaluation, and the final deliverable composition.
//
// This module is the single source of truth for "where the project is
// in atelier 1" — the layout reads it, every section page reads it,
// and the deliverable engine reads it.

import { prisma } from "@/lib/prisma";
import {
  ATELIER_PHASES,
  allSections,
  type AtelierSectionId,
  type AtelierPhaseId,
} from "@/types/atelier1";

export type AtelierSnapshot = {
  projectId: string;
  projectName: string;
  qualification: Awaited<ReturnType<typeof prisma.businessQualification.findUnique>>;
  businessNeed: Awaited<ReturnType<typeof prisma.businessNeed.findUnique>>;
  scope: Awaited<ReturnType<typeof prisma.projectScope.findUnique>>;
  actors: Awaited<ReturnType<typeof prisma.businessActor.findMany>>;
  verbatims: Awaited<ReturnType<typeof prisma.userVerbatim.findMany>>;
  processSteps: Awaited<ReturnType<typeof prisma.processStep.findMany>>;
  irritants: Awaited<ReturnType<typeof prisma.irritant.findMany>>;
  impacts: Awaited<ReturnType<typeof prisma.businessImpact.findMany>>;
  objectives: Awaited<ReturnType<typeof prisma.businessObjective.findMany>>;
  kpis: Awaited<ReturnType<typeof prisma.kpiBaseline.findMany>>;
  assumptions: Awaited<ReturnType<typeof prisma.projectAssumption.findMany>>;
  uncertainties: Awaited<ReturnType<typeof prisma.uncertainty.findMany>>;
  constraints: Awaited<ReturnType<typeof prisma.businessConstraint.findMany>>;
  opportunities: Awaited<ReturnType<typeof prisma.improvementOpportunity.findMany>>;
  workshopReport: Awaited<ReturnType<typeof prisma.workshopReport.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier1Gate.findUnique>>;
};

export async function loadAtelierSnapshot(projectId: string): Promise<AtelierSnapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  const [
    qualification,
    businessNeed,
    scope,
    actors,
    verbatims,
    processSteps,
    irritants,
    impacts,
    objectives,
    kpis,
    assumptions,
    uncertainties,
    constraints,
    opportunities,
    workshopReport,
    gate,
  ] = await Promise.all([
    prisma.businessQualification.findUnique({ where: { projectId } }),
    prisma.businessNeed.findUnique({ where: { projectId } }),
    prisma.projectScope.findUnique({ where: { projectId } }),
    prisma.businessActor.findMany({ where: { projectId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    prisma.userVerbatim.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } }),
    prisma.processStep.findMany({ where: { projectId }, orderBy: { order: "asc" } }),
    prisma.irritant.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.businessImpact.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.businessObjective.findMany({ where: { projectId }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }] }),
    prisma.kpiBaseline.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.projectAssumption.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.uncertainty.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.businessConstraint.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.improvementOpportunity.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.workshopReport.findUnique({ where: { projectId } }),
    prisma.atelier1Gate.findUnique({ where: { projectId } }),
  ]);

  return {
    projectId: project.id,
    projectName: project.name,
    qualification,
    businessNeed,
    scope,
    actors,
    verbatims,
    processSteps,
    irritants,
    impacts,
    objectives,
    kpis,
    assumptions,
    uncertainties,
    constraints,
    opportunities,
    workshopReport,
    gate,
  };
}

// -------------------------------------------------------------
// Progression : which sections are "done" (have meaningful content)
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";

export type SectionProgress = {
  id: AtelierSectionId;
  status: SectionStatus;
  note?: string; // optional context (e.g. count of items)
};

export function computeSectionProgress(snap: AtelierSnapshot): Record<AtelierSectionId, SectionProgress> {
  const out = {} as Record<AtelierSectionId, SectionProgress>;
  const set = (id: AtelierSectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };

  const q = snap.qualification;
  const qFilled =
    (q?.directionConcerned ? 1 : 0) +
    (q?.businessOwner ? 1 : 0) +
    (q?.triggerEvent ? 1 : 0) +
    (q?.priorityReason ? 1 : 0);
  set("qualification", {
    status: qFilled === 0 ? "EMPTY" : qFilled >= 3 ? "COMPLETE" : "STARTED",
    note: q?.directionConcerned ? `Direction : ${q.directionConcerned}` : undefined,
  });

  const bn = snap.businessNeed;
  const reformulated = (bn?.reformulatedNeed ?? "").trim();
  set("reformulation", {
    status: reformulated.length === 0 ? "EMPTY" : reformulated.length < 60 ? "STARTED" : "COMPLETE",
    note: reformulated ? `${reformulated.length} car.` : undefined,
  });

  set("actors", {
    status: snap.actors.length === 0 ? "EMPTY" : snap.actors.length < 3 ? "STARTED" : "COMPLETE",
    note: `${snap.actors.length} acteur(s)`,
  });

  set("verbatims", {
    status: snap.verbatims.length === 0 ? "EMPTY" : snap.verbatims.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.verbatims.length} verbatim(s)`,
  });

  set("process-as-is", {
    status:
      snap.processSteps.length === 0 ? "EMPTY" : snap.processSteps.length < 3 ? "STARTED" : "COMPLETE",
    note: `${snap.processSteps.length} étape(s)`,
  });

  // business-map = vue agrégée des autres sections, "complete" si on a
  // au moins 1 acteur, 1 étape et 1 irritant.
  const mapDone = snap.actors.length > 0 && snap.processSteps.length > 0 && snap.irritants.length > 0;
  set("business-map", {
    status: mapDone ? "COMPLETE" : snap.actors.length + snap.processSteps.length > 0 ? "STARTED" : "EMPTY",
  });

  set("irritants", {
    status:
      snap.irritants.length === 0 ? "EMPTY" : snap.irritants.length < 3 ? "STARTED" : "COMPLETE",
    note: `${snap.irritants.length} irritant(s)`,
  });

  set("impacts", {
    status: snap.impacts.length === 0 ? "EMPTY" : snap.impacts.length < 3 ? "STARTED" : "COMPLETE",
    note: `${snap.impacts.length} impact(s)`,
  });

  set("opportunities", {
    status:
      snap.opportunities.length === 0 ? "EMPTY" : snap.opportunities.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.opportunities.length} opportunité(s)`,
  });

  set("objectives", {
    status:
      snap.objectives.length === 0 ? "EMPTY" : snap.objectives.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.objectives.length} objectif(s)`,
  });

  const measuredKpis = snap.kpis.filter((k) => k.measureStatus === "MEASURED").length;
  set("kpis", {
    status: snap.kpis.length === 0 ? "EMPTY" : measuredKpis === 0 ? "STARTED" : "COMPLETE",
    note: `${snap.kpis.length} KPI / ${measuredKpis} mesuré(s)`,
  });

  const valueFilled = (bn?.expectedValue ?? "").trim().length > 60;
  set("value", { status: valueFilled ? "COMPLETE" : (bn?.expectedValue ? "STARTED" : "EMPTY") });

  const scope = snap.scope;
  const hasInOut = Boolean(scope?.inScope?.trim()) && Boolean(scope?.outOfScope?.trim());
  set("scope", {
    status: hasInOut ? (scope?.scopeValidatedBy ? "COMPLETE" : "STARTED") : (scope ? "STARTED" : "EMPTY"),
  });

  set("assumptions", {
    status:
      snap.assumptions.length === 0 ? "EMPTY" : snap.assumptions.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.assumptions.length} hypothèse(s)`,
  });

  set("uncertainties", {
    status:
      snap.uncertainties.length === 0 ? "EMPTY" : snap.uncertainties.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.uncertainties.length} incertitude(s)`,
  });

  set("constraints", {
    status:
      snap.constraints.length === 0 ? "EMPTY" : snap.constraints.length < 2 ? "STARTED" : "COMPLETE",
    note: `${snap.constraints.length} contrainte(s)`,
  });

  const synthFilled = (bn?.problemStatement ?? "").trim().length > 40;
  set("synthesis", { status: synthFilled ? "COMPLETE" : "EMPTY" });

  const wr = snap.workshopReport;
  const wrFilled = Boolean(wr?.keyFindings?.trim()) || Boolean(wr?.decisionsMade?.trim());
  set("workshop-report", { status: wrFilled ? "COMPLETE" : (wr ? "STARTED" : "EMPTY") });

  const g = snap.gate;
  set("gate", {
    status:
      g?.verdict === "READY" || g?.verdict === "OVERRIDE"
        ? "COMPLETE"
        : g
          ? "STARTED"
          : "EMPTY",
  });

  return out;
}

export function overallProgress(snap: AtelierSnapshot): number {
  const sections = allSections();
  const prog = computeSectionProgress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

// -------------------------------------------------------------
// Live signals — surfaced in the right rail of the layout
// -------------------------------------------------------------
export type LiveSignal = {
  id: string;
  level: "INFO" | "WARNING" | "BLOCKER";
  title: string;
  detail?: string;
  sectionHint?: AtelierSectionId;
};

export function detectLiveSignals(snap: AtelierSnapshot): LiveSignal[] {
  const signals: LiveSignal[] = [];
  const bn = snap.businessNeed;

  // 1. Formulation orientée solution (texte initial OU reformulation)
  const SOLUTION_PATTERNS = [
    /\bnous voulons (de l'?ia|un chatbot|un agent ia|un llm|un rag)\b/i,
    /\bautomatiser (avec|via) (l'?ia|une ia)\b/i,
    /\bmettre en place (un|une) (chatbot|llm|rag|agent)\b/i,
    /\b(genai|gpt-?\d|copilot)\b/i,
  ];
  const checkText = `${bn?.initialRequest ?? ""}\n${bn?.reformulatedNeed ?? ""}`;
  const matched = SOLUTION_PATTERNS.filter((re) => re.test(checkText));
  if (matched.length > 0) {
    signals.push({
      id: "bias.solution-oriented",
      level: "WARNING",
      title: "Formulation orientée solution",
      detail: "Le besoin parle techno avant de décrire le problème métier. Reformule sans nommer d'outil.",
      sectionHint: "reformulation",
    });
  }

  // 2. Workflow vide alors qu'on a déjà des irritants
  if (snap.irritants.length >= 2 && snap.processSteps.length === 0) {
    signals.push({
      id: "method.irritants-before-workflow",
      level: "WARNING",
      title: "Irritants listés sans workflow",
      detail: "Cartographie d'abord le processus actuel — les irritants prennent sens dans leur contexte.",
      sectionHint: "process-as-is",
    });
  }

  // 3. KPI cibles sans baseline mesurée
  const hasObjective = snap.objectives.length > 0;
  const noBaseline = snap.kpis.length === 0 || snap.kpis.every((k) => k.measureStatus === "NOT_MEASURED");
  if (hasObjective && noBaseline) {
    signals.push({
      id: "measure.no-baseline",
      level: "WARNING",
      title: "Objectifs sans KPI mesuré",
      detail: "Sans valeur actuelle, impossible de mesurer le gain. Au moins un KPI doit être renseigné.",
      sectionHint: "kpis",
    });
  }

  // 4. Périmètre absent alors que diagnostic avancé
  const diagAdvanced = snap.irritants.length >= 3 || snap.impacts.length >= 2;
  if (diagAdvanced && !snap.scope?.inScope?.trim()) {
    signals.push({
      id: "scope.missing",
      level: "WARNING",
      title: "Périmètre non défini",
      detail: "Le diagnostic avance — définis ce qui est dans le scope et ce qui ne l'est pas, sinon scope creep garanti.",
      sectionHint: "scope",
    });
  }

  // 5. Confusion irritants vs impacts (irritant = cause / impact = conséquence)
  if (snap.irritants.length > 0 && snap.impacts.length === 0) {
    signals.push({
      id: "diag.no-impacts",
      level: "INFO",
      title: "Irritants sans impacts mesurés",
      detail: "Pour chaque irritant, quel est l'impact (délai, qualité, coût) ? Renseigne au moins 2 impacts.",
      sectionHint: "impacts",
    });
  }

  // 6. Aucune voix utilisateur — la crédibilité COPIL en pâtit
  if (snap.actors.length >= 2 && snap.verbatims.length === 0) {
    signals.push({
      id: "evidence.no-verbatim",
      level: "INFO",
      title: "Aucune voix utilisateur",
      detail: "Ajoute 1-2 verbatims (interview, observation terrain) pour ancrer l'analyse.",
      sectionHint: "verbatims",
    });
  }

  // 7. Hypothèse critique non vérifiée
  const criticalUnverified = snap.assumptions.find(
    (a) => (a.riskIfWrong === "HIGH" || a.riskIfWrong === "CRITICAL") && a.status === "UNVERIFIED",
  );
  if (criticalUnverified) {
    signals.push({
      id: "assumption.critical-unverified",
      level: "BLOCKER",
      title: "Hypothèse critique non vérifiée",
      detail: `« ${criticalUnverified.statement.slice(0, 80)}… » a un risque élevé si fausse.`,
      sectionHint: "assumptions",
    });
  }

  return signals;
}

// -------------------------------------------------------------
// Gate de sortie atelier 2 — critères calculés automatiquement
// -------------------------------------------------------------
export type GateCriterion = {
  id: keyof Omit<NonNullable<AtelierSnapshot["gate"]>, "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt">;
  label: string;
  met: boolean;
  why?: string;
};

export function computeGateCriteria(snap: AtelierSnapshot): GateCriterion[] {
  const bn = snap.businessNeed;
  const reformulated = (bn?.reformulatedNeed ?? "").trim();
  const techMentions = /\b(IA|LLM|RAG|chatbot|agent IA|automatisation|GPT|copilot)\b/i.test(
    reformulated,
  );
  const reformulatedWithoutTech = reformulated.length >= 60 && !techMentions;

  const atLeastThreeIrritants = snap.irritants.length >= 3;

  const workflowAsIsMapped = snap.processSteps.length >= 3;

  const baselineKpiMeasured = snap.kpis.some((k) => k.measureStatus === "MEASURED");

  const scopeValidatedBySponsor = Boolean(
    snap.scope?.inScope?.trim() &&
      snap.scope?.outOfScope?.trim() &&
      snap.scope?.scopeValidatedBy?.trim(),
  );

  return [
    {
      id: "reformulatedWithoutTech",
      label: "Besoin reformulé sans techno (≥ 60 car., aucune mention d'IA)",
      met: reformulatedWithoutTech,
      why: !reformulated
        ? "Aucune reformulation saisie."
        : techMentions
          ? "La reformulation mentionne une techno."
          : reformulated.length < 60
            ? "Reformulation trop courte (< 60 car.)."
            : undefined,
    },
    {
      id: "atLeastThreeIrritants",
      label: "≥ 3 irritants identifiés",
      met: atLeastThreeIrritants,
      why: !atLeastThreeIrritants ? `${snap.irritants.length}/3 irritant(s).` : undefined,
    },
    {
      id: "workflowAsIsMapped",
      label: "Workflow AS-IS cartographié (≥ 3 étapes)",
      met: workflowAsIsMapped,
      why: !workflowAsIsMapped ? `${snap.processSteps.length}/3 étape(s).` : undefined,
    },
    {
      id: "baselineKpiMeasured",
      label: "≥ 1 KPI baseline mesuré",
      met: baselineKpiMeasured,
      why: !baselineKpiMeasured ? "Aucun KPI marqué MEASURED." : undefined,
    },
    {
      id: "scopeValidatedBySponsor",
      label: "Périmètre validé par le sponsor",
      met: scopeValidatedBySponsor,
      why: !scopeValidatedBySponsor
        ? "Renseigne scope IN/OUT et nomme la personne qui a validé."
        : undefined,
    },
  ];
}

export function isGateReady(snap: AtelierSnapshot): boolean {
  return computeGateCriteria(snap).every((c) => c.met);
}

// -------------------------------------------------------------
// Phase helpers (for the layout)
// -------------------------------------------------------------
export function phaseProgress(snap: AtelierSnapshot, phaseId: AtelierPhaseId): number {
  const phase = ATELIER_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeSectionProgress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}
