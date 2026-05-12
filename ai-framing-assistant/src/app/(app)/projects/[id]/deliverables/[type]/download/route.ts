import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { DELIVERABLE_TYPES, type DeliverableType } from "@/types";

function isDeliverableType(v: string): v is DeliverableType {
  return (DELIVERABLE_TYPES as readonly string[]).includes(v);
}

// GET /projects/[id]/deliverables/[type]/download
// Serves the markdown file as an attachment.
export async function GET(
  _req: Request,
  ctx: RouteContext<"/projects/[id]/deliverables/[type]/download">,
) {
  const { id, type } = await ctx.params;

  if (!isDeliverableType(type)) {
    return new NextResponse("Type de livrable invalide.", { status: 400 });
  }

  const [project, deliverable] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    prisma.deliverable.findFirst({
      where: { projectId: id, type },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!project || !deliverable) {
    return new NextResponse("Livrable introuvable.", { status: 404 });
  }

  const slug = project.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);

  const filename = `${slug || "projet"}-${type.toLowerCase()}.md`;

  return new NextResponse(deliverable.content, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
