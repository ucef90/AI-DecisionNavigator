// Atelier 3 — engine.
//
// Bien différent des engines atelier 1 / 2 : ici, on CONSOLIDE.
// L'engine lit massivement les données collectées dans les
// ateliers précédents (BusinessNeed, BusinessActor, ProcessStep,
// Irritant, Impact, TaskQualification, Complexity, etc.) et :
//   1. Calcule la COUVERTURE de chaque section livrable atelier 3
//   2. DÉRIVE une maturité par axe (vs la maturité auto-déclarée)
//   3. DÉTECTE les points critiques cross-source
//   4. PRÉPARE les inputs scoring (atelier 4) + cartographie (atelier 5)

import { prisma } from "@/lib/prisma";
import {
  ATELIER3_PHASES,
  allA3Sections,
  type Atelier3PhaseId,
  type Atelier3SectionId,
} from "@/types/atelier3";

export type Atelier3Snapshot = {
  projectId: string;
  projectName: string;
  // --- Données consolidées atelier 1 ---
  qualification: Awaited<ReturnType<typeof prisma.businessQualification.findUnique>>;
  businessNeed: Awaited<ReturnType<typeof prisma.businessNeed.findUnique>>;
  scope: Awaited<ReturnType<typeof prisma.projectScope.findUnique>>;
  actors: Awaited<ReturnType<typeof prisma.businessActor.findMany>>;
  processSteps: Awaited<ReturnType<typeof prisma.processStep.findMany>>;
  irritants: Awaited<ReturnType<typeof prisma.irritant.findMany>>;
  impacts: Awaited<ReturnType<typeof prisma.businessImpact.findMany>>;
  objectives: Awaited<ReturnType<typeof prisma.businessObjective.findMany>>;
  kpis: Awaited<ReturnType<typeof prisma.kpiBaseline.findMany>>;
  assumptions: Awaited<ReturnType<typeof prisma.projectAssumption.findMany>>;
  uncertainties: Awaited<ReturnType<typeof prisma.uncertainty.findMany>>;
  constraints: Awaited<ReturnType<typeof prisma.businessConstraint.findMany>>;
  opportunities: Awaited<ReturnType<typeof prisma.improvementOpportunity.findMany>>;
  atelier1Gate: Awaited<ReturnType<typeof prisma.atelier1Gate.findUnique>>;
  // --- Données consolidées atelier 2 ---
  taskQualifications: Awaited<ReturnType<typeof prisma.taskQualification.findMany>>;
  complexity: Awaited<ReturnType<typeof prisma.complexityAssessment.findUnique>>;
  intelligenceNeeds: Awaited<ReturnType<typeof prisma.intelligenceNeed.findMany>>;
  technologies: Awaited<ReturnType<typeof prisma.technologyCandidate.findMany>>;
  humanValidations: Awaited<ReturnType<typeof prisma.humanValidationPoint.findMany>>;
  exceptions: Awaited<ReturnType<typeof prisma.processException.findMany>>;
  dependencies: Awaited<ReturnType<typeof prisma.technicalDependency.findMany>>;
  atelier2Synthesis: Awaited<ReturnType<typeof prisma.atelier2Synthesis.findUnique>>;
  atelier2Gate: Awaited<ReturnType<typeof prisma.atelier2Gate.findUnique>>;
  // --- Données existantes (avant ateliers) ---
  dataAssessment: Awaited<ReturnType<typeof prisma.dataAssessment.findUnique>>;
  riskAssessment: Awaited<ReturnType<typeof prisma.riskAssessment.findUnique>>;
  // --- Données spécifiques atelier 3 ---
  documentAnalysis: Awaited<ReturnType<typeof prisma.documentAnalysis.findUnique>>;
  regulatoryAnalysis: Awaited<ReturnType<typeof prisma.regulatoryAnalysis.findUnique>>;
  maturity: Awaited<ReturnType<typeof prisma.maturityAssessment.findUnique>>;
  feasibility: Awaited<ReturnType<typeof prisma.feasibilityAssessment.findUnique>>;
  synthesis: Awaited<ReturnType<typeof prisma.atelier3Synthesis.findUnique>>;
  gate: Awaited<ReturnType<typeof prisma.atelier3Gate.findUnique>>;
};

