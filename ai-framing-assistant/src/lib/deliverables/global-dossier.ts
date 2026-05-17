// Moteur de livrable markdown — DOSSIER STRATÉGIQUE FINAL IA.
//
// Consolide les 7 ateliers en un seul markdown structuré, prêt à
// présenter en COPIL / sponsor / direction. Sortie ~10-15 pages
// selon le remplissage.
//
// Structure :
//   1. Synthèse exécutive (1 page COPIL)
//   2. Atelier 1 — Compréhension du besoin
//   3. Atelier 2 — IA vs automatisation
//   4. Atelier 3 — Cadrage IA
//   5. Atelier 4 — Scoring et maturité
//   6. Atelier 5 — Cartographie IA
//   7. Atelier 6 — Gouvernance, risques, conformité
//   8. Atelier 7 — Architecture cible, roadmap, décision finale
//   9. Annexes (KPI, RACI, etc.)

import type { Atelier7Snapshot } from "@/lib/engines/atelier7";
import {
  computeFinalDecision,
  computeGlobalProjectScore,
  computeIndustrializationReadiness,
  computePriorityMatrix,
} from "@/lib/engines/atelier7";
import {
  aggregateScore,
  computeAutoScorecard,
} from "@/lib/engines/atelier4";
import {
  aggregateGovernanceScore,
  computeComplianceByFramework,
  computeDimensionScores,
  computeSecurityCoverage,
  reasonGovernance,
} from "@/lib/engines/atelier6";
import { DECISION_LABELS } from "@/types";
import {
  COMPLIANCE_FRAMEWORK_LABELS,
  type ComplianceFramework,
  type RaciType,
} from "@/types/atelier6";
import {
  OVERALL_LEVEL_LABELS,
  SCORECARD_AXIS_LABELS,
} from "@/types/atelier4";
import {
  INDUSTRIALIZATION_STAGE_LABELS,
  ROADMAP_PHASE_LABELS,
  type IndustrializationStage,
  type RoadmapPhase,
} from "@/types/atelier7";

function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function md_list(items: (string | null | undefined)[]): string {
  const clean = items.filter((i): i is string => Boolean(i?.trim()));
  if (clean.length === 0) return "_(aucun élément)_";
  return clean.map((i) => `- ${i}`).join("\n");
}

function md_section(title: string, body: string): string {
  return `## ${title}\n\n${body}\n`;
}

function md_block(title: string, body: string | null | undefined): string {
  if (!body?.trim()) return `**${title}**\n\n_(non renseigné)_\n`;
  return `**${title}**\n\n${body.trim()}\n`;
}

