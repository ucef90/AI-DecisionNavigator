// Note de cadrage IA — synthèse executive du projet.
//
// Reference: SPEC.MD §194 "note de cadrage IA". This deliverable is the
// "all-in-one" framing document that a sponsor or COPIL reads.

import type { EngineReport } from "@/lib/engines";
import type { ProjectSnapshot } from "@/lib/engines/types";
import { AI_APPROACH_LABELS, DECISION_LABELS, MATURITY_LABELS } from "@/types";
import {
  bullets,
  decisionBadge,
  field,
  footer,
  header,
  section,
} from "./helpers";

export function generateFramingNote(
  snap: ProjectSnapshot,
  report: EngineReport,
): string {
  const need = snap.businessNeed;
  const ai = snap.aiAnalysis;
  const da = snap.dataAssessment;
  const arch = snap.architecture;
  const recommended =
    report.decision.recommendedApproach ?? ai?.recommendedApproach ?? null;

  return `${header("Note de cadrage IA", snap.name)}
## Synthèse

${decisionBadge(report.decision.decision)} — score **${report.scoring.total}/18**
${report.decision.headline}

${field("Direction", snap.direction)}
${field("Sponsor", snap.sponsor)}
${field("Description", snap.description)}
${field("Maturité dérivée", MATURITY_LABELS[report.maturity.level])}
${field("Confiance moteur", report.scoring.confidence.toLowerCase())}
${field("Approche pressentie", recommended ? AI_APPROACH_LABELS[recommended] : null)}

${section(
  "1. Besoin métier",
  need
    ? `**Demande initiale :**

${(need.initialRequest ?? "—").trim()}

**Besoin reformulé :**

${(need.reformulatedNeed ?? "—").trim()}

${
  need.painPoints.length > 0
    ? `**Irritants identifiés :**\n\n${bullets(need.painPoints)}\n`
    : ""
}${
        need.expectedValue
          ? `**Valeur attendue :**\n\n${need.expectedValue}\n`
          : ""
      }${
        need.currentKpis.length > 0
          ? `\n**KPI actuels :**\n\n${bullets(need.currentKpis)}\n`
          : ""
      }${
        need.usersImpacted
          ? `\n**Utilisateurs concernés :** ${need.usersImpacted}\n`
          : ""
      }`
    : null,
)}

${section(
  "2. Analyse IA ou pas IA",
  ai
    ? `**Approche recommandée :** ${ai.recommendedApproach ? AI_APPROACH_LABELS[ai.recommendedApproach as keyof typeof AI_APPROACH_LABELS] : "—"}

**Approches envisageables :**

${bullets([
  ai.automationRelevant ? "Automatisation simple" : null,
  ai.ruleEngineRelevant ? "Moteur de règles" : null,
  ai.mlRelevant ? "Machine Learning" : null,
  ai.llmRelevant ? "LLM" : null,
  ai.ragRelevant ? "RAG" : null,
  ai.agentRelevant ? "Agent IA" : null,
  ai.hybridRelevant ? "Workflow hybride" : null,
  ai.classicRelevant ? "Solution classique" : null,
])}

${ai.justification ? `**Justification :**\n\n${ai.justification}` : ""}`
    : null,
)}

${section(
  "3. Analyse data",
  da
    ? `${
        da.dataSources.length > 0
          ? `**Sources identifiées :**\n\n${bullets(da.dataSources)}\n`
          : ""
      }${field("Sensibilité", da.sensitivity)}
${field("Données personnelles", da.personalData ? "Oui" : "Non")}
${field("Qualité", da.quality)}
${field("Accessibilité", da.availability)}
${field("Historique", da.history)}
${da.rgpdConstraints ? `\n**Contraintes RGPD :**\n\n${da.rgpdConstraints}` : ""}`
    : null,
)}

${section(
  "4. Architecture & workflow",
  arch
    ? `${
        arch.applications.length > 0
          ? `**Applications concernées :**\n\n${bullets(arch.applications)}\n`
          : ""
      }${
        arch.apis.length > 0 ? `**APIs :**\n\n${bullets(arch.apis)}\n` : ""
      }${
        arch.workflowCurrent
          ? `**Workflow actuel :**\n\n${arch.workflowCurrent}\n\n`
          : ""
      }${
        arch.workflowTarget
          ? `**Workflow cible :**\n\n${arch.workflowTarget}\n\n`
          : ""
      }${field("Validation humaine", arch.humanValidation ? "Oui" : "Non")}
${field("Traçabilité", arch.traceability)}
${field("Intégration SI", arch.siIntegration)}`
    : null,
)}

${section(
  "5. Scoring",
  `${report.scoring.reading}

${report.scoring.axes
  .map((a) => `**${axisLabel(a.id)}** : ${a.value}/3 — ${a.rationale}`)
  .join("\n\n")}

**Total :** ${report.scoring.total}/18`,
)}

${section(
  "6. Décision recommandée",
  `${decisionBadge(report.decision.decision)} — ${DECISION_LABELS[report.decision.decision]}

${report.decision.headline}

${
  report.decision.overridden
    ? `> Note : la décision a été abaissée depuis ${DECISION_LABELS[report.decision.decisionFromTotal]} par les règles métier (voir justification).`
    : ""
}

**Justification structurée :**

${report.decision.rationale
  .map((r) => `- **${r.label}** — ${r.detail}`)
  .join("\n")}

${
  report.decision.blockers.length > 0
    ? `\n**Bloquants à lever :**\n\n${bullets(report.decision.blockers.map((b) => `${b.title} — ${b.detail}`))}`
    : ""
}`,
)}

${section(
  "7. Plan d'action recommandé",
  report.actionPlan.steps
    .map(
      (s) =>
        `${s.order}. **${s.title}** — _${s.detail}_ \n   _Pilote : ${s.owner} · ${s.category} · ${s.horizon}_`,
    )
    .join("\n"),
)}
${footer()}`;
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