export async function loadAtelier3Snapshot(projectId: string): Promise<Atelier3Snapshot | null> {
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
    processSteps,
    irritants,
    impacts,
    objectives,
    kpis,
    assumptions,
    uncertainties,
    constraints,
    opportunities,
    atelier1Gate,
    taskQualifications,
    complexity,
    intelligenceNeeds,
    technologies,
    humanValidations,
    exceptions,
    dependencies,
    atelier2Synthesis,
    atelier2Gate,
    dataAssessment,
    riskAssessment,
    documentAnalysis,
    regulatoryAnalysis,
    maturity,
    feasibility,
    synthesis,
    gate,
  ] = await Promise.all([
    prisma.businessQualification.findUnique({ where: { projectId } }),
    prisma.businessNeed.findUnique({ where: { projectId } }),
    prisma.projectScope.findUnique({ where: { projectId } }),
    prisma.businessActor.findMany({ where: { projectId } }),
    prisma.processStep.findMany({ where: { projectId }, orderBy: { order: "asc" } }),
    prisma.irritant.findMany({ where: { projectId } }),
    prisma.businessImpact.findMany({ where: { projectId } }),
    prisma.businessObjective.findMany({ where: { projectId } }),
    prisma.kpiBaseline.findMany({ where: { projectId } }),
    prisma.projectAssumption.findMany({ where: { projectId } }),
    prisma.uncertainty.findMany({ where: { projectId } }),
    prisma.businessConstraint.findMany({ where: { projectId } }),
    prisma.improvementOpportunity.findMany({ where: { projectId } }),
    prisma.atelier1Gate.findUnique({ where: { projectId } }),
    prisma.taskQualification.findMany({ where: { projectId } }),
    prisma.complexityAssessment.findUnique({ where: { projectId } }),
    prisma.intelligenceNeed.findMany({ where: { projectId } }),
    prisma.technologyCandidate.findMany({ where: { projectId } }),
    prisma.humanValidationPoint.findMany({ where: { projectId } }),
    prisma.processException.findMany({ where: { projectId } }),
    prisma.technicalDependency.findMany({ where: { projectId } }),
    prisma.atelier2Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier2Gate.findUnique({ where: { projectId } }),
    prisma.dataAssessment.findUnique({ where: { projectId } }),
    prisma.riskAssessment.findUnique({ where: { projectId } }),
    prisma.documentAnalysis.findUnique({ where: { projectId } }),
    prisma.regulatoryAnalysis.findUnique({ where: { projectId } }),
    prisma.maturityAssessment.findUnique({ where: { projectId } }),
    prisma.feasibilityAssessment.findUnique({ where: { projectId } }),
    prisma.atelier3Synthesis.findUnique({ where: { projectId } }),
    prisma.atelier3Gate.findUnique({ where: { projectId } }),
  ]);

  return {
    projectId: project.id,
    projectName: project.name,
    qualification,
    businessNeed,
    scope,
    actors,
    processSteps,
    irritants,
    impacts,
    objectives,
    kpis,
    assumptions,
    uncertainties,
    constraints,
    opportunities,
    atelier1Gate,
    taskQualifications,
    complexity,
    intelligenceNeeds,
    technologies,
    humanValidations,
    exceptions,
    dependencies,
    atelier2Synthesis,
    atelier2Gate,
    dataAssessment,
    riskAssessment,
    documentAnalysis,
    regulatoryAnalysis,
    maturity,
    feasibility,
    synthesis,
    gate,
  };
}

// -------------------------------------------------------------
// Section progress
// -------------------------------------------------------------
export type SectionStatus = "EMPTY" | "STARTED" | "COMPLETE";
export type SectionProgress = { id: Atelier3SectionId; status: SectionStatus; note?: string };

