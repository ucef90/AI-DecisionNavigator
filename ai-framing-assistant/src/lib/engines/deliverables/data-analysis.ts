// Analyse data — focus sources / qualité / sensibilité / RGPD.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { bullets, field, footer, header, section } from "./helpers";

export function generateDataAnalysis(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const da = snap.dataAssessment;
  const ins = report.insights.data;

  if (!da) {
    return `${header("Analyse data", snap.name)}\nL'analyse data n'a pas été réalisée.\n${footer()}`;
  }

  const dataSignals = report.maturity.signals.filter(
    (s) => s.category === "DATA",
  );

  return `${header("Analyse data", snap.name)}
## Sommaire

${field("Maturité data dérivée", `${(report.maturity.scores.data * 100).toFixed(0)} / 100`)}
${field("Score moteur axe data", `${report.scoring.axes.find((a) => a.id === "dataMaturity")?.value}/3`)}
${field("Sensibilité", da.sensitivity ?? "—")}
${field("Données personnelles", da.personalData ? "Oui" : "Non")}

${section(
  "Sources identifiées",
  da.dataSources.length > 0 ? bullets(da.dataSources) : "_Aucune source identifiée — prérequis bloquant._",
)}

${section(
  "Types de données",
  `- Structurées : ${da.structured ? "Oui" : "Non"}\n- Non structurées : ${da.unstructured ? "Oui" : "Non"}\n- Mixte (semi-structuré déduit) : ${ins.types.semiStructured ? "Oui" : "Non"}`,
)}

${section(
  "Qualité & accessibilité",
  `${field("Qualité", da.quality)}
${field("Accessibilité", da.availability)}
${field("Historique disponible", da.history)}
${field("Silos / fragmentation", da.silos)}`,
)}

${section(
  "RGPD & conformité",
  da.personalData
    ? `${field("Sensibilité", da.sensitivity ?? "—")}
${field("Contraintes RGPD", da.rgpdConstraints)}

Le traitement de données personnelles **impose** :
- une base légale documentée ;
- une AIPD validée par le DPO avant POC ;
- une politique de conservation et de droit d'accès ;
- une traçabilité des accès et traitements.`
    : "Aucune donnée personnelle identifiée à ce stade.",
)}

${section(
  "Usages dérivés par le moteur",
  ins.usages.length > 0 ? bullets(ins.usages) : null,
)}

${section(
  "Signaux moteur sur la data",
  dataSignals.length > 0
    ? bullets(dataSignals.map((s) => `**${s.title}** — ${s.detail}`))
    : "_Aucun signal critique détecté._",
)}

${footer()}`;
}
