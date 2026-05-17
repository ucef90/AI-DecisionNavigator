import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ListBlock, DataBlock, safeJSON, EmptyState } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ScopePage(props: PageProps<"/projects/[id]/atelier/1/scope">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const s = snap.scope;

  return (
    <SectionShell
      phaseLabel="Phase D — Cible, valeur & périmètre"
      title="Périmètre & hors-scope"
      livrableRef="Ajout méthodologique critique"
      intent="Ce que le projet TRAITE et ce qu'il NE traite PAS — validé sponsor."
      pourquoi={[
        "Sans périmètre clair, scope creep garanti dès l'atelier 2.",
        "Le hors-scope est aussi important que le in-scope (évite faux espoirs).",
        "Validation sponsor = engagement écrit.",
      ]}
      cherche={[
        "3-5 items in-scope précis.",
        "3-5 items out-of-scope explicites.",
        "Personne et date de validation sponsor.",
      ]}
    >
      {!s ? <EmptyState message="Périmètre non défini." /> : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <ListBlock title="In scope" items={safeJSON<string[]>(s.inScope, [])} empty="Aucun item in-scope." />
            <ListBlock title="Hors scope" items={safeJSON<string[]>(s.outOfScope, [])} empty="Aucun item hors-scope." />
          </div>

          <DataBlock title="Hypothèses pour ce périmètre" body={s.assumptionsForScope} />

          {s.scopeValidatedBy ? (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-50/40 p-3 text-sm dark:bg-emerald-950/20">
              <Badge variant="outline" className="text-[10px]">✓ Périmètre validé</Badge>
              <p className="mt-1">{s.scopeValidatedBy}
                {s.scopeValidatedAt ? ` — ${new Date(s.scopeValidatedAt).toISOString().slice(0, 10)}` : ""}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-amber-500/40 bg-amber-50/40 p-3 text-sm dark:bg-amber-950/20">
              ⚠ Périmètre non validé par sponsor.
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}