export function computeA3Progress(snap: Atelier3Snapshot): Record<Atelier3SectionId, SectionProgress> {
  const out = {} as Record<Atelier3SectionId, SectionProgress>;
  const set = (id: Atelier3SectionId, p: Omit<SectionProgress, "id">) => {
    out[id] = { id, ...p };
  };

  // qualification (réutilisée atelier 1)
  const q = snap.qualification;
  const qFilled = (q?.directionConcerned ? 1 : 0) + (q?.businessOwner ? 1 : 0) + (q?.triggerEvent ? 1 : 0);
  set("qualification", { status: qFilled === 0 ? "EMPTY" : qFilled >= 2 ? "COMPLETE" : "STARTED" });

  // coverage : auto-derived — toujours "STARTED" si au moins atelier 1 a démarré
  const hasA1 = Boolean(snap.businessNeed?.reformulatedNeed || snap.processSteps.length > 0);
  const hasA2 = snap.taskQualifications.length > 0;
  set("coverage", { status: !hasA1 && !hasA2 ? "EMPTY" : hasA1 && hasA2 ? "COMPLETE" : "STARTED" });

  // document-analysis
  const da = snap.documentAnalysis;
  const daFilled = da
    ? (da.complexityLevel ? 1 : 0) + (da.exploitability ? 1 : 0) + (da.structureLevel ? 1 : 0)
    : 0;
  set("document-analysis", {
    status: !da ? "EMPTY" : daFilled === 0 ? "STARTED" : daFilled >= 2 ? "COMPLETE" : "STARTED",
  });

  // regulatory
  const reg = snap.regulatoryAnalysis;
  const regFilled = reg ? (reg.euAiActTier ? 1 : 0) + (reg.dpoConsulted ? 1 : 0) : 0;
  set("regulatory", {
    status: !reg ? "EMPTY" : regFilled === 0 ? "STARTED" : regFilled >= 1 ? "COMPLETE" : "STARTED",
  });

  // si-dependencies (atelier 2)
  set("si-dependencies", {
    status:
      snap.dependencies.length === 0
        ? "EMPTY"
        : snap.dependencies.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.dependencies.length} dépendance(s)`,
  });

  // complexity (atelier 2)
  const c = snap.complexity;
  const cFilled =
    (c?.workflowComplexity ? 1 : 0) +
    (c?.documentComplexity ? 1 : 0) +
    (c?.decisionComplexity ? 1 : 0) +
    (c?.governanceComplexity ? 1 : 0);
  set("complexity", { status: cFilled === 0 ? "EMPTY" : cFilled === 4 ? "COMPLETE" : "STARTED" });

  // maturity (atelier 3 spécifique)
  const m = snap.maturity;
  const mFilled =
    (m?.needClarity ? 1 : 0) +
    (m?.workflowKnowledge ? 1 : 0) +
    (m?.dataMaturity ? 1 : 0) +
    (m?.governanceMaturity ? 1 : 0) +
    (m?.stakeholderAlignment ? 1 : 0) +
    (m?.realismLevel ? 1 : 0);
  set("maturity", { status: mFilled === 0 ? "EMPTY" : mFilled >= 4 ? "COMPLETE" : "STARTED", note: `${mFilled}/6 axes` });

  // feasibility
  const f = snap.feasibility;
  const fFilled =
    (f?.technicallyFeasible ? 1 : 0) +
    (f?.organizationallyFeasible ? 1 : 0) +
    (f?.regulatorilyFeasible ? 1 : 0) +
    (f?.resourcesAvailable ? 1 : 0) +
    (f?.dataAvailable ? 1 : 0);
  set("feasibility", {
    status: fFilled === 0 ? "EMPTY" : fFilled >= 3 ? "COMPLETE" : "STARTED",
    note: `${fFilled}/5 axes`,
  });

  // critical-points : auto-derived
  set("critical-points", { status: detectCriticalPoints(snap).length > 0 ? "COMPLETE" : "EMPTY" });

  // opportunities (atelier 1)
  set("opportunities", {
    status:
      snap.opportunities.length === 0
        ? "EMPTY"
        : snap.opportunities.length < 2
          ? "STARTED"
          : "COMPLETE",
    note: `${snap.opportunities.length} opportunité(s)`,
  });

  // recommendations : auto-derived
  set("recommendations", { status: deriveRecommendations(snap).length > 0 ? "COMPLETE" : "EMPTY" });

  // scoring-preparation
  const s = snap.synthesis;
  set("scoring-preparation", { status: s?.scoringPreparationNotes ? "COMPLETE" : "EMPTY" });
  set("cartography-preparation", { status: s?.cartographyPreparationNotes ? "COMPLETE" : "EMPTY" });

  // synthesis
  const synthFilled =
    (s?.realNeed ? 1 : 0) +
    (s?.maturityLevel ? 1 : 0) +
    (s?.feasibilityGlobal ? 1 : 0) +
    (s?.finalRecommendation ? 1 : 0);
  set("synthesis", {
    status: synthFilled === 0 ? "EMPTY" : synthFilled >= 3 ? "COMPLETE" : "STARTED",
  });

  // gate
  const g = snap.gate;
  set("gate", {
    status: g?.verdict === "READY" || g?.verdict === "OVERRIDE" ? "COMPLETE" : g ? "STARTED" : "EMPTY",
  });

  return out;
}

export function a3OverallProgress(snap: Atelier3Snapshot): number {
  const sections = allA3Sections();
  const prog = computeA3Progress(snap);
  let score = 0;
  for (const s of sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / sections.length) * 100);
}

export function a3PhaseProgress(snap: Atelier3Snapshot, phaseId: Atelier3PhaseId): number {
  const phase = ATELIER3_PHASES.find((p) => p.id === phaseId);
  if (!phase) return 0;
  const prog = computeA3Progress(snap);
  let score = 0;
  for (const s of phase.sections) {
    const p = prog[s.id];
    if (p.status === "COMPLETE") score += 1;
    else if (p.status === "STARTED") score += 0.4;
  }
  return Math.round((score / phase.sections.length) * 100);
}

// -------------------------------------------------------------
// COVERAGE MAP — pour chaque section du livrable atelier 3,
// indiquer ce qui est déjà couvert par atelier 1/2 et ce qui
// reste à faire. C'est la vue PIVOT de l'atelier 3.
// -------------------------------------------------------------
export type CoverageItem = {
  livrableSection: number;
  title: string;
  coverage: number; // 0..100
  origin: "ATELIER_1" | "ATELIER_2" | "OWN" | "MIXED" | "DERIVED";
  // Brefs faits piochés dans la donnée
  highlights: string[];
  // Si quelque chose manque pour la section
  gaps: string[];
  // Deep-link vers la section atelier source pour combler
  deepLinkUrl?: string;
};

export function buildCoverageMap(snap: Atelier3Snapshot): CoverageItem[] {
  const a1Base = `/projects/${snap.projectId}/atelier/1`;
  const a2Base = `/projects/${snap.projectId}/atelier/2`;
  const items: CoverageItem[] = [];

  // §1 Qualification
  {
    const q = snap.qualification;
    const has = q && (q.directionConcerned || q.businessOwner);
    const highlights = [
      q?.directionConcerned ? `Direction : ${q.directionConcerned}` : null,
      q?.businessOwner ? `Responsable : ${q.businessOwner}` : null,
      q?.triggerEvent ? `Déclencheur : ${q.triggerEvent}` : null,
    ].filter(Boolean) as string[];
    items.push({
      livrableSection: 1,
      title: "Qualification du projet",
      coverage: has ? (highlights.length >= 2 ? 100 : 50) : 0,
      origin: "ATELIER_1",
      highlights,
      gaps: has ? [] : ["Fiche de qualification non saisie."],
      deepLinkUrl: `${a1Base}/qualification`,
    });
  }

  // §2 Analyse métier
  {
    const reformulated = (snap.businessNeed?.reformulatedNeed ?? "").trim();
    const highlights = [
      reformulated ? `Reformulation : ${truncate(reformulated, 100)}` : null,
      snap.irritants.length > 0 ? `${snap.irritants.length} irritant(s) identifié(s)` : null,
    ].filter(Boolean) as string[];
    items.push({
      livrableSection: 2,
      title: "Analyse métier",
      coverage: reformulated.length >= 60 ? 100 : reformulated ? 40 : 0,
      origin: "ATELIER_1",
      highlights,
      gaps: reformulated ? [] : ["Aucune reformulation métier."],
      deepLinkUrl: `${a1Base}/reformulation`,
    });
  }

  // §3 Utilisateurs
  {
    const n = snap.actors.length;
    items.push({
      livrableSection: 3,
      title: "Utilisateurs & acteurs",
      coverage: n >= 3 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_1",
      highlights: n > 0 ? [`${n} acteur(s) cartographié(s)`] : [],
      gaps: n === 0 ? ["Acteurs non cartographiés."] : n < 3 ? ["Moins de 3 acteurs identifiés."] : [],
      deepLinkUrl: `${a1Base}/actors`,
    });
  }

  // §4 Workflows
  {
    const n = snap.processSteps.length;
    const manual = snap.processSteps.filter((s) => s.mode === "MANUAL").length;
    items.push({
      livrableSection: 4,
      title: "Workflows",
      coverage: n >= 3 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_1",
      highlights: n > 0 ? [`${n} étape(s) (${manual} manuelle(s))`] : [],
      gaps: n === 0 ? ["Workflow AS-IS non cartographié."] : n < 3 ? ["Moins de 3 étapes."] : [],
      deepLinkUrl: `${a1Base}/process-as-is`,
    });
  }

  // §5 Données
  {
    const da = snap.dataAssessment;
    items.push({
      livrableSection: 5,
      title: "Données",
      coverage: da ? (da.quality && da.availability ? 100 : 50) : 0,
      origin: "ATELIER_1",
      highlights: da
        ? [
            da.quality ? `Qualité : ${da.quality}` : null,
            da.sensitivity ? `Sensibilité : ${da.sensitivity}` : null,
          ].filter(Boolean) as string[]
        : [],
      gaps: !da ? ["Analyse data non démarrée."] : !da.quality ? ["Qualité non renseignée."] : [],
      deepLinkUrl: `/projects/${snap.projectId}/wizard/data`,
    });
  }

  // §6 Documentaire (atelier 3 OWN)
  {
    const d = snap.documentAnalysis;
    const has = d && (d.complexityLevel || d.exploitability);
    items.push({
      livrableSection: 6,
      title: "Documentaire",
      coverage: has ? 100 : 0,
      origin: "OWN",
      highlights: has
        ? [
            d?.ocrNeeded ? "OCR nécessaire" : null,
            d?.ragNeeded ? "RAG nécessaire" : null,
            d?.complexityLevel ? `Complexité : ${d.complexityLevel}` : null,
          ].filter(Boolean) as string[]
        : [],
      gaps: !has ? ["Analyse documentaire à faire (§6 atelier 3)."] : [],
      deepLinkUrl: `/projects/${snap.projectId}/atelier/3/document-analysis`,
    });
  }

  // §7 Traitements (atelier 2 matrice)
  {
    const n = snap.taskQualifications.length;
    items.push({
      livrableSection: 7,
      title: "Traitements (matrice IA vs auto)",
      coverage: n >= 3 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_2",
      highlights: n > 0 ? [`${n} tâche(s) qualifiée(s)`] : [],
      gaps: n === 0 ? ["Matrice IA vs auto non remplie."] : [],
      deepLinkUrl: `${a2Base}/matrix`,
    });
  }

  // §8 Besoins IA (atelier 2)
  {
    const n = snap.intelligenceNeeds.length;
    items.push({
      livrableSection: 8,
      title: "Besoins d'intelligence",
      coverage: n >= 3 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_2",
      highlights: n > 0 ? [`${n} besoin(s) identifié(s)`] : [],
      gaps: n === 0 ? ["Besoins IA non listés."] : [],
      deepLinkUrl: `${a2Base}/intelligence`,
    });
  }

  // §9 Validations humaines (atelier 2)
  {
    const n = snap.humanValidations.length;
    items.push({
      livrableSection: 9,
      title: "Validations humaines",
      coverage: n >= 1 ? 100 : 0,
      origin: "ATELIER_2",
      highlights: n > 0 ? [`${n} point(s) de validation`] : [],
      gaps: n === 0 ? ["Aucun point de validation humaine."] : [],
      deepLinkUrl: `${a2Base}/human-validation`,
    });
  }

  // §10 Dépendances SI (atelier 2)
  {
    const n = snap.dependencies.length;
    items.push({
      livrableSection: 10,
      title: "Dépendances SI",
      coverage: n >= 2 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_2",
      highlights: n > 0 ? [`${n} dépendance(s)`] : [],
      gaps: n === 0 ? ["Aucune dépendance SI listée."] : [],
      deepLinkUrl: `${a2Base}/dependencies`,
    });
  }

  // §11 Réglementaire (atelier 3 OWN)
  {
    const r = snap.regulatoryAnalysis;
    items.push({
      livrableSection: 11,
      title: "Réglementaire",
      coverage: r ? (r.dpoConsulted || r.euAiActTier !== "NONE" ? 100 : 50) : 0,
      origin: "OWN",
      highlights: r
        ? [
            r.euAiActTier && r.euAiActTier !== "NONE" ? `EU AI Act : ${r.euAiActTier}` : null,
            r.dpoConsulted ? "DPO consulté" : null,
          ].filter(Boolean) as string[]
        : [],
      gaps: !r ? ["Analyse réglementaire à faire."] : !r.dpoConsulted ? ["DPO non consulté."] : [],
      deepLinkUrl: `/projects/${snap.projectId}/atelier/3/regulatory`,
    });
  }

  // §12 Risques (RiskAssessment existant)
  {
    const r = snap.riskAssessment;
    const scored =
      (r?.rgpdRisk ? 1 : 0) +
      (r?.hallucinationRisk ? 1 : 0) +
      (r?.biasRisk ? 1 : 0) +
      (r?.securityRisk ? 1 : 0);
    items.push({
      livrableSection: 12,
      title: "Risques",
      coverage: r ? (scored >= 3 ? 100 : 50) : 0,
      origin: "MIXED",
      highlights: r?.overallRisk ? [`Risque global : ${r.overallRisk}`] : [],
      gaps: !r ? ["RiskAssessment vide."] : scored < 3 ? ["Moins de 3 axes risques scorés."] : [],
      deepLinkUrl: `/projects/${snap.projectId}/wizard/risks`,
    });
  }

  // §13 Complexité (atelier 2)
  {
    const c = snap.complexity;
    const filled =
      (c?.workflowComplexity ? 1 : 0) +
      (c?.documentComplexity ? 1 : 0) +
      (c?.decisionComplexity ? 1 : 0) +
      (c?.governanceComplexity ? 1 : 0);
    items.push({
      livrableSection: 13,
      title: "Niveaux de complexité",
      coverage: c ? (filled === 4 ? 100 : 60) : 0,
      origin: "ATELIER_2",
      highlights: c ? [`${filled}/4 axes scorés`] : [],
      gaps: !c ? ["Aucune évaluation de complexité."] : filled < 4 ? [`${4 - filled} axe(s) à scorer.`] : [],
      deepLinkUrl: `${a2Base}/complexity`,
    });
  }

  // §14 Maturité projet (mixed)
  {
    const m = snap.maturity;
    const filled =
      (m?.needClarity ? 1 : 0) +
      (m?.workflowKnowledge ? 1 : 0) +
      (m?.dataMaturity ? 1 : 0) +
      (m?.governanceMaturity ? 1 : 0) +
      (m?.stakeholderAlignment ? 1 : 0) +
      (m?.realismLevel ? 1 : 0);
    items.push({
      livrableSection: 14,
      title: "Maturité projet",
      coverage: m ? (filled >= 4 ? 100 : 50) : 0,
      origin: "MIXED",
      highlights: m ? [`${filled}/6 axes auto-évalués`] : [],
      gaps: !m ? ["Auto-évaluation maturité à faire."] : filled < 4 ? [`${6 - filled} axe(s) restant(s).`] : [],
      deepLinkUrl: `/projects/${snap.projectId}/atelier/3/maturity`,
    });
  }

  // §15 Faisabilité
  {
    const f = snap.feasibility;
    const filled =
      (f?.technicallyFeasible ? 1 : 0) +
      (f?.organizationallyFeasible ? 1 : 0) +
      (f?.regulatorilyFeasible ? 1 : 0) +
      (f?.resourcesAvailable ? 1 : 0) +
      (f?.dataAvailable ? 1 : 0);
    items.push({
      livrableSection: 15,
      title: "Faisabilité",
      coverage: f ? (filled >= 3 ? 100 : 40) : 0,
      origin: "OWN",
      highlights: f?.overallFeasibility ? [`Faisabilité : ${f.overallFeasibility}`] : [],
      gaps: !f ? ["Évaluation faisabilité à faire."] : filled < 3 ? [`${5 - filled} axe(s) restant(s).`] : [],
      deepLinkUrl: `/projects/${snap.projectId}/atelier/3/feasibility`,
    });
  }

  // §17 Opportunités (atelier 1)
  {
    const n = snap.opportunities.length;
    items.push({
      livrableSection: 17,
      title: "Opportunités",
      coverage: n >= 2 ? 100 : n > 0 ? 50 : 0,
      origin: "ATELIER_1",
      highlights: n > 0 ? [`${n} opportunité(s)`] : [],
      gaps: n === 0 ? ["Aucune opportunité listée."] : [],
      deepLinkUrl: `${a1Base}/opportunities`,
    });
  }

  return items;
}

export function coverageAverage(items: CoverageItem[]): number {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((s, i) => s + i.coverage, 0) / items.length);
}

// -------------------------------------------------------------
// MATURITÉ DÉRIVÉE — calculée par l'engine vs auto-déclarée
// (révèle les écarts de perception).
// -------------------------------------------------------------
export type DerivedMaturity = {
  needClarity: number;       // 1-5
  workflowKnowledge: number;
  dataMaturity: number;
  governanceMaturity: number;
  stakeholderAlignment: number;
  realismLevel: number;
  overall: "LOW" | "MEDIUM" | "HIGH";
};

export function deriveMaturity(snap: Atelier3Snapshot): DerivedMaturity {
  // needClarity : longueur + qualité de la reformulation, présence de KPIs et objectifs
  const reformulated = (snap.businessNeed?.reformulatedNeed ?? "").trim();
  const hasObjectives = snap.objectives.length > 0;
  const hasKpis = snap.kpis.filter((k) => k.measureStatus === "MEASURED").length > 0;
  let needClarity = 1;
  if (reformulated.length >= 60) needClarity = 2;
  if (reformulated.length >= 60 && hasObjectives) needClarity = 3;
  if (reformulated.length >= 60 && hasObjectives && hasKpis) needClarity = 4;
  if (reformulated.length >= 60 && hasObjectives && hasKpis && snap.atelier1Gate?.verdict === "READY") needClarity = 5;

  // workflowKnowledge : nombre d'étapes process, présence de qualification IA/auto
  const stepCount = snap.processSteps.length;
  const taskQualified = snap.taskQualifications.length;
  let workflowKnowledge = 1;
  if (stepCount >= 3) workflowKnowledge = 3;
  if (stepCount >= 5) workflowKnowledge = 4;
  if (taskQualified >= 3 && stepCount >= 3) workflowKnowledge = 5;

  // dataMaturity : DataAssessment + KPI mesurés
  const da = snap.dataAssessment;
  let dataMaturity = 1;
  if (da) {
    dataMaturity = 2;
    if (da.quality && da.availability) dataMaturity = 3;
    if (da.quality && da.availability && hasKpis) dataMaturity = 4;
  }

  // governanceMaturity : validations humaines définies, DPO consulté, audit prévu
  const hv = snap.humanValidations.length;
  const reg = snap.regulatoryAnalysis;
  let governanceMaturity = 1;
  if (hv > 0) governanceMaturity = 2;
  if (hv > 0 && reg?.dpoConsulted) governanceMaturity = 3;
  if (hv > 0 && reg?.dpoConsulted && reg.auditRequired) governanceMaturity = 4;
  if (hv >= 2 && reg?.dpoConsulted && reg.auditRequired && snap.atelier2Synthesis?.governanceLevel) governanceMaturity = 5;

  // stakeholderAlignment : acteurs + sponsor + scope validé
  const stakeholderAlignment =
    (snap.actors.length >= 3 ? 1 : 0) +
    (snap.qualification?.businessOwner ? 1 : 0) +
    (snap.scope?.scopeValidatedBy ? 2 : 0) +
    (snap.atelier1Gate?.verdict === "READY" ? 1 : 0);

  // realismLevel : hypothèses identifiées + objectifs + KPI mesurés
  const realismLevel =
    (snap.assumptions.length >= 2 ? 2 : snap.assumptions.length > 0 ? 1 : 0) +
    (hasObjectives ? 1 : 0) +
    (hasKpis ? 2 : 0);

  // Overall
  const avg =
    (needClarity + workflowKnowledge + dataMaturity + governanceMaturity +
      Math.min(5, stakeholderAlignment) + Math.min(5, realismLevel)) / 6;
  const overall: "LOW" | "MEDIUM" | "HIGH" = avg < 2.5 ? "LOW" : avg < 4 ? "MEDIUM" : "HIGH";

  return {
    needClarity,
    workflowKnowledge,
    dataMaturity,
    governanceMaturity,
    stakeholderAlignment: Math.min(5, Math.max(1, stakeholderAlignment)),
    realismLevel: Math.min(5, Math.max(1, realismLevel)),
    overall,
  };
}

// -------------------------------------------------------------
// POINTS CRITIQUES — détection multi-sources
// -------------------------------------------------------------
export type CriticalPoint = {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  detail: string;
  source: string; // d'où vient l'info
  fixHint?: string;
};

export function detectCriticalPoints(snap: Atelier3Snapshot): CriticalPoint[] {
  const points: CriticalPoint[] = [];

  // 1. Données absentes
  if (!snap.dataAssessment || !snap.dataAssessment.quality) {
    points.push({
      id: "data.missing",
      severity: "HIGH",
      title: "Données mal qualifiées",
      detail: "Aucune évaluation de qualité/disponibilité des données. Impossible de juger la faisabilité IA.",
      source: "DataAssessment",
      fixHint: "Compléter l'analyse data avant scoring.",
    });
  }

  // 2. Réglementaire non investigué
  if (!snap.regulatoryAnalysis || !snap.regulatoryAnalysis.dpoConsulted) {
    if (snap.dataAssessment?.personalData || snap.dataAssessment?.sensitivity === "SENSITIVE") {
      points.push({
        id: "regulatory.dpo-missing",
        severity: "CRITICAL",
        title: "Données sensibles sans DPO consulté",
        detail: "Les données sont personnelles ou sensibles, mais aucune consultation DPO n'a eu lieu.",
        source: "DataAssessment + RegulatoryAnalysis",
        fixHint: "Consulter le DPO avant tout POC.",
      });
    }
  }

  // 3. Aucune validation humaine alors qu'on a des décisions IA
  const aiDecisions = snap.taskQualifications.filter(
    (t) => (t.verdict === "AI" || t.verdict === "HYBRID") && t.nature === "DECIDE",
  ).length;
  if (aiDecisions > 0 && snap.humanValidations.length === 0) {
    points.push({
      id: "governance.no-validation-on-ai-decisions",
      severity: "CRITICAL",
      title: "Décisions IA sans validation humaine",
      detail: `${aiDecisions} décision(s) confiée(s) à l'IA sans point de validation humaine défini.`,
      source: "TaskQualification + HumanValidationPoint",
      fixHint: "Ajouter des points de validation humaine bloquante.",
    });
  }

  // 4. Hypothèses critiques non vérifiées
  const criticalUnverified = snap.assumptions.filter(
    (a) => (a.riskIfWrong === "HIGH" || a.riskIfWrong === "CRITICAL") && a.status === "UNVERIFIED",
  );
  if (criticalUnverified.length > 0) {
    points.push({
      id: "assumptions.critical-unverified",
      severity: "HIGH",
      title: `${criticalUnverified.length} hypothèse(s) critique(s) non vérifiée(s)`,
      detail: criticalUnverified
        .slice(0, 2)
        .map((a) => `« ${truncate(a.statement, 60)} »`)
        .join(" — "),
      source: "ProjectAssumption",
      fixHint: "Vérifier avant d'engager du POC.",
    });
  }

  // 5. Zone floue critique
  const openHigh = snap.uncertainties.filter((u) => u.severity === "HIGH" && u.status === "OPEN");
  if (openHigh.length > 0) {
    points.push({
      id: "uncertainties.high-open",
      severity: "HIGH",
      title: `${openHigh.length} zone(s) floue(s) critique(s) ouverte(s)`,
      detail: openHigh
        .slice(0, 2)
        .map((u) => `${u.topic}`)
        .join(" — "),
      source: "Uncertainty",
      fixHint: "Affecter un responsable et fixer une échéance.",
    });
  }

  // 6. Dépendance SI bloquante
  const blockingDeps = snap.dependencies.filter((d) => d.blocking);
  if (blockingDeps.length > 0) {
    points.push({
      id: "deps.blocking",
      severity: "HIGH",
      title: `${blockingDeps.length} dépendance(s) bloquante(s)`,
      detail: blockingDeps.map((d) => d.name).join(", "),
      source: "TechnicalDependency",
      fixHint: "Sécuriser l'accès / l'API avant POC.",
    });
  }

  // 7. AI Act high
  if (snap.regulatoryAnalysis?.euAiActTier === "HIGH") {
    points.push({
      id: "regulatory.eu-ai-act-high",
      severity: "CRITICAL",
      title: "EU AI Act — niveau HIGH RISK",
      detail: "Le projet entre dans la catégorie haut-risque AI Act. Obligations de conformité importantes.",
      source: "RegulatoryAnalysis",
      fixHint: "Mettre en place documentation, monitoring, traçabilité.",
    });
  }

  // 8. Volume d'exceptions élevé avec IA
  if (snap.exceptions.length >= 5) {
    points.push({
      id: "exceptions.high-volume",
      severity: "MEDIUM",
      title: `${snap.exceptions.length} exceptions identifiées`,
      detail: "Volume d'exceptions élevé — l'IA aura du mal à traiter sans humain.",
      source: "ProcessException",
      fixHint: "Concevoir un fallback humain robuste.",
    });
  }

  return points;
}

