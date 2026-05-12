// Engines orchestrator — single entry point for the UI / server actions.
//
// The pages should never import individual engines directly; they call
// `computeEngineReport(snapshot)` and consume the result. This keeps the
// dependency tree visible (one place where all engines are wired together)
// and makes it cheap to add a new engine (e.g. ROI estimator).

import { analyseMaturity, type MaturityReport } from "./maturity";
import { computeScoring, type ScoringResult } from "./scoring";
import {
  decideFromScoring,
  buildActionPlan,
  type DecisionResult,
  type ActionPlan,
} from "./decision";
import { buildCartography, buildInsights } from "./cartography";
import type { Cartography, CartographyInsights } from "./cartography";
import type { ProjectSnapshot } from "./types";

export type EngineReport = {
  maturity: MaturityReport;
  scoring: ScoringResult;
  decision: DecisionResult;
  actionPlan: ActionPlan;
  cartography: Cartography;
  insights: CartographyInsights;
};

export function computeEngineReport(snapshot: ProjectSnapshot): EngineReport {
  const maturity = analyseMaturity(snapshot);
  const scoring = computeScoring(snapshot);
  const decision = decideFromScoring(snapshot, scoring);
  const actionPlan = buildActionPlan(snapshot, decision);
  const cartography = buildCartography(snapshot, scoring, decision);
  const insights = buildInsights(snapshot, scoring, decision);
  return { maturity, scoring, decision, actionPlan, cartography, insights };
}

export type { ProjectSnapshot } from "./types";
export type { ScoringResult, AxisScore, ScoringAxisId } from "./scoring";
export type { DecisionResult, DecisionRationaleItem, ActionStep, ActionPlan } from "./decision";
export type { MaturityReport } from "./maturity";
export type {
  Cartography,
  Graph,
  Node,
  Edge,
  CartographyLayerId,
  CartographyInsights,
} from "./cartography";
export type { Signal, SignalSeverity, SignalCategory, Confidence } from "./types";
