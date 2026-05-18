import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { AssumptionsEditor } from "@/components/atelier1/editors/assumptions-editor";
import { addAssumption, deleteAssumption, updateAssumption } from "@/lib/actions/atelier1";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

export default async function AssumptionsPage(props: PageProps<"/projects/[id]/atelier/1/assumptions">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addAssumption(id, formData); }
  async function onUpdate(aid: string, formData: FormData) { "use server"; await updateAssumption(id, aid, formData); }
  async function onDelete(aid: string) { "use server"; await deleteAssumption(id, aid); }

  const critical = snap.assumptions.filter((a) => (a.riskIfWrong === "HIGH" || a.riskIfWrong === "CRITICAL") && a.status === "UNVERIFIED").length;

  return (
    <SectionShell
      phaseLabel="Phase E — Risques de cadrage"
      title="Hypothèses projet"
      livrableRef="§9 du livrable atelier 1"
      intent="Expliciter ce qu'on TIENT POUR ACQUIS — et qu'il faut vérifier."
      pourquoi={[
        "Une hypothèse non explicitée est un risque caché.",
        "Une hypothèse critique non vérifiée = risque CRITIQUE pour le projet.",
        "L'atelier 7 utilise les hypothèses critiques pour challenger la décision finale.",
      ]}
      cherche={["≥ 3 hypothèses typées.", "Niveau de risque si fausse.", "Plan de vérification pour chacune."]}
    >
      {critical > 0 ? (
        <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
          ⚠ <strong>{critical} hypothèse(s) critique(s) non vérifiée(s)</strong> — à investiguer en priorité.
        </div>
      ) : null}
      <AssumptionsEditor
        items={snap.assumptions.map((a) => ({
          id: a.id, statement: a.statement, assumptionType: a.assumptionType, riskIfWrong: a.riskIfWrong, status: a.status, validationPlan: a.validationPlan,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