// -------------------------------------------------------------
// RECOMMANDATIONS — dérivées
// -------------------------------------------------------------
export type Recommendation = {
  id: string;
  priority: "CORE" | "RECOMMENDED" | "OPTIONAL";
  title: string;
  detail: string;
};

export function deriveRecommendations(snap: Atelier3Snapshot): Recommendation[] {
  const recs: Recommendation[] = [];
  const maturity = deriveMaturity(snap);

  if (maturity.overall === "LOW") {
    recs.push({
      id: "rec.low-maturity",
      priority: "CORE",
      title: "Approfondir le cadrage avant scoring",
      detail: "Maturité globale faible. Revoir besoin, workflow ou data avant d'aller au scoring atelier 4.",
    });
  }

  if (maturity.dataMaturity < 3) {
    recs.push({
      id: "rec.data-maturity",
      priority: "CORE",
      title: "Renforcer la qualification data",
      detail: "Identifier sources, qualité, accessibilité — pré-requis IA.",
    });
  }

  if (maturity.governanceMaturity < 3) {
    recs.push({
      id: "rec.governance",
      priority: "RECOMMENDED",
      title: "Renforcer la gouvernance",
      detail: "Ajouter validations humaines, consulter DPO, prévoir audit.",
    });
  }

  if (snap.atelier2Synthesis?.recommendedProfile === "AI_CENTRIC") {
    recs.push({
      id: "rec.ai-centric-poc",
      priority: "RECOMMENDED",
      title: "Démarrer par un POC focalisé",
      detail: "Profil IA-centric : valider la techno sur un périmètre restreint avant industrialisation.",
    });
  }

  if (snap.atelier2Synthesis?.recommendedProfile === "AUTOMATION_ONLY") {
    recs.push({
      id: "rec.no-ai-needed",
      priority: "CORE",
      title: "Ne pas faire de l'IA pour faire de l'IA",
      detail: "Profil automatisation classique : BPM + RPA + APIs sont la bonne réponse.",
    });
  }

  if (snap.processSteps.length === 0) {
    recs.push({
      id: "rec.map-workflow",
      priority: "CORE",
      title: "Cartographier le workflow AS-IS",
      detail: "Sans workflow, aucune analyse IA vs auto n'est fiable. Retour atelier 1.",
    });
  }

  return recs;
}

