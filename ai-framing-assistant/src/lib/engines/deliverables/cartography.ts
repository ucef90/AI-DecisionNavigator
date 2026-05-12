// Cartographie projet — version textuelle des 6 vues systémiques.
//
// Renders insight by layer so the deliverable can be diff'ed and reviewed
// without rendering the SVG/HTML cartography. Pairs with the live UI on
// /projects/[id]/cartography.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { asTable, bullets, field, footer, header, section } from "./helpers";

export function generateCartography(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const ins = report.insights;

  const business = `**Besoin reformulé :** ${(ins.business.reformulatedNeed ?? "—").trim()}

${ins.business.objectives.length > 0 ? `**Objectifs :**\n\n${bullets(ins.business.objectives)}\n` : ""}
${ins.business.expectedValue.length > 0 ? `**Valeur attendue :**\n\n${bullets(ins.business.expectedValue)}\n` : ""}
${ins.business.kpis.length > 0 ? `**KPI principaux :**\n\n${bullets(ins.business.kpis)}\n` : ""}
${ins.business.impactedUsers.length > 0 ? `**Utilisateurs impactés :** ${ins.business.impactedUsers.join(" · ")}` : ""}`;

  const workflow = `**Workflow actuel** (${ins.workflow.current.length} étapes) :

${ins.workflow.current.length > 0 ? bullets(ins.workflow.current.map((s, i) => `${i + 1}. ${s.label}`)) : "—"}

**Workflow cible** (${ins.workflow.target.length} étapes) :

${ins.workflow.target.length > 0 ? bullets(ins.workflow.target.map((s, i) => `${i + 1}. [${kindLabel(s.kind)}] ${s.label}`)) : "—"}`;

  const data = `${field("Sources identifiées", String(ins.data.sources.length))}
${field("Données personnelles", ins.data.personalData ? "Oui" : "Non")}
${field("Sensibilité", ins.data.sensitivity ?? "—")}
${field("Structurées / non structurées", `${ins.data.types.structured ? "oui" : "non"} / ${ins.data.types.unstructured ? "oui" : "non"}`)}
${field("Qualité", ins.data.quality)}
${field("Accessibilité", ins.data.availability)}

${ins.data.sources.length > 0 ? `**Sources :**\n\n${bullets(ins.data.sources.map((s) => s.label))}` : ""}

${ins.data.usages.length > 0 ? `**Usages :**\n\n${bullets(ins.data.usages)}` : ""}`;

  const actors = asTable(
    ["Acteur", "Description", "Responsabilités"],
    ins.actors.actors.map((a) => [a.label, a.description, a.responsibilities.join(" · ")]),
  );

  const tech = `**Approche pressentie :** ${ins.technology.recommendedApproach ?? "—"}

**Briques IA retenues :**

${bullets(ins.technology.aiBricks.filter((b) => b.active).map((b) => `${b.label}${b.detail ? ` — ${b.detail}` : ""}`))}

**Applications & APIs externes :**

${bullets(ins.technology.external.map((b) => b.label))}

**Sécurité & gouvernance :** ${ins.technology.governance.map((g) => g.label).join(" · ")}`;

  const risk = `${field("Niveau global", ins.risk.overall ?? "—")}
${field("Décision liée", ins.risk.decision)}

${ins.risk.categories
  .map(
    (cat) => `**${cat.title}**

${cat.items
  .map((it) => `- ${it.label} : ${it.score == null ? "—" : `${it.score}/5`}`)
  .join("\n")}`,
  )
  .join("\n\n")}

${ins.risk.mitigations.length > 0 ? `\n**Stratégies de maîtrise :**\n\n${bullets(ins.risk.mitigations)}` : ""}`;

  return `${header("Cartographie projet", snap.name)}
Six vues systémiques produites par le moteur de cartographie.

${section("1. Cartographie métier", business)}

${section("2. Cartographie workflow", workflow)}

${section("3. Cartographie des données", data)}

${section("4. Cartographie des acteurs", actors)}

${section("5. Cartographie technologique", tech)}

${section("6. Cartographie des risques", risk)}

${footer()}`;
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "AI":
      return "IA";
    case "HUMAN_VALIDATION":
      return "Validation humaine";
    case "AUTO":
      return "Auto.";
    default:
      return "Manuel";
  }
}
