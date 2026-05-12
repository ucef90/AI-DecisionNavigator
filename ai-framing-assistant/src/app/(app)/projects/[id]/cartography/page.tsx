import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayerTabs } from "@/components/cartography/layer-tabs";
import { buildProjectSnapshot } from "@/lib/db/snapshot";
import { computeEngineReport } from "@/lib/engines";

export default async function CartographyPage(
  props: PageProps<"/projects/[id]/cartography">,
) {
  const { id } = await props.params;
  const snapshot = await buildProjectSnapshot(id);
  if (!snapshot) notFound();

  const report = computeEngineReport(snapshot);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projets
          </Link>
          <span>/</span>
          <Link href={`/projects/${snapshot.id}`} className="hover:underline">
            {snapshot.name}
          </Link>
          <span>/</span>
          <span>Cartographie</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Cartographie projet
        </h2>
        <p className="text-sm text-muted-foreground">
          Six vues systémiques : métier, workflow, données, acteurs, technologies, risques.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Vues</CardTitle>
        </CardHeader>
        <CardContent>
          <LayerTabs insights={report.insights} />
        </CardContent>
      </Card>

      <div className="flex justify-between border-t border-border pt-4">
        <Link
          href={`/projects/${snapshot.id}/decision`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Décision
        </Link>
        <Link
          href={`/projects/${snapshot.id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          Retour au projet →
        </Link>
      </div>
    </div>
  );
}
