import { prisma } from "@/lib/prisma";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      direction: true,
      sponsor: true,
      managerName: true,
      status: true,
      maturity: true,
      finalDecision: true,
      totalScore: true,
      createdAt: true,
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      businessNeed: true,
      scoring: true,
    },
  });
}

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];
export type ProjectDetail = Awaited<ReturnType<typeof getProject>>;
