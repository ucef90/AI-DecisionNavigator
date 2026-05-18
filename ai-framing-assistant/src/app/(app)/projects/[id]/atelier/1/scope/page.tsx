import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ScopeEditor } from "@/components/atelier1/editors/scope-editor";
import { safeJSON } from "@/components/common/data-block";
import { saveScope } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function ScopePage(props: PageProps<"/projects/[id]/atelier/1/scope">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();
  const s = snap.scope;

  async function action(formData: FormData) {
    "use server";
    await saveScope(id, formData);
  }

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
      <ScopeEditor
        defaults={{
          inScopeText: safeJSON<string[]>(s?.inScope, []).join("\n"),
          outOfScopeText: safeJSON<string[]>(s?.outOfScope, []).join("\n"),
          assumptionsForScope: s?.assumptionsForScope ?? "",
          scopeValidatedBy: s?.scopeValidatedBy ?? "",
        }}
        action={action}
      />
    </SectionShell>
  );
}
