import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DecisionBadge,
  StatusBadge,
} from "@/components/projects/status-badge";
import { ProjectCardDeleteButton } from "@/components/projects/project-card-delete-button";
import { deleteProject } from "@/lib/actions/projects";
import { listProjects } from "@/lib/db/projects";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Projets</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? "Aucun projet pour l'instant."
              : `${projects.length} projet${projects.length > 1 ? "s" : ""} en cours de cadrage.`}
          </p>
        </div>
        <Link href="/projects/new" className={buttonVariants()}>
          + Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Crée ton premier projet IA pour démarrer le cadrage.
          </p>
          <Link
            href="/projects/new"
            className={`${buttonVariants()} mt-4`}
          >
            + Nouveau projet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            // Server action bindée au projectId via closure inline
            async function handleDelete(formData: FormData) {
              "use server";
              await deleteProject(p.id, formData);
            }
            return (
              <div key={p.id} className="group relative">
                {/* Bouton supprimer overlay : visible au survol, mini-dialogue inline */}
                <ProjectCardDeleteButton
                  projectId={p.id}
                  projectName={p.name}
                  onConfirm={handleDelete}
                />
                <Link href={`/projects/${p.id}`} className="block">
                  <Card className="transition-colors group-hover:border-foreground/20">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 pr-8">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <StatusBadge status={p.status} />
                      </div>
                      {p.direction ? (
                        <CardDescription>{p.direction}</CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      {p.managerName ? <div>Chef de projet : {p.managerName}</div> : null}
                      {p.sponsor ? <div>Sponsor : {p.sponsor}</div> : null}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <DecisionBadge decision={p.finalDecision} />
                      <span className="text-xs text-muted-foreground">
                        {p.totalScore != null ? `${p.totalScore}/18` : "Non scoré"}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
