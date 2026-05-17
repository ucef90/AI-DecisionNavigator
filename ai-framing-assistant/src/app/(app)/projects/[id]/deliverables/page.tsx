import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ClipboardList,
  Download,
  Eye,
  FileText,
  Map as MapIcon,
  ScrollText,
  ShieldAlert,
  Target,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DeleteDeliverableButton,
  GenerateAllButton,
  RegenerateOneButton,
} from "@/components/deliverables/deliverable-actions";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  DELIVERABLE_TYPE_LABELS,
  DELIVERABLE_TYPES,
  type DeliverableType,
} from "@/types";

const DELIVERABLE_ICONS: Record<DeliverableType, LucideIcon> = {
  FRAMING_NOTE: ClipboardList,
  DECISION_SHEET: Target,
  CARTOGRAPHY: MapIcon,
  DATA_ANALYSIS: FileText,
  RISK_ANALYSIS: ShieldAlert,
  RECOMMENDATION: ScrollText,
  ACTION_PLAN: ClipboardList,
};

const DELIVERABLE_DESCRIPTIONS: Record<DeliverableType, string> = {
  FRAMING_NOTE: "Synthèse executive pour COPIL / sponsor.",
  DECISION_SHEET: "Document de gouvernance — décision et conditions.",
  CARTOGRAPHY: "Version textuelle des 6 vues systémiques.",
  DATA_ANALYSIS: "Sources, qualité, sensibilité, RGPD.",
  RISK_ANALYSIS: "10 axes de risque + mitigation.",
  RECOMMENDATION: "Recommandation finale et forces / faiblesses.",
  ACTION_PLAN: "Plan d'action ordonné avec pilotes et horizons.",
};

export default async function DeliverablesIndexPage(
  props: PageProps<"/projects/[id]/deliverables">,
) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      finalDecision: true,
      deliverables: {
        select: { type: true, createdAt: true, format: true },
      },
    },
  });
  if (!project) notFound();

  const persistedByType = new Map(
    project.deliverables.map((d) => [d.type, d] as const),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projets
          </Link>
          <span>/</span>
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
          <span>/</span>
          <span>Livrables</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Livrables projet
        </h2>
        <p className="text-sm text-muted-foreground">
          Sept livrables auto-générés depuis les engines (Markdown + impression PDF).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-0.5">
            <CardTitle className="text-sm">Génération</CardTitle>
            <p className="text-xs text-muted-foreground">
              {project.deliverables.length} / {DELIVERABLE_TYPES.length} livrables en base.
            </p>
          </div>
          <GenerateAllButton projectId={project.id} />
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {DELIVERABLE_TYPES.map((type) => {
              const persisted = persistedByType.get(type);
              const Icon = DELIVERABLE_ICONS[type];
              const isGenerated = !!persisted;
              return (
                <li
                  key={type}
                  className={cn(
                    "rounded-md border bg-background p-3",
                    isGenerated
                      ? "border-border"
                      : "border-dashed border-border/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {DELIVERABLE_TYPE_LABELS[type]}
                        </span>
                        {isGenerated ? (
                          <Badge variant="default" className="text-[10px]">
                            ✓ Généré
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Non généré
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {DELIVERABLE_DESCRIPTIONS[type]}
                      </p>
                      {persisted ? (
                        <p className="text-[10px] text-muted-foreground/80">
                          Dernière génération :{" "}
                          {persisted.createdAt.toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {isGenerated ? (
                      <>
                        <Link
                          href={`/projects/${project.id}/deliverables/${type}`}
                          className={cn(
                            buttonVariants({ size: "sm", variant: "default" }),
                            "h-7 px-2 text-xs",
                          )}
                        >
                          <Eye className="mr-1.5 size-3.5" /> Aperçu
                        </Link>
                        <a
                          href={`/projects/${project.id}/deliverables/${type}/download`}
                          className={cn(
                            buttonVariants({ size: "sm", variant: "outline" }),
                            "h-7 px-2 text-xs",
                          )}
                          download
                        >
                          <Download className="mr-1.5 size-3.5" /> .md
                        </a>
                        <RegenerateOneButton
                          projectId={project.id}
                          type={type}
                          label="Régénérer"
                          variant="ghost"
                        />
                        <DeleteDeliverableButton
                          projectId={project.id}
                          type={type}
                        />
                      </>
                    ) : (
                      <RegenerateOneButton
                        projectId={project.id}
                        type={type}
                        label="Générer"
                        variant="default"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <Link
          href={`/projects/${project.id}/cartography`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Cartographie
        </Link>
        <Link
          href={`/projects/${project.id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          Retour au projet →
        </Link>
      </div>
    </div>
  );
}
