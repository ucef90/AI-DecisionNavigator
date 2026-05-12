// Deliverables engine — turns an EngineReport into seven markdown documents.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import type { DeliverableType } from "@/types";
import { generateActionPlan } from "./action-plan";
import { generateCartography } from "./cartography";
import { generateDataAnalysis } from "./data-analysis";
import { generateDecisionSheet } from "./decision-sheet";
import { generateFramingNote } from "./framing-note";
import { generateRecommendation } from "./recommendation";
import { generateRiskAnalysis } from "./risk-analysis";

export type DeliverableContent = {
  type: DeliverableType;
  format: "markdown";
  content: string;
};

const GENERATORS: Record<
  DeliverableType,
  (snap: ProjectSnapshot, report: EngineReport) => string
> = {
  FRAMING_NOTE: generateFramingNote,
  DECISION_SHEET: generateDecisionSheet,
  CARTOGRAPHY: generateCartography,
  DATA_ANALYSIS: generateDataAnalysis,
  RISK_ANALYSIS: generateRiskAnalysis,
  RECOMMENDATION: generateRecommendation,
  ACTION_PLAN: generateActionPlan,
};

export function generateDeliverable(
  type: DeliverableType,
  snap: ProjectSnapshot,
  report: EngineReport,
): DeliverableContent {
  const gen = GENERATORS[type];
  return {
    type,
    format: "markdown",
    content: gen(snap, report),
  };
}

export function generateAllDeliverables(
  snap: ProjectSnapshot,
  report: EngineReport,
): DeliverableContent[] {
  return (Object.keys(GENERATORS) as DeliverableType[]).map((t) =>
    generateDeliverable(t, snap, report),
  );
}
