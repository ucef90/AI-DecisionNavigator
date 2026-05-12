// Fiche de décision IA — document de gouvernance synthétique.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { AI_APPROACH_LABELS, DECISION_LABELS, USER_ROLE_LABELS } from "@/types";
import {
  asTable,
  bullets,
  decisionBadge,
  field,
  footer,
  header,
  section,
} from "./helpers";

export function generateDecisionSheet(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const recommended =
    report.decision.recommendedApproach ?? snap.aiAnalysis?.recommendedApproach ?? null;

  return `${header("Fiche de décision IA", snap.name)}
## Décision

${decisionBadge(report.decision.decision)}

${field("Décision brute (score)", DECISION_LABELS[report.decision.decisionFromTotal])}
${field("Score total", `${report.scoring.total}/18`)}
${field("Lecture moteur", report.scoring.reading)}
${field("Approche technologique", recommended ? AI_APPROACH_LABELS[recommended] : null)}
${
  report.decision.overridden
    ? `\n> ⚠️ Décision **abaissée** par les règles métier depuis ${DECISION_LABELS[report.decision.decisionFromTotal]}. Voir détail ci-dessous.`
    : ""
}

${section("Identification", `${field("Projet", snap.name)}
${field("Direction", snap.direction)}
${field("Sponsor", snap.sponsor)}
${field("Description", snap.description)}`)}

${section(
  "Scoring détaillé",
  asTable(
    ["Axe", "Note", "Justification", "Confiance"],
    report.scoring.axes.map((a) => [
      axisLabel(a.id),
      `${a.value}/3`,
      a.rationale,
      a.confidence.toLowerCase(),
    ]),
  ),
)}

${section(
  "Justification structurée",
  report.decision.rationale
    .map((r) => {
      const icon =
        r.kind === "STRENGTH"
          ? "✅"
          : r.kind === "WEAKNESS"
            ? "⚠️"
            : r.kind === "BLOCKER"
              ? "🛑"
              : "📜";
      return `${icon} **${r.label}** — ${r.detail}`;
    })
    .join("\n\n"),
)}

${
  report.decision.blockers.length > 0
    ? section(
        "Bloquants à lever",
        bullets(report.decision.blockers.map((b) => `**${b.title}** — ${b.detail}`)),
      )
    : ""
}

${section(
  "Conditions de validation",
  `- La décision est valable sous réserve de la mise en œuvre du plan d'action ci-dessous.
- Toute évolution majeure (besoin, données, technologie, gouvernance) déclenche une révision.
- Validation requise par : Sponsor, DSI, DPO/Gouvernance.`,
)}

${section(
  "Plan d'action (synthèse)",
  asTable(
    ["#", "Action", "Pilote", "Horizon"],
    report.actionPlan.steps.map((s) => [
      String(s.order),
      `**${s.title}** — ${s.detail}`,
      USER_ROLE_LABELS[s.owner],
      labelHorizon(s.horizon),
    ]),
  ),
)}

${footer()}`;
}

function labelHorizon(h: "IMMEDIATE" | "SHORT" | "MEDIUM"): string {
  return h === "IMMEDIATE" ? "< 2 sem." : h === "SHORT" ? "< 2 mois" : "> 2 mois";
}

function axisLabel(id: string): string {
  const map: Record<string, string> = {
    needClarity: "Clarté du besoin",
    aiRelevance: "Pertinence IA",
    dataMaturity: "Maturité data",
    businessValue: "Valeur métier",
    riskControl: "Maîtrise des risques",
    feasibility: "Faisabilité technique",
  };
  return map[id] ?? id;
}