export function generateGlobalDossier(snap: Atelier7Snapshot): string {
  const a4 = snap.a4;
  const a6 = snap.a6;
  const today = new Date().toISOString().slice(0, 10);

  const globalScore = computeGlobalProjectScore(snap);
  const finalDecision = computeFinalDecision(snap);
  const readiness = computeIndustrializationReadiness(snap);
  const priorityItems = computePriorityMatrix(snap);
  const a4Results = computeAutoScorecard(a4);
  const a4Agg = aggregateScore(a4Results);
  const a6Dims = computeDimensionScores(a6);
  const a6Agg = aggregateGovernanceScore(a6Dims);
  const a6Reasoning = reasonGovernance(a6, a6Dims);
  const compliance = computeComplianceByFramework(a6);
  const security = computeSecurityCoverage(a6);

  const sections: string[] = [];

  // -------- En-tête + synthèse exécutive --------
  sections.push(
    `# Dossier stratégique IA — ${snap.projectName}

_Dossier consolidant les 7 ateliers de cadrage IA._
_Généré le ${today}._

---

## Synthèse exécutive

**Score global projet : ${globalScore.overall}/100** _(${OVERALL_LEVEL_LABELS[a4Agg.overallLevel]})_

| Dimension | Score |
|---|---|
| Scoring (atelier 4) | ${globalScore.scoringScore}/100 |
| Gouvernance (atelier 6) | ${globalScore.governanceScore}/100 |
| Vision stratégique (atelier 7) | ${globalScore.visionScore}/100 |
| Readiness industrialisation | ${globalScore.readinessScore}/100 |

**Décision recommandée : ${DECISION_LABELS[finalDecision.decision]}**

${finalDecision.rationale}

${finalDecision.sponsorReadyToSign ? "**✓ Conditions réunies pour validation sponsor.**" : "**⚠ Conditions non encore réunies pour validation sponsor.**"}

### Forces du projet
${md_list(finalDecision.strongPoints)}

### Points de vigilance
${md_list(finalDecision.weakPoints)}

### Risques principaux
${md_list(finalDecision.mainRisks)}
`,
  );

  // -------- Atelier 1 — Besoin métier --------
  const bn = a4.businessNeed;
  const a1q = a4.qualification;
  sections.push(
    md_section(
      "Atelier 1 — Compréhension du besoin métier",
      `### Qualification du projet

- **Direction** : ${a1q?.directionConcerned ?? "—"}
- **Sponsor métier** : ${a1q?.businessOwner ?? "—"}
- **Déclencheur** : ${a1q?.triggerEvent ?? "—"}
- **Pourquoi prioritaire** : ${a1q?.priorityReason ?? "—"}

### Reformulation du besoin

${md_block("Demande initiale", bn?.initialRequest)}
${md_block("Besoin reformulé (sans techno)", bn?.reformulatedNeed)}
${a4.businessNeed?.solutionBiasDetected ? `> ⚠ Formulation orientée solution détectée. ${a4.businessNeed.solutionBiasNotes ?? ""}\n\n` : ""}
### Acteurs et utilisateurs

${a4.actors.length === 0 ? "_(aucun acteur cartographié)_" : a4.actors.map((a) => `- **${a.name}** (${a.category})${a.volume ? ` — ${a.volume}` : ""}${a.currentPain ? ` · douleur : ${a.currentPain}` : ""}`).join("\n")}

### Workflow AS-IS (${a4.processSteps.length} étape${a4.processSteps.length > 1 ? "s" : ""})

${a4.processSteps.length === 0 ? "_(workflow non cartographié)_" : a4.processSteps.map((s) => `${s.order}. **${s.name}** — ${s.actor ?? "—"} (${s.mode})`).join("\n")}

### Irritants identifiés (${a4.irritants.length})

${md_list(a4.irritants.map((i) => `**[${i.severity}]** ${i.title}${i.estimatedTimeWastedMinPerDay ? ` — ${i.estimatedTimeWastedMinPerDay} min/jour perdus` : ""}`))}

### Impacts opérationnels

${md_list(a4.impacts.map((i) => `**${i.axis}** _(${i.severity})_ — ${i.description}`))}

### Objectifs métier et KPI baseline

${md_list(a4.objectives.map((o) => `**${o.title}** (priorité ${o.priority})${o.targetKpiId ? "" : ""}`))}

${a4.kpis.length === 0 ? "" : `\n**KPI mesurés** :\n${md_list(a4.kpis.map((k) => `${k.name} : ${k.currentValue ?? "—"} ${k.unit ?? ""} → cible ${k.targetValue ?? "—"} (${k.measureStatus})`))}\n`}

### Périmètre

${md_block("In scope", safeJSON<string[]>(a4.scope?.inScope, []).join(", "))}
${md_block("Hors scope", safeJSON<string[]>(a4.scope?.outOfScope, []).join(", "))}
${a4.scope?.scopeValidatedBy ? `_Validé par : ${a4.scope.scopeValidatedBy}_\n` : ""}

### Hypothèses et zones floues

**Hypothèses** :
${md_list(a4.assumptions.map((a) => `${a.statement} _[${a.assumptionType}, risque si fausse : ${a.riskIfWrong}]_`))}

**Zones floues** :
${md_list(a4.uncertainties.map((u) => `${u.topic} : ${u.question} _[${u.severity}]_`))}
`,
    ),
  );

  // -------- Atelier 2 — IA vs automatisation --------
  sections.push(
    md_section(
      "Atelier 2 — IA ou automatisation ?",
      `### Matrice de qualification (${a4.taskQualifications.length} tâche${a4.taskQualifications.length > 1 ? "s" : ""})

| Tâche | Nature | Verdict | Complexité |
|---|---|---|---|
${
  a4.taskQualifications.length === 0
    ? "| _(aucune tâche)_ | | | |"
    : a4.taskQualifications
        .map(
          (t) =>
            `| ${t.taskName} | ${t.nature} | **${t.verdict}** | ${t.complexity}/5 |`,
        )
        .join("\n")
}

### Profil pressenti

${a4.atelier2Synthesis?.recommendedProfile ? `**${a4.atelier2Synthesis.recommendedProfile}**` : "_(non déterminé)_"}

${md_block("Architecture cible (texte)", a4.atelier2Synthesis?.recommendedArchitecture)}

### Complexités

${
  a4.complexity
    ? `- Workflow : ${a4.complexity.workflowComplexity ?? "—"}/5\n- Documentaire : ${a4.complexity.documentComplexity ?? "—"}/5\n- Décisionnelle : ${a4.complexity.decisionComplexity ?? "—"}/5\n- Gouvernance : ${a4.complexity.governanceComplexity ?? "—"}/5`
    : "_(non évalué)_"
}

### Validations humaines (${a6.humanValidations.length})

${md_list(a6.humanValidations.map((v) => `**${v.taskName}** _(${v.reasonType}, ${v.validationMode})_ — ${v.reason}`))}

### Dépendances SI

${md_list(a4.dependencies.map((d) => `**${d.name}** _(${d.dependencyType}, ${d.status})_${d.blocking ? " ⚠ bloquante" : ""}`))}
`,
    ),
  );

  // -------- Atelier 3 — Cadrage IA --------
  const reg = a4.regulatoryAnalysis;
  const da = a4.documentAnalysis;
  sections.push(
    md_section(
      "Atelier 3 — Questionnaire de cadrage IA",
      `### Analyse documentaire

${
  da
    ? `- Documents existants : ${da.documentsExist ? "oui" : "non"}\n- Structure : ${da.structureLevel ?? "—"}\n- Exploitabilité : ${da.exploitability ?? "—"}\n- Complexité : ${da.complexityLevel ?? "—"}\n- OCR nécessaire : ${da.ocrNeeded ? "oui" : "non"} · NLP : ${da.nlpNeeded ? "oui" : "non"} · RAG : ${da.ragNeeded ? "oui" : "non"}`
    : "_(analyse documentaire à compléter)_"
}

### Analyse réglementaire

${
  reg
    ? `- RGPD applicable : ${reg.rgpdApplicable ? "oui" : "non"}\n- Données sensibles : ${reg.sensitiveDataConcerned ? "oui" : "non"}\n- DPO consulté : ${reg.dpoConsulted ? "oui" : "non"}\n- EU AI Act tier : **${reg.euAiActTier}**\n- Audit requis : ${reg.auditRequired ? "oui" : "non"}`
    : "_(analyse réglementaire à compléter)_"
}

### Maturité projet auto-évaluée

${
  a4.maturity
    ? `- Clarté besoin : ${a4.maturity.needClarity ?? "—"}/5\n- Connaissance workflow : ${a4.maturity.workflowKnowledge ?? "—"}/5\n- Maturité data : ${a4.maturity.dataMaturity ?? "—"}/5\n- Gouvernance : ${a4.maturity.governanceMaturity ?? "—"}/5\n- Alignement stakeholders : ${a4.maturity.stakeholderAlignment ?? "—"}/5\n- Réalisme : ${a4.maturity.realismLevel ?? "—"}/5`
    : "_(non évalué)_"
}

### Faisabilité globale

${
  a4.feasibility
    ? `- Technique : ${a4.feasibility.technicallyFeasible ?? "—"}/5\n- Organisationnelle : ${a4.feasibility.organizationallyFeasible ?? "—"}/5\n- Réglementaire : ${a4.feasibility.regulatorilyFeasible ?? "—"}/5\n- Ressources : ${a4.feasibility.resourcesAvailable ?? "—"}/5\n- Données : ${a4.feasibility.dataAvailable ?? "—"}/5\n- **Verdict global** : ${a4.feasibility.overallFeasibility ?? "—"}`
    : "_(non évalué)_"
}
`,
    ),
  );

  // -------- Atelier 4 — Scoring --------
  sections.push(
    md_section(
      "Atelier 4 — Scoring et maturité projet IA",
      `**Score global : ${a4Agg.overallScore}/100 — ${OVERALL_LEVEL_LABELS[a4Agg.overallLevel]}**

### Détail des 11 axes

| Axe | Score | Justification auto |
|---|---|---|
${a4Results
  .map(
    (r) =>
      `| ${SCORECARD_AXIS_LABELS[r.axis]} | ${r.effective}/5${r.isOverride ? " _(manuel)_" : ""} | ${r.autoRationale.replace(/\|/g, " ")} |`,
  )
  .join("\n")}

### Décision moteur

**${DECISION_LABELS[finalDecision.decision]}** — ${finalDecision.rationale}

${md_block("Synthèse manuelle (rationnel)", a4.a4Synthesis?.decisionRationale)}
`,
    ),
  );

  // -------- Atelier 5 — Cartographie --------
  sections.push(
    md_section(
      "Atelier 5 — Cartographie IA complète",
      `_Les 6 cartographies (métier, workflow, data, technologie, risques, gouvernance) sont générées dynamiquement par le moteur à partir des données collectées. Voir l'application pour la version interactive._

${snap.a4.taskQualifications.length > 0 ? `**Composants IA identifiés** : ${snap.a4.taskQualifications.filter((t) => t.verdict === "AI" || t.verdict === "HYBRID").length} tâches IA/hybride.` : ""}
`,
    ),
  );

  // -------- Atelier 6 — Gouvernance --------
  sections.push(
    md_section(
      "Atelier 6 — Gouvernance, risques et conformité IA",
      `**Score gouvernance : ${a6Agg.overall}/100**

${a6Reasoning.overallStatement}

### 6 dimensions

| Dimension | Score | Détail |
|---|---|---|
${a6Dims.map((d) => `| ${d.label} | ${d.score}/100 | ${d.rationale.replace(/\|/g, " ")} |`).join("\n")}

### Matrice RACI

| Acteur | Scope | R/A/C/I |
|---|---|---|
${
  a6.governanceRoles.length === 0
    ? "| _(aucune entrée RACI)_ | | |"
    : a6.governanceRoles.map((r) => `| ${r.actorRole} | ${r.scope} | **${r.responsibilityType as RaciType}** |`).join("\n")
}

### Conformité par framework

${
  compliance.length === 0
    ? "_(aucun item de conformité saisi)_"
    : compliance
        .map(
          (c) =>
            `- **${COMPLIANCE_FRAMEWORK_LABELS[c.framework as ComplianceFramework]}** : ${c.score}/100 (${c.compliant} conformes / ${c.total} total)`,
        )
        .join("\n")
}

### Couverture sécurité (8 domaines)

${security
  .map(
    (s) =>
      `- **${s.domain}** : ${s.status} (${s.active}/${s.controls} contrôles actifs)`,
  )
  .join("\n")}

### Procédures incidents (${a6.incidentProcedures.length})

${md_list(a6.incidentProcedures.map((p) => `**${p.incidentType}** _(${p.severity})_ — escalade : ${p.escalationPath ?? "—"}`))}

### KPI monitoring (${a6.monitoringKpis.length})

${md_list(a6.monitoringKpis.map((k) => `**${k.name}** (${k.category}) — cible ${k.targetValue ?? "—"} ${k.unit ?? ""} · fréquence ${k.frequency}`))}

### Actions prioritaires gouvernance

${md_list(a6Reasoning.priorityActions)}
`,
    ),
  );

  // -------- Atelier 7 — Stratégie + décision --------
  const v = snap.vision;
  sections.push(
    md_section(
      "Atelier 7 — Architecture cible, roadmap et décision finale",
      `### Vision stratégique

${md_block("Énoncé", v?.visionStatement)}
${md_block("Valeur business", v?.businessValue)}

**Objectifs stratégiques** :
${md_list(safeJSON<string[]>(v?.strategicObjectives, []))}

**Critères de succès** :
${md_list(safeJSON<string[]>(v?.successCriteria, []))}

### Matrice de priorisation (${priorityItems.length} items)

| Item | Quadrant | Impact | Complexité | Phase |
|---|---|---|---|---|
${
  priorityItems.length === 0
    ? "| _(roadmap vide)_ | | | | |"
    : priorityItems.map((p) => `| ${p.title} | ${p.quadrant} | ${p.impact}/5 | ${p.complexity}/5 | ${ROADMAP_PHASE_LABELS[p.phase as RoadmapPhase]} |`).join("\n")
}

### Roadmap transformation

${
  snap.roadmapItems.length === 0
    ? "_(roadmap non construite)_"
    : Object.entries(
        snap.roadmapItems.reduce(
          (acc, item) => {
            const p = item.phase as RoadmapPhase;
            if (!acc[p]) acc[p] = [];
            acc[p].push(item);
            return acc;
          },
          {} as Record<string, typeof snap.roadmapItems>,
        ),
      )
        .map(
          ([phase, items]) =>
            `**${ROADMAP_PHASE_LABELS[phase as RoadmapPhase]}**\n${items.map((i) => `- ${i.title} — ${i.effortMonths ?? 1} mois${i.ownerRole ? ` _[${i.ownerRole}]_` : ""}`).join("\n")}`,
        )
        .join("\n\n")
}

### Plan industrialisation

${
  snap.industrializationSteps.length === 0
    ? "_(plan industrialisation non défini)_"
    : snap.industrializationSteps
        .map(
          (s) =>
            `- **${INDUSTRIALIZATION_STAGE_LABELS[s.stage as IndustrializationStage]}** : ${s.name} _(${s.status}, readiness ${s.readinessLevel}/5)_${s.exitCriteria ? `\n  - Critères de sortie : ${s.exitCriteria}` : ""}`,
        )
        .join("\n")
}

### Readiness industrialisation (calcul moteur)

${readiness
  .map(
    (r) =>
      `- **${INDUSTRIALIZATION_STAGE_LABELS[r.stage as IndustrializationStage]}** : ${r.ready ? "✓ Prêt" : "⚠ À sécuriser"}${r.why ? ` _(${r.why})_` : ""}`,
  )
  .join("\n")}

### Décision finale IA

**${DECISION_LABELS[finalDecision.decision]}**

${finalDecision.rationale}

${md_block("Stratégie d'industrialisation", snap.synthesis?.industrializationStrategy)}
${md_block("Stratégie de gouvernance", snap.synthesis?.governanceStrategy)}
${md_block("Stratégie de pilotage", snap.synthesis?.pilotageStrategy)}

### Validation sponsor

- **Sponsor** : ${snap.synthesis?.sponsorName ?? "_(non nommé)_"}
- **Décision** : ${snap.synthesis?.sponsorDecision ?? "_(non décidée)_"}
- **Date** : ${snap.synthesis?.sponsorDecisionDate ? new Date(snap.synthesis.sponsorDecisionDate).toISOString().slice(0, 10) : "—"}
`,
    ),
  );

  // -------- Footer --------
  sections.push(
    `---

## Annexes

- Dossier généré par l'application AI Decision Navigator.
- Date d'export : ${today}.
- Projet : ${snap.projectName} (id : ${snap.projectId}).

_Tous les scores et recommandations sont calculés automatiquement par les moteurs de raisonnement de l'application à partir des données collectées dans les 7 ateliers._
`,
  );

  return sections.join("\n---\n\n");
}
