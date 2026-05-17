// Dashboard aggregation — pulls portfolio metrics from the DB and runs the
// engines on each project to surface blockers / derived maturity.
//
// The cost is O(N) engine runs per dashboard render. With a few dozen
// projects this is still <50 ms total. If the portfolio grows past a few
// hundred projects, cache the report per project (e.g. persist a
// DecisionSnapshot row each time scoring changes) and read from that.

import { prisma } from "@/lib/prisma";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";
import type { Decision, ProjectStatus, Maturity } from "@/types";

export type DashboardData = {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  byDecision: Record<Decision | "PENDING", number>;
  byMaturity: Record<Maturity, number>;
  averageScore: number | null;
  alerts: AlertItem[];
  recent: RecentProject[];
  totalDeliverables: number;
};

export type AlertItem = {
  projectId: string;
  projectName: string;
  severity: "WARNING" | "CRITICAL";
  title: string;
  detail: string;
};

export type RecentProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  finalDecision: Decision | null;
  totalScore: number | null;
  derivedMaturity: Maturity | null;
  blockers: number;
  updatedAt: Date;
};

export async function buildDashboard(): Promise<DashboardData> {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      finalDecision: true,
      totalScore: true,
      maturity: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus: Record<ProjectStatus, number> = {
    DRAFT: 0,
    IN_PROGRESS: 0,
    SCORED: 0,
    DECIDED: 0,
    ARCHIVED: 0,
  };
  const byDecision: Record<Decision | "PENDING", number> = {
    GO_IA: 0,
    POC_IA: 0,
    AUTOMATION: 0,
    STUDY: 0,
    NO_GO: 0,
    PENDING: 0,
  };
  const byMaturity: Record<Maturity, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  let scoreSum = 0;
  let scoreCount = 0;

  for (const p of projects) {
    byStatus[(p.status as ProjectStatus) ?? "DRAFT"] =
      (byStatus[(p.status as ProjectStatus) ?? "DRAFT"] ?? 0) + 1;
    if (p.finalDecision) {
      byDecision[p.finalDecision as Decision] =
        (byDecision[p.finalDecision as Decision] ?? 0) + 1;
    } else {
      byDecision.PENDING += 1;
    }
    if (p.totalScore != null) {
      scoreSum += p.totalScore;
      scoreCount += 1;
    }
  }

  // Run the engines per project to surface alerts and derived maturity.
  const recent: RecentProject[] = [];
  const alerts: AlertItem[] = [];

  for (const p of projects) {
    const snapshot = await buildProjectSnapshot(p.id);
    if (!snapshot) continue;
    const report = computeEngineReport(snapshot);

    byMaturity[report.maturity.level] =
      (byMaturity[report.maturity.level] ?? 0) + 1;

    // Collect critical signals as portfolio alerts.
    for (const b of report.decision.blockers) {
      alerts.push({
        projectId: p.id,
        projectName: p.name,
        severity: "CRITICAL",
        title: b.title,
        detail: b.detail,
      });
    }
    // Surface remaining CRITICAL signals not already in blockers.
    for (const s of report.maturity.signals) {
      if (s.severity !== "CRITICAL") continue;
      if (alerts.some((a) => a.projectId === p.id && a.title === s.title)) {
        continue;
      }
      alerts.push({
        projectId: p.id,
        projectName: p.name,
        severity: "CRITICAL",
        title: s.title,
        detail: s.detail,
      });
    }

    recent.push({
      id: p.id,
      name: p.name,
      status: (p.status as ProjectStatus) ?? "DRAFT",
      finalDecision: (p.finalDecision as Decision | null) ?? null,
      totalScore: p.totalScore ?? null,
      derivedMaturity: report.maturity.level,
      blockers: report.decision.blockers.length,
      updatedAt: p.updatedAt,
    });
  }

  const totalDeliverables = await prisma.deliverable.count();

  return {
    total: projects.length,
    byStatus,
    byDecision,
    byMaturity,
    averageScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    alerts: alerts.slice(0, 8),
    recent: recent.slice(0, 6),
    totalDeliverables,
  };
}
