// Analyse risques — détail des 10 axes + stratégies de mitigation.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { OVERALL_RISK_LABELS } from "@/types";
import {
  asTable,
  bullets,
  field,
  footer,
  header,
  section,
} from "./helpers";

const RISK_AXES: { key: keyof Risks; label: string }[] = [
  { key: "rgpdRisk", label: "RGPD" },
  { key: "sensitiveDataRisk", label: "Données sensibles" },
  { key: "hallucinationRisk", label: "Hallucinations" },
  { key: "biasRisk", label: "Biais" },
  { key: "classificationRisk", label: "Erreur de classification" },
  { key: "autoDecisionRisk", label: "Décision automatisée" },
  { key: "securityRisk", label: "Sécurité" },
  { key: "vendorLockRisk", label: "Dépendance fournisseur" },
  { key: "adoptionRisk", label: "Adoption" },
  { key: "supervisionRisk", label: "Supervision humaine" },
];

type Risks = NonNullable<ProjectSnapshot["riskAssessment"]>;

export function generateRiskAnalysis(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const r = snap.riskAssessment;
  if (!r) {
    return `${header("Analyse risques", snap.name)}\nL'analyse des risques n'a pas été réalisée.\n${footer()}`;
  }

  const riskSignals = report.maturity.signals.filter(
    (s) => s.category === "RISK" || s.category === "GOVERNANCE",
  );

  const rows = RISK_AXES.map(({ key, label }) => {
    const value = r[key];
    if (typeof value !== "number") return [label, "—", levelText(null)];
    return [label, `${value}/5`, levelText(value)];
  });

  return `${header("Analyse des risques", snap.name)}
## Synthèse

${field("Niveau global", r.overallRisk ? OVERALL_RISK_LABELS[r.overallRisk] : "—")}
${field("Score moteur (Maîtrise des risques)", `${report.scoring.axes.find((a) => a.id === "riskControl")?.value}/3`)}
${field("Bloquants détectés", String(report.decision.blockers.length))}

${section("Risques évalués", asTable(["Axe", "Note", "Lecture"], rows))}

${
  report.decision.blockers.length > 0
    ? section(
        "Bloquants",
        bullets(report.decision.blockers.map((b) => `**${b.title}** — ${b.detail}`)),
      )
    : ""
}

${section(
  "Signaux moteur",
  riskSignals.length > 0
    ? bullets(
        riskSignals.map(
          (s) => `**${s.title}** — ${s.detail}`,
        ),
      )
    : "_Aucun signal critique détecté._",
)}

${section(
  "Plan de mitigation",
  r.mitigationPlan && r.mitigationPlan.length > 0
    ? r.mitigationPlan
    : "_Aucun plan de mitigation documenté — à compléter pour tout risque ≥ 3._",
)}

${footer()}`;
}

function levelText(v: number | null): string {
  if (v == null) return "Non évalué";
  if (v >= 5) return "Critique — mitigation obligatoire";
  if (v >= 4) return "Élevé — mitigation explicite requise";
  if (v >= 3) return "Modéré — surveiller";
  if (v >= 2) return "Faible";
  return "Négligeable";
}
