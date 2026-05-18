import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { MonitoringEditor } from "@/components/atelier6/editors/monitoring-editor";
import { addMonitoringKpi, deleteMonitoringKpi, updateMonitoringKpi } from "@/lib/actions/atelier6";
import { loadAtelier6Snapshot } from "@/lib/engines/atelier6";

export default async function A6MonitoringPage(props: PageProps<"/projects/[id]/atelier/6/monitoring">) {
  const { id } = await props.params;
  const snap = await loadAtelier6Snapshot(id);
  if (!snap) notFound();

  async function onCreate(formData: FormData) { "use server"; await addMonitoringKpi(id, formData); }
  async function onUpdate(kid: string, formData: FormData) { "use server"; await updateMonitoringKpi(id, kid, formData); }
  async function onDelete(kid: string) { "use server"; await deleteMonitoringKpi(id, kid); }

  return (
    <SectionShell
      phaseLabel="Phase E — Monitoring"
      title="Monitoring & supervision IA"
      livrableRef="§7 du livrable atelier 6"
      intent="KPI à surveiller en production : performance, qualité, dérive, incidents."
      pourquoi={["Sans monitoring, on déploie aveuglément.", "Dérive modèle = silencieuse sans alerte sur score de confiance.", "Atelier 7 (industrialisation) suppose monitoring défini."]}
      cherche={["≥ 3 KPI couvrant performance + qualité + dérive.", "Seuils d'alerte définis.", "Responsable nommé."]}
    >
      <MonitoringEditor
        items={snap.monitoringKpis.map((k) => ({
          id: k.id,
          name: k.name,
          category: k.category,
          unit: k.unit,
          targetValue: k.targetValue,
          alertThreshold: k.alertThreshold,
          frequency: k.frequency,
          responsibleRole: k.responsibleRole,
        }))}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </SectionShell>
  );
}
