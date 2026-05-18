"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  COMPLIANCE_FRAMEWORKS,
  COMPLIANCE_STATUSES,
  INCIDENT_TYPES,
  KPI_CATEGORIES,
  KPI_FREQUENCIES,
  RACI_TYPES,
  SECURITY_DOMAINS,
  SECURITY_STATUSES,
} from "@/types/atelier6";

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

// =============================================================
// GOVERNANCE ROLES (RACI)
// =============================================================
export async function addGovernanceRole(projectId: string, form: FormData): Promise<void> {
  const scope = str(form.get("scope"));
  const actorRole = str(form.get("actorRole"));
  if (!scope || !actorRole) return;
  await prisma.governanceRole.create({
    data: {
      projectId,
      scope,
      actorRole,
      responsibilityType: inSet(form.get("responsibilityType"), RACI_TYPES, "R"),
      actorName: optStr(form.get("actorName")),
      description: optStr(form.get("description")),
    },
  });
  rev(projectId);
}
export async function updateGovernanceRole(projectId: string, rid: string, form: FormData): Promise<void> {
  await prisma.governanceRole.update({
    where: { id: rid },
    data: {
      scope: str(form.get("scope")) || undefined,
      actorRole: str(form.get("actorRole")) || undefined,
      responsibilityType: inSet(form.get("responsibilityType"), RACI_TYPES, "R"),
      actorName: optStr(form.get("actorName")),
      description: optStr(form.get("description")),
    },
  });
  rev(projectId);
}
export async function deleteGovernanceRole(projectId: string, rid: string): Promise<void> {
  await prisma.governanceRole.delete({ where: { id: rid } });
  rev(projectId);
}

// =============================================================
// SECURITY CONTROLS
// =============================================================
export async function addSecurityControl(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  await prisma.securityControl.create({
    data: {
      projectId,
      name,
      domain: inSet(form.get("domain"), SECURITY_DOMAINS, "OTHER"),
      status: inSet(form.get("status"), SECURITY_STATUSES, "PLANNED"),
      description: optStr(form.get("description")),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function updateSecurityControl(projectId: string, cid: string, form: FormData): Promise<void> {
  await prisma.securityControl.update({
    where: { id: cid },
    data: {
      name: str(form.get("name")) || undefined,
      domain: inSet(form.get("domain"), SECURITY_DOMAINS, "OTHER"),
      status: inSet(form.get("status"), SECURITY_STATUSES, "PLANNED"),
      description: optStr(form.get("description")),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function deleteSecurityControl(projectId: string, cid: string): Promise<void> {
  await prisma.securityControl.delete({ where: { id: cid } });
  rev(projectId);
}

// =============================================================
// COMPLIANCE ITEMS
// =============================================================
export async function addComplianceItem(projectId: string, form: FormData): Promise<void> {
  const requirement = str(form.get("requirement"));
  if (!requirement) return;
  await prisma.complianceItem.create({
    data: {
      projectId,
      framework: inSet(form.get("framework"), COMPLIANCE_FRAMEWORKS, "OTHER"),
      requirement,
      requirementCode: optStr(form.get("requirementCode")),
      status: inSet(form.get("status"), COMPLIANCE_STATUSES, "PARTIAL"),
      evidence: optStr(form.get("evidence")),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function updateComplianceItem(projectId: string, cid: string, form: FormData): Promise<void> {
  await prisma.complianceItem.update({
    where: { id: cid },
    data: {
      framework: inSet(form.get("framework"), COMPLIANCE_FRAMEWORKS, "OTHER"),
      requirement: str(form.get("requirement")) || undefined,
      requirementCode: optStr(form.get("requirementCode")),
      status: inSet(form.get("status"), COMPLIANCE_STATUSES, "PARTIAL"),
      evidence: optStr(form.get("evidence")),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function deleteComplianceItem(projectId: string, cid: string): Promise<void> {
  await prisma.complianceItem.delete({ where: { id: cid } });
  rev(projectId);
}

// =============================================================
// MONITORING KPIS
// =============================================================
export async function addMonitoringKpi(projectId: string, form: FormData): Promise<void> {
  const name = str(form.get("name"));
  if (!name) return;
  await prisma.monitoringKpi.create({
    data: {
      projectId,
      name,
      category: inSet(form.get("category"), KPI_CATEGORIES, "PERFORMANCE"),
      unit: optStr(form.get("unit")),
      targetValue: optStr(form.get("targetValue")),
      alertThreshold: optStr(form.get("alertThreshold")),
      frequency: inSet(form.get("frequency"), KPI_FREQUENCIES, "DAILY"),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function updateMonitoringKpi(projectId: string, kid: string, form: FormData): Promise<void> {
  await prisma.monitoringKpi.update({
    where: { id: kid },
    data: {
      name: str(form.get("name")) || undefined,
      category: inSet(form.get("category"), KPI_CATEGORIES, "PERFORMANCE"),
      unit: optStr(form.get("unit")),
      targetValue: optStr(form.get("targetValue")),
      alertThreshold: optStr(form.get("alertThreshold")),
      frequency: inSet(form.get("frequency"), KPI_FREQUENCIES, "DAILY"),
      responsibleRole: optStr(form.get("responsibleRole")),
    },
  });
  rev(projectId);
}
export async function deleteMonitoringKpi(projectId: string, kid: string): Promise<void> {
  await prisma.monitoringKpi.delete({ where: { id: kid } });
  rev(projectId);
}

// =============================================================
// INCIDENT PROCEDURES
// =============================================================
export async function addIncidentProcedure(projectId: string, form: FormData): Promise<void> {
  await prisma.incidentProcedure.create({
    data: {
      projectId,
      incidentType: inSet(form.get("incidentType"), INCIDENT_TYPES, "OTHER"),
      severity: inSet(form.get("severity"), ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const, "MEDIUM"),
      detectionMethod: optStr(form.get("detectionMethod")),
      escalationPath: optStr(form.get("escalationPath")),
      correctiveActions: optStr(form.get("correctiveActions")),
      postIncidentReview: form.get("postIncidentReview") === "on",
    },
  });
  rev(projectId);
}
export async function updateIncidentProcedure(projectId: string, pid: string, form: FormData): Promise<void> {
  await prisma.incidentProcedure.update({
    where: { id: pid },
    data: {
      incidentType: inSet(form.get("incidentType"), INCIDENT_TYPES, "OTHER"),
      severity: inSet(form.get("severity"), ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const, "MEDIUM"),
      detectionMethod: optStr(form.get("detectionMethod")),
      escalationPath: optStr(form.get("escalationPath")),
      correctiveActions: optStr(form.get("correctiveActions")),
      postIncidentReview: form.get("postIncidentReview") === "on",
    },
  });
  rev(projectId);
}
export async function deleteIncidentProcedure(projectId: string, pid: string): Promise<void> {
  await prisma.incidentProcedure.delete({ where: { id: pid } });
  rev(projectId);
}

// =============================================================
// ATELIER 6 SYNTHESIS
// =============================================================
const linesToJSON = (v: unknown): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const list = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return list.length > 0 ? JSON.stringify(list) : null;
};

export async function saveA6Synthesis(projectId: string, form: FormData): Promise<void> {
  const data = {
    overallStatement: optStr(form.get("overallStatement")),
    industrializationReadiness: form.get("industrializationReadiness") === "on",
    strongPoints: linesToJSON(form.get("strongPoints")),
    weakPoints: linesToJSON(form.get("weakPoints")),
    priorityActions: linesToJSON(form.get("priorityActions")),
  };
  await prisma.atelier6Synthesis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  rev(projectId);
}