// -------------------------------------------------------------
// Gate atelier 4
// -------------------------------------------------------------
export type A3GateCriterion = {
  id: keyof Omit<
    NonNullable<Atelier3Snapshot["gate"]>,
    "id" | "projectId" | "verdict" | "overrideNotes" | "decidedAt" | "decidedBy" | "createdAt" | "updatedAt"
  >;
  label: string;
  met: boolean;
  why?: string;
};

export function computeA3Gate(snap: Atelier3Snapshot): A3GateCriterion[] {
  const coverage = buildCoverageMap(snap);
  const avg = coverageAverage(coverage);
  const docOk = Boolean(snap.documentAnalysis?.complexityLevel);
  const regOk = Boolean(snap.regulatoryAnalysis && (snap.regulatoryAnalysis.dpoConsulted || snap.regulatoryAnalysis.euAiActTier !== "NONE"));
  const m = snap.maturity;
  const matOk = Boolean(m?.needClarity && m?.dataMaturity && m?.governanceMaturity);
  const f = snap.feasibility;
  const feasOk = Boolean(f?.overallFeasibility);
  const synthOk = Boolean(snap.synthesis?.finalRecommendation);
  const scoringPrepOk = Boolean(snap.synthesis?.scoringPreparationNotes);

  return [
    {
      id: "coverageReviewComplete",
      label: "Revue de couverture (≥ 70% des sections atelier 1+2 traitées)",
      met: avg >= 70,
      why: avg < 70 ? `Couverture moyenne : ${avg}%.` : undefined,
    },
    {
      id: "documentaryComplete",
      label: "Analyse documentaire complétée",
      met: docOk,
      why: !docOk ? "Analyse documentaire vide." : undefined,
    },
    {
      id: "regulatoryComplete",
      label: "Analyse réglementaire (DPO consulté ou AI Act tier défini)",
      met: regOk,
      why: !regOk ? "Aucune trace DPO / EU AI Act." : undefined,
    },
    {
      id: "maturityScored",
      label: "Maturité auto-évaluée (≥ 3 axes)",
      met: matOk,
      why: !matOk ? "Maturité partiellement évaluée." : undefined,
    },
    {
      id: "feasibilityScored",
      label: "Faisabilité globale renseignée",
      met: feasOk,
      why: !feasOk ? "Verdict faisabilité absent." : undefined,
    },
    {
      id: "synthesisWritten",
      label: "Synthèse finale rédigée",
      met: synthOk,
      why: !synthOk ? "Pas de recommandation finale." : undefined,
    },
    {
      id: "scoringPreparationReady",
      label: "Préparation scoring atelier 4",
      met: scoringPrepOk,
      why: !scoringPrepOk ? "Notes scoring vides." : undefined,
    },
  ];
}

export function isA3GateReady(snap: Atelier3Snapshot): boolean {
  return computeA3Gate(snap).every((c) => c.met);
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
