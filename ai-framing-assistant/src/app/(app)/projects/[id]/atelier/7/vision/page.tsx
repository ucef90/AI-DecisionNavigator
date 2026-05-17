import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { KpiCard } from "@/components/visualizations/kpi-card";
import { loadAtelier7Snapshot } from "@/lib/engines/atelier7";

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export default async function VisionSectionPage(
  props: PageProps<"/projects/[id]/atelier/7/vision">,
) {
  const { id } = await props.params;
  const snap = await loadAtelier7Snapshot(id);
  if (!snap) notFound();
  const v = snap.vision;

  return (
    <SectionShell
      phaseLabel="Phase B — Vision & architecture"
      title="Vision stratégique"
      livrableRef="§1 du livrable atelier 7"
      intent="Énoncé de vision, objectifs stratégiques, valeur business attendue."
      pourquoi={[
        "C'est l'énoncé qui rallie sponsor + équipes + direction.",
        "Sans vision claire, le projet dérive au gré des opportunités techniques.",
        "C'est aussi le pitch d'entrée du dossier COPIL.",
      ]}
      cherche={[
        "Une vision MÉTIER (pas techno).",
        "Des objectifs stratégiques mesurables (3-5 max).",
        "Une valeur business chiffrée si possible (ROI, gain).",
        "Des critères de succès SMART.",
      ]}
    >
      {!v ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
          Vision stratégique non encore définie.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiCard label="Score valeur business" value={`${v.businessValueScore ?? 0}/5`} tone={(v.businessValueScore ?? 0) >= 4 ? "good" : "warn"} />
            <KpiCard label="Score transformation" value={`${v.transformationScore ?? 0}/5`} tone={(v.transformationScore ?? 0) >= 4 ? "good" : "warn"} />
          </div>

          <Block title="Énoncé de vision" body={v.visionStatement} />
          <Block title="Valeur business" body={v.businessValue} />

          <ListBlock title="Objectifs stratégiques" items={safeJSON<string[]>(v.strategicObjectives, [])} />
          <ListBlock title="Objectifs de transformation" items={safeJSON<string[]>(v.transformationGoals, [])} />
          <ListBlock title="Critères de succès" items={safeJSON<string[]>(v.successCriteria, [])} />
        </div>
      )}
    </SectionShell>
  );
}

function Block({ title, body }: { title: string; body?: string | null }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {body?.trim() ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">(non renseigné)</p>
      )}
    </div>
  );
}
function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">(aucun élément)</p>
      ) : (
        <ul className="ml-5 list-disc space-y-1 text-sm">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      )}
    </div>
  );
}
