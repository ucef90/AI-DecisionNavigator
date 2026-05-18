"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  A3_MATURITY_LEVELS,
  A3_OVERALL_FEASIBILITIES,
  DOC_COMPLEXITY_LEVELS,
  DOC_EXPLOITABILITIES,
  DOC_STRUCTURE_LEVELS,
  EU_AI_ACT_TIERS,
} from "@/types/atelier3";

// Server actions atelier 3 — toutes les sections atelier 3 sont
// single-row (1-per-project) sauf les listes consolidées venant
// des ateliers en amont (qui restent en read-only).

function rev(projectId: string) {
  revalidatePath(`/projects/${projectId}`, "layout");
}

const inSet = <T extends string>(v: unknown, set: readonly T[], fallback: T): T => {
  const s = typeof v === "string" ? v : "";
  return (set as readonly string[]).includes(s) ? (s as T) : fallback;
};
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const optStr = (v: unknown): string | null => {
  const s = str(v);
  return s.length > 0 ? s : null;
};
const optInt = (v: unknown): number | null => {
  const n = typeof v === "string" || typeof v === "number" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const linesToJSON = (v: unknown): string | null => {
  const s = str(v);
  if (!s) return null;
  const list = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return list.length > 0 ? JSON.stringify(list) : null;
};

// =============================================================
// DocumentAnalysis (§6)
// =============================================================
export async function saveDocumentAnalysis(projectId: string, form: FormData): Promise<void> {
  const formats = (() => {
    const raw = str(form.get("formats"));
    if (!raw) return null;
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? JSON.stringify(list) : null;
  })();
  const data = {
    documentsExist: form.get("documentsExist") === "on",
    formats,
    structureLevel: inSet(form.get("structureLevel"), DOC_STRUCTURE_LEVELS, "MIXED") as string,
    exploitability: inSet(form.get("exploitability"), DOC_EXPLOITABILITIES, "MODERATE") as string,
    interpretationNeeded: form.get("interpretationNeeded") === "on",
    estimatedVolume: optStr(form.get("estimatedVolume")),
    ocrNeeded: form.get("ocrNeeded") === "on",
    nlpNeeded: form.get("nlpNeeded") === "on",
    ragNeeded: form.get("ragNeeded") === "on",
    complexityLevel: inSet(form.get("complexityLevel"), DOC_COMPLEXITY_LEVELS, "MEDIUM") as string,
    notes: optStr(form.get("notes")),
  };
  await prisma.documentAnalysis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// RegulatoryAnalysis (§11)
// =============================================================
export async function saveRegulatoryAnalysis(projectId: string, form: FormData): Promise<void> {
  const data = {
    rgpdApplicable: form.get("rgpdApplicable") === "on",
    sensitiveDataConcerned: form.get("sensitiveDataConcerned") === "on",
    legalObligations: linesToJSON(form.get("legalObligations")),
    auditRequired: form.get("auditRequired") === "on",
    dpoConsulted: form.get("dpoConsulted") === "on",
    cnilConsultation: form.get("cnilConsultation") === "on",
    euAiActTier: inSet(form.get("euAiActTier"), EU_AI_ACT_TIERS, "NONE"),
    euAiActJustification: optStr(form.get("euAiActJustification")),
    notes: optStr(form.get("notes")),
  };
  await prisma.regulatoryAnalysis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// MaturityAssessment (§14) — 6 axes 1-5
// =============================================================
export async function saveMaturityAssessment(projectId: string, form: FormData): Promise<void> {
  const data = {
    needClarity: optInt(form.get("needClarity")),
    workflowKnowledge: optInt(form.get("workflowKnowledge")),
    dataMaturity: optInt(form.get("dataMaturity")),
    governanceMaturity: optInt(form.get("governanceMaturity")),
    stakeholderAlignment: optInt(form.get("stakeholderAlignment")),
    realismLevel: optInt(form.get("realismLevel")),
    selfAssessmentNotes: optStr(form.get("selfAssessmentNotes")),
  };
  await prisma.maturityAssessment.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// FeasibilityAssessment (§15) — 5 axes + lists
// =============================================================
export async function saveFeasibilityAssessment(projectId: string, form: FormData): Promise<void> {
  const data = {
    technicallyFeasible: optInt(form.get("technicallyFeasible")),
    organizationallyFeasible: optInt(form.get("organizationallyFeasible")),
    regulatorilyFeasible: optInt(form.get("regulatorilyFeasible")),
    resourcesAvailable: optInt(form.get("resourcesAvailable")),
    dataAvailable: optInt(form.get("dataAvailable")),
    overallFeasibility: inSet(form.get("overallFeasibility"), A3_OVERALL_FEASIBILITIES, "MEDIUM") as string,
    blockingFactors: linesToJSON(form.get("blockingFactors")),
    enablers: linesToJSON(form.get("enablers")),
    notes: optStr(form.get("notes")),
  };
  await prisma.feasibilityAssessment.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}

// =============================================================
// Atelier3Synthesis (§21)
// =============================================================
export async function saveA3Synthesis(projectId: string, form: FormData): Promise<void> {
  const data = {
    realNeed: optStr(form.get("realNeed")),
    maturityLevel: inSet(form.get("maturityLevel"), A3_MATURITY_LEVELS, "MEDIUM") as string,
    complexityLevel: inSet(form.get("complexityLevel"), ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const, "MEDIUM") as string,
    mainRisks: linesToJSON(form.get("mainRisks")),
    mainConstraints: linesToJSON(form.get("mainConstraints")),
    feasibilityGlobal: inSet(form.get("feasibilityGlobal"), A3_OVERALL_FEASIBILITIES, "MEDIUM") as string,
    governanceLevel: inSet(form.get("governanceLevel"), ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const, "MEDIUM") as string,
    finalRecommendation: optStr(form.get("finalRecommendation")),
    scoringPreparationNotes: optStr(form.get("scoringPreparationNotes")),
    cartographyPreparationNotes: optStr(form.get("cartographyPreparationNotes")),
  };
  await prisma.atelier3Synthesis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}
