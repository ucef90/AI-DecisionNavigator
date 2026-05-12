// Recommandation finale — court livrable d'arbitrage.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { AI_APPROACH_LABELS, DECISION_LABELS } from "@/types";
import {
  bullets,
  decisionBadge,
  field,
  footer,
  header,
  section,
} from "./helpers";

export function generateRecommendation(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const recommended =
    report.decision.recommendedApproach ?? snap.aiAnalysis?.recommendedApproach ?? null;

  const strengths = report.decision.rationale.filter((r) => r.kind === "STRENGTH");
  const weaknesses = report.decision.rationale.filter((r) => r.kind === "WEAKNESS");
  const rules = report.decision.rationale.filter((r) => r.kind === "RULE" || r.kind === "BLOCKER");

  return `${header("Recommandation finale", snap.name)}
## Décision

${decisionBadge(report.decision.decision)} — ${DECISION_LABELS[report.decision.decision]}

${report.decision.headline}

${field("Score moteur", `${report.scoring.total}/18`)}
${field("Approche technologique pressentie", recommended ? AI_APPROACH_LABELS[recommended] : "—")}
${
  report.decision.overridden
    ? `\n> ⚠️ La décision a été abaissée depuis **${DECISION_LABELS[report.decision.decisionFromTotal]}** par les règles métier. Voir conditions ci-dessous.`
    : ""
}

${section(
  "Forces",
  strengths.length > 0
    ? bullets(strengths.map((s) => `**${s.label}** — ${s.detail}`))
    : "_Le moteur n'a pas identifié de force majeure à ce stade._",
)}

${section(
  "Faiblesses",
  weaknesses.length > 0
    ? bullets(weaknesses.map((w) => `**${w.label}** — ${w.detail}`))
    : "_Aucune faiblesse critique identifiée._",
)}

${
  rules.length > 0
    ? section(
        "Règles de gouvernance déclenchées",
        bullets(rules.map((r) => `**${r.label}** — ${r.detail}`)),
      )
    : ""
}

${section(
  "Conditions de mise en œuvre",
  `- Validation par le sponsor et la gouvernance projet.
- Mise en œuvre du plan d'action joint (voir livrable dédié).
- Revue trimestrielle des KPIs et signaux d'adoption.`,
)}
${footer()}`;
}
