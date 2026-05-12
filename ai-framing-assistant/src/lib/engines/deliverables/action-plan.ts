// Plan d'action — version livrable du plan généré par le moteur.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { USER_ROLE_LABELS } from "@/types";
import {
  asTable,
  field,
  footer,
  header,
  section,
} from "./helpers";

const CATEGORY_LABELS = {
  BUSINESS: "Métier",
  DATA: "Data",
  TECH: "Tech",
  GOVERNANCE: "Gouvernance",
  PILOT: "Pilotage",
} as const;

const HORIZON_LABELS = {
  IMMEDIATE: "< 2 semaines",
  SHORT: "< 2 mois",
  MEDIUM: "> 2 mois",
} as const;

export function generateActionPlan(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const steps = report.actionPlan.steps;

  return `${header("Plan d'action", snap.name)}
${field("Décision associée", report.actionPlan.decision)}
${field("Nombre d'actions", String(steps.length))}

${section(
  "Actions ordonnées",
  asTable(
    ["#", "Action", "Catégorie", "Horizon", "Pilote"],
    steps.map((s) => [
      String(s.order),
      `**${s.title}** — ${s.detail}`,
      CATEGORY_LABELS[s.category],
      HORIZON_LABELS[s.horizon],
      USER_ROLE_LABELS[s.owner],
    ]),
  ),
)}

${section(
  "Suivi suggéré",
  `- Revoir le plan en COPIL projet à chaque jalon.
- Marquer chaque action comme \`À faire\` / \`En cours\` / \`Faite\` lors des points hebdo.
- Tout glissement > 2 semaines déclenche une remontée sponsor.
- Toute modification de scope ou de gouvernance déclenche une révision du cadrage et un re-scoring.`,
)}
${footer()}`;
}
