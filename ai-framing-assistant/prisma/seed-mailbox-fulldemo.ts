// Vitrine bout-en-bout du framework — projet "Automatisation des
// boîtes mails" (demo-mailbox) rempli pour les 7 ateliers.
//
// À lancer APRÈS `npm run seed` (qui crée le projet + ses données
// legacy : BusinessNeed, AIAnalysis, DataAssessment, etc.).
// Ce script ajoute les modèles spécifiques ateliers 1 → 7.
//
// Idempotent : tous les modèles enfants sont d'abord deleteMany,
// puis re-créés. Le projet lui-même n'est pas touché.

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const PROJECT_ID = "demo-mailbox";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filePath });
const prisma = new PrismaClient({ adapter, log: ["error"] });

async function clean() {
  // Atelier 1
  await prisma.businessQualification.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.projectScope.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.businessActor.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.processStep.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.irritant.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.businessImpact.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.businessObjective.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.kpiBaseline.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.projectAssumption.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.uncertainty.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.businessConstraint.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.improvementOpportunity.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.userVerbatim.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.workshopReport.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier1Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 2
  await prisma.taskQualification.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.complexityAssessment.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.intelligenceNeed.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.technologyCandidate.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.humanValidationPoint.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.processException.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.technicalDependency.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.techRecommendation.deleteMany({ where: { projectId: PROJECT_ID } });
  // L'ordre : edges avant nodes (FK)
  await prisma.targetArchitectureEdge.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.targetArchitectureNode.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier2Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier2Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 3
  await prisma.documentAnalysis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.regulatoryAnalysis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.maturityAssessment.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.feasibilityAssessment.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier3Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier3Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 4
  await prisma.projectScorecard.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.priorityAssessment.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier4Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier4Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 5
  await prisma.cartographyAnnotation.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier5Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier5Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 6
  await prisma.governanceRole.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.securityControl.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.complianceItem.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.monitoringKpi.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.incidentProcedure.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier6Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier6Gate.deleteMany({ where: { projectId: PROJECT_ID } });
  // Atelier 7
  await prisma.strategicVision.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.roadmapItem.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.industrializationStep.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier7Synthesis.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.atelier7Gate.deleteMany({ where: { projectId: PROJECT_ID } });
}

// =============================================================
// ATELIER 1 — Compréhension du besoin métier
// =============================================================
async function seedAtelier1() {
  const projectId = PROJECT_ID;

  await prisma.businessQualification.create({
    data: {
      projectId,
      directionConcerned: "Direction de la Relation Citoyenne",
      businessOwner: "Mme Dupont, Responsable du pôle accueil",
      workshopDate: new Date("2026-04-12"),
      workshopParticipants: JSON.stringify([
        { name: "Mme Dupont", role: "Responsable accueil (sponsor)" },
        { name: "M. Martin", role: "Manager équipe traitement courriers" },
        { name: "Mme Bernard", role: "Agent senior" },
        { name: "M. Petit", role: "Chef de projet IA" },
        { name: "Mme Roux", role: "DSI — architecte SI" },
        { name: "M. Leroy", role: "DPO" },
      ]),
      triggerEvent:
        "Augmentation de 35% du volume d'emails en 18 mois + plainte CNIL sur délais de réponse sur droits d'accès.",
      priorityReason:
        "Objectif politique 2026 : délai de réponse usagers < 5 jours. Budget transformation alloué Q1.",
      regulatoryPressure: true,
      operationalOverload: true,
      serviceDegradation: true,
      strategicAlignment:
        "Plan de transformation numérique 2025-2027, axe 'amélioration de l'expérience usager'.",
      driverVolumeIncrease: true,
      driverResourceShortage: true,
      driverFrequentErrors: false,
      driverPoorUserExperience: true,
      driverManualWorkflow: true,
      driverLowTraceability: true,
      driverHighDelays: true,
    },
  });

  await prisma.projectScope.create({
    data: {
      projectId,
      inScope: JSON.stringify([
        "Emails entrants de la boîte générique 'accueil@'",
        "Classification automatique et routage vers les services",
        "Génération de premières réponses pour les demandes simples",
        "Extraction d'informations clés des pièces jointes courantes (PDF, DOCX)",
      ]),
      outOfScope: JSON.stringify([
        "Boîtes mails personnelles des agents",
        "Réseaux sociaux et formulaires web (autre projet en cours)",
        "Décisions juridiques ou disciplinaires (toujours humaines)",
        "Demandes hors compétence du service",
      ]),
      assumptionsForScope:
        "Le périmètre suppose que la boîte 'accueil@' centralise bien 80% des demandes (à valider).",
      scopeValidatedBy: "Sponsor — Mme Dupont — 12/04/2026",
      scopeValidatedAt: new Date("2026-04-12"),
    },
  });

  // Acteurs
  const actorsData = [
    { name: "Usager / demandeur", category: "USER", role: "Citoyen qui envoie un email", volume: 12000, involvement: "PRIMARY", currentPain: "Attend une réponse parfois > 3 semaines", expectedGain: "Réponse rapide et précise" },
    { name: "Agent de traitement", category: "AGENT", role: "Lit, classe, traite, répond", volume: 18, involvement: "PRIMARY", currentPain: "Lecture manuelle chronophage, ré-saisies, recherche d'infos", expectedGain: "Tri auto + suggestion de réponse" },
    { name: "Agent senior", category: "AGENT", role: "Traite les cas complexes, supervise", volume: 4, involvement: "PRIMARY", currentPain: "Dérangé pour des cas qui pourraient être automatisés", expectedGain: "Focus sur cas à vraie valeur ajoutée" },
    { name: "Manager équipe", category: "MANAGER", role: "Pilote le service, traite les escalades", volume: 1, involvement: "SECONDARY", currentPain: "Pas de visibilité temps-réel sur la charge", expectedGain: "Dashboard pilotage" },
    { name: "Sponsor — Responsable accueil", category: "SPONSOR", role: "Pilote stratégique", volume: 1, involvement: "CONSULTED", currentPain: "Tableau de bord pauvre", expectedGain: "KPI service exposés à la direction" },
    { name: "DSI — Architecte SI", category: "IT", role: "Garantit intégration et sécurité", volume: 1, involvement: "CONSULTED" },
    { name: "DPO", category: "GOVERNANCE", role: "Conformité RGPD + EU AI Act", volume: 1, involvement: "CONSULTED" },
    { name: "RSSI", category: "GOVERNANCE", role: "Sécurité accès et données", volume: 1, involvement: "INFORMED" },
  ];
  for (let i = 0; i < actorsData.length; i++) {
    const a = actorsData[i];
    await prisma.businessActor.create({
      data: { projectId, ...a, position: i },
    });
  }

  // Verbatims
  await prisma.userVerbatim.createMany({
    data: [
      { projectId, quote: "J'ai envoyé ma demande il y a 3 semaines, toujours rien.", speakerRole: "Usager", source: "COMPLAINT", sentiment: "NEGATIVE", theme: "délai" },
      { projectId, quote: "On passe 40% de notre journée à lire des emails et chercher des pièces qui ne sont pas là.", speakerRole: "Agent de traitement", source: "INTERVIEW", sentiment: "NEGATIVE", theme: "charge" },
      { projectId, quote: "Les demandes simples noient les cas vraiment complexes — on perd en qualité sur les dossiers difficiles.", speakerRole: "Agent senior", source: "INTERVIEW", sentiment: "NEGATIVE", theme: "priorisation" },
      { projectId, quote: "Si je pouvais avoir un tri automatique avec un brouillon de réponse à valider, je gagnerais des heures par semaine.", speakerRole: "Agent de traitement", source: "INTERVIEW", sentiment: "NEUTRAL", theme: "attente" },
    ],
  });

  // Workflow AS-IS
  const stepsData = [
    { order: 1, name: "Réception email (boîte générique)", actor: "Système", mode: "AUTOMATED", stepType: "INPUT", durationMin: 0, tools: JSON.stringify(["Outlook"]) },
    { order: 2, name: "Lecture manuelle par agent", actor: "Agent de traitement", mode: "MANUAL", stepType: "TREATMENT", durationMin: 3, tools: JSON.stringify(["Outlook"]) },
    { order: 3, name: "Compréhension de la demande", actor: "Agent de traitement", mode: "MANUAL", stepType: "TREATMENT", durationMin: 2 },
    { order: 4, name: "Ouverture et analyse des pièces jointes", actor: "Agent de traitement", mode: "MANUAL", stepType: "TREATMENT", durationMin: 5, tools: JSON.stringify(["Adobe Reader", "Word"]) },
    { order: 5, name: "Recherche dans la GED / historique usager", actor: "Agent de traitement", mode: "MANUAL", stepType: "TREATMENT", durationMin: 8, tools: JSON.stringify(["GED", "CRM"]) },
    { order: 6, name: "Classification + routage vers le service", actor: "Agent de traitement", mode: "MANUAL", stepType: "DECISION", durationMin: 2 },
    { order: 7, name: "Rédaction de la réponse", actor: "Agent de traitement", mode: "MANUAL", stepType: "TREATMENT", durationMin: 12, tools: JSON.stringify(["Outlook", "Templates Word"]) },
    { order: 8, name: "Validation hiérarchique (cas sensibles)", actor: "Manager équipe", mode: "MANUAL", stepType: "VALIDATION", durationMin: 5 },
    { order: 9, name: "Envoi de la réponse à l'usager", actor: "Agent de traitement", mode: "MANUAL", stepType: "OUTPUT", durationMin: 1 },
    { order: 10, name: "Archivage email + réponse en GED", actor: "Agent de traitement", mode: "SEMI_AUTOMATED", stepType: "OUTPUT", durationMin: 2, tools: JSON.stringify(["GED"]) },
  ];
  for (const s of stepsData) {
    await prisma.processStep.create({ data: { projectId, ...s } });
  }

  // Irritants (fusion §4 + §15 du livrable)
  await prisma.irritant.createMany({
    data: [
      { projectId, title: "Lecture manuelle systématique de chaque email", category: "MANUAL_READ", impactedActor: "Agent de traitement", severity: "HIGH", frequency: "Chaque email", estimatedTimeWastedMinPerDay: 90 },
      { projectId, title: "Re-saisie des données d'email dans la GED", category: "DOUBLE_ENTRY", impactedActor: "Agent de traitement", severity: "HIGH", frequency: "Chaque dossier", estimatedTimeWastedMinPerDay: 45 },
      { projectId, title: "Recherche d'informations dispersées (GED + CRM + historique mail)", category: "DOC_SEARCH", impactedActor: "Agent de traitement", severity: "HIGH", frequency: "Multi-fois/jour", estimatedTimeWastedMinPerDay: 60 },
      { projectId, title: "Erreurs de routage entre services", category: "CLASSIFICATION_ERROR", impactedActor: "Manager équipe", severity: "MEDIUM", frequency: "~5%/jour" },
      { projectId, title: "Rédaction répétitive de réponses standards", category: "MANUAL_INPUT", impactedActor: "Agent de traitement", severity: "MEDIUM", frequency: "60% des cas", estimatedTimeWastedMinPerDay: 60 },
      { projectId, title: "Aucune visibilité temps réel sur la charge équipe", category: "LACK_OF_VISIBILITY", impactedActor: "Manager équipe", severity: "MEDIUM" },
      { projectId, title: "Pas de priorisation automatique (FIFO total)", category: "LACK_OF_PRIORITY", impactedActor: "Agent de traitement", severity: "HIGH" },
    ],
  });

  // Impacts opérationnels
  await prisma.businessImpact.createMany({
    data: [
      { projectId, axis: "DELAY", description: "Délai moyen de réponse de 18 jours, cible métier 5 jours.", severity: "CRITICAL", direction: "NEGATIVE", metric: "18 jours" },
      { projectId, axis: "AGENT", description: "Surcharge cognitive et turn-over (3 départs en 2025).", severity: "HIGH", direction: "NEGATIVE", metric: "16% turn-over" },
      { projectId, axis: "USER", description: "Plaintes en hausse de 22% sur 12 mois.", severity: "HIGH", direction: "NEGATIVE", metric: "+22%" },
      { projectId, axis: "REGULATORY", description: "Saisie CNIL sur droits d'accès non honorés dans les délais.", severity: "CRITICAL", direction: "NEGATIVE", metric: "1 saisie 2025" },
      { projectId, axis: "QUALITY", description: "12% de classification incorrecte (mauvais service destinataire).", severity: "MEDIUM", direction: "NEGATIVE", metric: "12% erreurs" },
      { projectId, axis: "SATISFACTION", description: "NPS service à -8.", severity: "HIGH", direction: "NEGATIVE", metric: "NPS -8" },
    ],
  });

  // Objectifs métier
  await prisma.businessObjective.createMany({
    data: [
      { projectId, title: "Réduire le délai moyen de réponse à < 5 jours", priority: 1, category: "TIME", description: "Cible direction 2026, communiquée à la CNIL." },
      { projectId, title: "Augmenter le taux de classification correcte à 95%", priority: 2, category: "QUALITY" },
      { projectId, title: "Libérer 30% du temps agent pour les cas complexes", priority: 2, category: "AUTOMATION" },
      { projectId, title: "Mettre en place un pilotage temps réel pour le manager", priority: 3, category: "PILOTAGE" },
      { projectId, title: "Améliorer la satisfaction usager (NPS > +20)", priority: 2, category: "EXPERIENCE" },
      { projectId, title: "Respecter strictement les délais RGPD d'accès aux données", priority: 1, category: "COMPLIANCE" },
    ],
  });

  // KPI baseline
  await prisma.kpiBaseline.createMany({
    data: [
      { projectId, name: "Délai moyen de réponse", unit: "jours", currentValue: "18", targetValue: "5", source: "Export Outlook 2025", measureStatus: "MEASURED" },
      { projectId, name: "Taux de classification correcte", unit: "%", currentValue: "88", targetValue: "95", source: "Audit interne", measureStatus: "MEASURED" },
      { projectId, name: "Volume traité par agent / jour", unit: "emails", currentValue: "42", targetValue: "60", source: "Stat équipe", measureStatus: "MEASURED" },
      { projectId, name: "Taux d'erreur de routage", unit: "%", currentValue: "12", targetValue: "3", source: "Audit interne", measureStatus: "MEASURED" },
      { projectId, name: "Satisfaction usager (NPS)", unit: "score", currentValue: "-8", targetValue: "+20", source: "Enquête annuelle", measureStatus: "MEASURED" },
      { projectId, name: "Taux de re-saisie GED", unit: "%", currentValue: "100", targetValue: "20", source: "Observation", measureStatus: "ESTIMATED" },
    ],
  });

  // Hypothèses
  await prisma.projectAssumption.createMany({
    data: [
      { projectId, statement: "80% des demandes entrent par la boîte 'accueil@'.", assumptionType: "BUSINESS", riskIfWrong: "HIGH", validationPlan: "Audit volumétrie multi-canaux sur 1 mois.", status: "UNVERIFIED" },
      { projectId, statement: "Les agents accepteront un assistant IA proposant des réponses.", assumptionType: "ORGANIZATIONAL", riskIfWrong: "MEDIUM", validationPlan: "Atelier avec 5 agents pilote.", status: "IN_PROGRESS" },
      { projectId, statement: "La GED expose une API pour récupérer l'historique usager.", assumptionType: "TECHNICAL", riskIfWrong: "HIGH", validationPlan: "Confirmation DSI.", status: "VALIDATED" },
      { projectId, statement: "Les emails contiennent assez de contexte pour être classifiés sans humain.", assumptionType: "DATA", riskIfWrong: "MEDIUM", validationPlan: "Analyse échantillon 500 emails.", status: "UNVERIFIED" },
      { projectId, statement: "L'EU AI Act considérera ce système comme 'risque limité', pas 'haut risque'.", assumptionType: "REGULATORY", riskIfWrong: "CRITICAL", validationPlan: "Avis DPO + juriste.", status: "IN_PROGRESS" },
    ],
  });

  // Zones floues
  await prisma.uncertainty.createMany({
    data: [
      { projectId, topic: "Volumétrie pic", question: "Quel est le pic réel d'emails (fin de mois, événements) ?", severity: "MEDIUM", ownerToAsk: "Manager équipe", status: "OPEN" },
      { projectId, topic: "Qualité OCR PJ scannées", question: "Quel taux d'OCR exploitable sur les pièces jointes scannées ?", severity: "HIGH", ownerToAsk: "DSI", status: "OPEN" },
      { projectId, topic: "Acceptation agents", question: "Comment les agents perçoivent-ils l'IA ? Risque de rejet ?", severity: "HIGH", ownerToAsk: "Manager équipe", status: "INVESTIGATING" },
    ],
  });

  // Contraintes
  await prisma.businessConstraint.createMany({
    data: [
      { projectId, constraintType: "REGULATORY", description: "RGPD : minimisation données, durée conservation 3 ans max.", impactLevel: "HIGH", source: "DPO" },
      { projectId, constraintType: "REGULATORY", description: "EU AI Act applicable dès Q3 2026.", impactLevel: "HIGH", source: "Juridique" },
      { projectId, constraintType: "BUDGET", description: "Budget 350K€ phase 1 (POC + MVP).", impactLevel: "MEDIUM", source: "Direction" },
      { projectId, constraintType: "TIMELINE", description: "Pilote opérationnel attendu pour Q4 2026.", impactLevel: "HIGH", source: "Sponsor" },
      { projectId, constraintType: "TECHNICAL", description: "Compatibilité avec la GED actuelle (pas de remplacement).", impactLevel: "MEDIUM", source: "DSI" },
    ],
  });

  // Opportunités
  await prisma.improvementOpportunity.createMany({
    data: [
      { projectId, title: "Classification automatique par IA", category: "AUTOMATION", estimatedGain: "30 min/agent/jour", effort: "MEDIUM", description: "Modèle de classification entraîné sur historique." },
      { projectId, title: "Génération brouillons réponses standards", category: "EFFICIENCY", estimatedGain: "1h/agent/jour", effort: "HIGH", description: "LLM avec validation humaine systématique." },
      { projectId, title: "Recherche documentaire RAG", category: "EFFICIENCY", estimatedGain: "45 min/agent/jour", effort: "HIGH", description: "Indexation GED + recherche augmentée." },
      { projectId, title: "Dashboard pilotage temps réel", category: "QUALITY", estimatedGain: "Pilotage continu", effort: "LOW", description: "BI sur volumétrie + délais." },
      { projectId, title: "Priorisation auto (urgence/sensibilité)", category: "QUALITY", estimatedGain: "Meilleure expérience usager", effort: "MEDIUM" },
    ],
  });

  // Compte-rendu atelier
  await prisma.workshopReport.create({
    data: {
      projectId,
      workshopDate: new Date("2026-04-12"),
      participants: JSON.stringify([
        { name: "Mme Dupont", role: "Sponsor" },
        { name: "M. Martin", role: "Manager" },
        { name: "Mme Bernard", role: "Agent senior" },
        { name: "M. Petit", role: "CDP IA" },
        { name: "Mme Roux", role: "DSI" },
        { name: "M. Leroy", role: "DPO" },
      ]),
      objectives: "Cadrer le projet IA emails — comprendre le vrai problème, périmètre, acteurs, irritants.",
      topicsCovered: JSON.stringify([
        "Contexte et déclencheurs",
        "Workflow AS-IS détaillé",
        "Irritants chiffrés",
        "Périmètre IN/OUT",
        "Hypothèses critiques",
      ]),
      keyFindings:
        "Le problème principal est l'absence de tri/priorisation + la dispersion des informations. L'IA peut aider sur classification + RAG + génération assistée, mais l'humain doit garder le contrôle sur les réponses.",
      identifiedRisks:
        "RGPD/EU AI Act, acceptation agents, qualité OCR PJ scannées.",
      decisionsMade:
        "Périmètre validé. POC sur 1 service pilote (3 mois). DPO consulté avant POC.",
      actionsToTake: JSON.stringify([
        { action: "Audit volumétrie réelle", owner: "Manager équipe", due: "2026-05-15" },
        { action: "Échantillonnage qualité emails (500)", owner: "CDP", due: "2026-05-30" },
        { action: "Note DPO sur EU AI Act tier", owner: "DPO", due: "2026-05-15" },
      ]),
      openTopics: "Qualité OCR PJ scannées · acceptation agents · pic volumétrie.",
    },
  });

  // Gate atelier 1 — passage validé
  await prisma.atelier1Gate.create({
    data: {
      projectId,
      reformulatedWithoutTech: true,
      atLeastThreeIrritants: true,
      workflowAsIsMapped: true,
      baselineKpiMeasured: true,
      scopeValidatedBySponsor: true,
      verdict: "READY",
      decidedAt: new Date("2026-04-15"),
      decidedBy: "Mme Dupont (sponsor)",
    },
  });

  console.log("  ✓ Atelier 1 — Compréhension besoin métier");
}

// =============================================================
// ATELIER 2 — IA vs automatisation
// =============================================================
async function seedAtelier2() {
  const projectId = PROJECT_ID;

  const tasks = [
    { taskName: "Réception email", nature: "RECEIVE", verdict: "AUTOMATION", complexity: 1, justification: "Trigger natif Outlook/Exchange — pas d'intelligence requise.", rulesKnownAndFixed: true, workflowStable: true },
    { taskName: "Lecture & compréhension email", nature: "READ", verdict: "AI", complexity: 4, justification: "Compréhension langage naturel, vocabulaire métier varié, formulations multiples.", needsTextUnderstanding: true, needsClassification: true },
    { taskName: "Classification de la demande", nature: "CLASSIFY", verdict: "AI", complexity: 3, justification: "Forte variabilité, règles non écrivables exhaustivement, apprentissage continu sur historique.", needsClassification: true, needsTextUnderstanding: true },
    { taskName: "Lecture des pièces jointes", nature: "EXTRACT", verdict: "AI", complexity: 4, justification: "OCR + NLP nécessaires (PDF, scans, formulaires).", needsDocumentReading: true },
    { taskName: "Recherche documentaire (GED, historique)", nature: "SEARCH", verdict: "AI", complexity: 3, justification: "RAG permet de retrouver l'info contextuellement, évite tâtonnement.", needsDocSearch: true },
    { taskName: "Routage vers service compétent", nature: "TRANSFER", verdict: "AUTOMATION", complexity: 2, justification: "Une fois la classification faite, le routage suit des règles fixes.", rulesKnownAndFixed: true, fewExceptions: true },
    { taskName: "Génération brouillon de réponse", nature: "GENERATE", verdict: "HYBRID", complexity: 4, justification: "LLM génère, agent valide systématiquement avant envoi (humain garde le dernier mot).", needsContentGeneration: true },
    { taskName: "Validation réponse sensible", nature: "VALIDATE", verdict: "HUMAN", complexity: 4, justification: "Sensibilité usager + responsabilité légale = humain obligatoire.", needsHumanInterpretation: true },
    { taskName: "Envoi réponse à l'usager", nature: "NOTIFY", verdict: "AUTOMATION", complexity: 1, justification: "Action déterministe post-validation.", rulesKnownAndFixed: true },
    { taskName: "Archivage en GED", nature: "ARCHIVE", verdict: "AUTOMATION", complexity: 2, justification: "Règles d'archivage connues, action API.", rulesKnownAndFixed: true, workflowStable: true },
  ];
  for (let i = 0; i < tasks.length; i++) {
    await prisma.taskQualification.create({
      data: { projectId, ...tasks[i], position: i, techCandidates: JSON.stringify([]) },
    });
  }

  await prisma.complexityAssessment.create({
    data: {
      projectId,
      workflowComplexity: 3,
      workflowJustification: "10 étapes, plusieurs branches (cas simples vs complexes vs sensibles).",
      documentComplexity: 4,
      documentJustification: "PJ très hétérogènes : PDF natifs, scans, formulaires Word, JPG.",
      decisionComplexity: 3,
      decisionJustification: "Mix décisions automatisables (routage) et arbitrages humains (réponses sensibles).",
      governanceComplexity: 4,
      governanceJustification: "Données personnelles, EU AI Act, multi-acteurs (RSSI, DPO, métier).",
    },
  });

  await prisma.intelligenceNeed.createMany({
    data: [
      { projectId, intelligenceType: "TEXT_UNDERSTANDING", necessity: "REQUIRED", justification: "Compréhension demande usager en langage naturel.", suggestedTech: JSON.stringify(["NLP", "LLM"]) },
      { projectId, intelligenceType: "CLASSIFICATION", necessity: "REQUIRED", justification: "Catégoriser la demande vers le bon service.", suggestedTech: JSON.stringify(["ML", "LLM"]) },
      { projectId, intelligenceType: "DOC_SEARCH", necessity: "REQUIRED", justification: "Retrouver l'historique usager + documents types.", suggestedTech: JSON.stringify(["RAG"]) },
      { projectId, intelligenceType: "CONTENT_GENERATION", necessity: "REQUIRED", justification: "Brouillons de réponses pour les cas standards.", suggestedTech: JSON.stringify(["LLM"]) },
      { projectId, intelligenceType: "EXTRACTION", necessity: "REQUIRED", justification: "Extraction d'infos clés des PJ.", suggestedTech: JSON.stringify(["OCR", "NLP"]) },
      { projectId, intelligenceType: "REASONING", necessity: "OPTIONAL", justification: "Raisonnement métier complexe → laissé à l'humain.", suggestedTech: JSON.stringify([]) },
    ],
  });

  await prisma.technologyCandidate.createMany({
    data: [
      { projectId, tech: "OCR", purpose: "Lecture des pièces jointes scannées", maturity: "MATURE", fitScore: 5, notes: "Azure Form Recognizer ou solution OSS." },
      { projectId, tech: "NLP", purpose: "Compréhension et extraction d'entités", maturity: "MATURE", fitScore: 4 },
      { projectId, tech: "ML", purpose: "Classification fine-tunée sur historique métier", maturity: "MATURE", fitScore: 5, notes: "Modèle texte multilingue." },
      { projectId, tech: "LLM", purpose: "Génération de brouillons de réponses", maturity: "MATURE", fitScore: 4, notes: "Mistral ou Azure OpenAI, prompt structuré." },
      { projectId, tech: "RAG", purpose: "Recherche augmentée sur GED + base de connaissance", maturity: "EMERGING", fitScore: 5 },
      { projectId, tech: "BPM", purpose: "Orchestration du workflow et supervision humaine", maturity: "MATURE", fitScore: 5, notes: "Camunda ou équivalent." },
      { projectId, tech: "API", purpose: "Intégration GED, CRM, Outlook", maturity: "MATURE", fitScore: 5 },
    ],
  });

  await prisma.humanValidationPoint.createMany({
    data: [
      { projectId, taskName: "Validation réponse sensible (juridique, médicale, plainte)", reason: "Impact usager élevé + responsabilité légale.", reasonType: "LEGAL_DECISION", validatorRole: "Manager / Superviseur métier", validationMode: "BLOCKING" },
      { projectId, taskName: "Validation réponse contenant données personnelles", reason: "Conformité RGPD — minimisation.", reasonType: "SENSITIVE_DATA", validatorRole: "Agent senior", validationMode: "BLOCKING" },
      { projectId, taskName: "Arbitrage cas ambigus (confiance IA < 70%)", reason: "L'IA ne sait pas trancher.", reasonType: "AMBIGUOUS_CASE", validatorRole: "Agent de traitement", validationMode: "BLOCKING" },
      { projectId, taskName: "Revue trimestrielle de la qualité IA", reason: "Détection dérives modèle.", reasonType: "OTHER", validatorRole: "Manager + DSI", validationMode: "ADVISORY" },
    ],
  });

  await prisma.processException.createMany({
    data: [
      { projectId, scenario: "Email vide ou contenant uniquement une PJ", frequency: "~3%", handlingProposal: "HUMAN", riskIfMishandled: "MEDIUM" },
      { projectId, scenario: "PJ illisible (OCR < seuil)", frequency: "~8%", handlingProposal: "HUMAN", riskIfMishandled: "MEDIUM" },
      { projectId, scenario: "Demande multi-sujets (plusieurs services concernés)", frequency: "~5%", handlingProposal: "HUMAN", riskIfMishandled: "HIGH" },
      { projectId, scenario: "Plainte / réclamation explicite", frequency: "~4%", handlingProposal: "HUMAN", riskIfMishandled: "HIGH" },
      { projectId, scenario: "Demande hors compétence (à rediriger)", frequency: "~2%", handlingProposal: "AUTOMATION", riskIfMishandled: "LOW" },
    ],
  });

  await prisma.technicalDependency.createMany({
    data: [
      { projectId, dependencyType: "SI_APP", name: "Outlook / Exchange", status: "AVAILABLE", blocking: false, notes: "Source principale des emails." },
      { projectId, dependencyType: "SI_APP", name: "GED interne (Alfresco)", status: "AVAILABLE", blocking: false },
      { projectId, dependencyType: "SI_APP", name: "CRM citoyens", status: "AVAILABLE", blocking: false },
      { projectId, dependencyType: "API", name: "API GED — recherche & lecture", status: "AVAILABLE", blocking: false },
      { projectId, dependencyType: "API", name: "API CRM — historique usager", status: "TO_NEGOTIATE", blocking: true, notes: "Dépendance critique : API à exposer par le métier." },
      { projectId, dependencyType: "DATA_SOURCE", name: "Historique 24 mois d'emails étiquetés", status: "TO_BUILD", blocking: false, notes: "Nécessaire pour entraîner le modèle de classification." },
      { projectId, dependencyType: "TEAM", name: "Équipe data science interne", status: "AVAILABLE", blocking: false },
    ],
  });

  await prisma.techRecommendation.createMany({
    data: [
      { projectId, layer: "ORCHESTRATION", recommendation: "BPM (Camunda) pour piloter le workflow + validations humaines", technologies: JSON.stringify(["BPM"]), priority: "CORE" },
      { projectId, layer: "INGESTION", recommendation: "Connecteur Outlook + OCR (Azure Form Recognizer)", technologies: JSON.stringify(["API", "OCR"]), priority: "CORE" },
      { projectId, layer: "INTELLIGENCE", recommendation: "ML pour classification + LLM (Mistral) pour génération + RAG pour recherche", technologies: JSON.stringify(["ML", "LLM", "RAG", "NLP"]), priority: "CORE" },
      { projectId, layer: "UI", recommendation: "Interface agent intégrée Outlook + cockpit manager", technologies: JSON.stringify([]), priority: "CORE" },
      { projectId, layer: "GOVERNANCE", recommendation: "Audit trail systématique + dashboard supervision IA", technologies: JSON.stringify([]), priority: "CORE" },
      { projectId, layer: "STORAGE", recommendation: "GED existante + base vectorielle pour RAG", technologies: JSON.stringify([]), priority: "RECOMMENDED" },
    ],
  });

  // Architecture cible : nodes + edges
  const nodeDefs = [
    { id: "in-email", nodeType: "INPUT", label: "Email entrant", posX: 0, posY: 0 },
    { id: "ocr", nodeType: "AI_COMPONENT", label: "OCR PJ", techCode: "OCR", posX: 1, posY: 0 },
    { id: "classify", nodeType: "AI_COMPONENT", label: "Classification ML", techCode: "ML", posX: 2, posY: 0 },
    { id: "search-rag", nodeType: "AI_COMPONENT", label: "Recherche RAG", techCode: "RAG", posX: 3, posY: 0 },
    { id: "generate-llm", nodeType: "AI_COMPONENT", label: "Génération LLM", techCode: "LLM", posX: 4, posY: 0 },
    { id: "human-validation", nodeType: "HUMAN_VALIDATION", label: "Validation humaine", posX: 5, posY: 0 },
    { id: "send-out", nodeType: "OUTPUT", label: "Envoi réponse", posX: 6, posY: 0 },
    { id: "archive", nodeType: "DATA_STORE", label: "Archivage GED", posX: 7, posY: 0 },
    { id: "bpm", nodeType: "PROCESS", label: "BPM orchestration", techCode: "BPM", posX: 3, posY: 1 },
  ];
  const createdNodes: Record<string, string> = {};
  for (const n of nodeDefs) {
    const created = await prisma.targetArchitectureNode.create({
      data: {
        projectId,
        nodeType: n.nodeType,
        label: n.label,
        techCode: n.techCode ?? null,
        posX: n.posX,
        posY: n.posY,
      },
    });
    createdNodes[n.id] = created.id;
  }
  const edges = [
    ["in-email", "ocr"],
    ["in-email", "classify"],
    ["ocr", "classify"],
    ["classify", "search-rag"],
    ["search-rag", "generate-llm"],
    ["generate-llm", "human-validation"],
    ["human-validation", "send-out"],
    ["send-out", "archive"],
    ["bpm", "classify"],
    ["bpm", "human-validation"],
  ];
  for (const [from, to] of edges) {
    await prisma.targetArchitectureEdge.create({
      data: { projectId, fromId: createdNodes[from], toId: createdNodes[to] },
    });
  }

  await prisma.atelier2Synthesis.create({
    data: {
      projectId,
      realNeed:
        "Assister les agents dans le tri, la classification, la recherche et la rédaction — sans remplacer l'arbitrage humain sur les cas sensibles.",
      complexityLevel: "HIGH",
      intelligenceSummary:
        "Compréhension texte + classification + RAG + génération assistée. Pas de raisonnement métier complexe.",
      governanceLevel: "HIGH",
      recommendedProfile: "AI_HYBRID",
      recommendedArchitecture:
        "Architecture hybride : BPM orchestre, OCR/NLP/ML/LLM/RAG assistent, humain valide systématiquement les réponses sensibles. Pas d'IA centric — l'humain garde le contrôle.",
      finalRecommendation:
        "POC IA hybride sur 1 service pilote (3 mois) avec validation humaine 100%. Si réussite, MVP avec règles métier affinées et seuils de confiance.",
      openPoints:
        "Qualité OCR PJ · acceptation agents · seuils de confiance à calibrer.",
    },
  });

  await prisma.atelier2Gate.create({
    data: {
      projectId,
      taskMatrixComplete: true,
      intelligenceNeedsScored: true,
      techCandidatesIdentified: true,
      humanValidationsMapped: true,
      targetArchSketched: true,
      synthesisWritten: true,
      verdict: "READY",
      decidedAt: new Date("2026-04-22"),
      decidedBy: "Mme Dupont (sponsor) + DSI",
    },
  });

  console.log("  ✓ Atelier 2 — IA vs automatisation");
}

// =============================================================
// ATELIER 3 — Cadrage IA
// =============================================================
async function seedAtelier3() {
  const projectId = PROJECT_ID;

  await prisma.documentAnalysis.create({
    data: {
      projectId,
      documentsExist: true,
      formats: JSON.stringify(["PDF", "DOCX", "JPG (scan)", "Email HTML"]),
      structureLevel: "MIXED",
      exploitability: "MODERATE",
      interpretationNeeded: true,
      estimatedVolume: "~3000 docs/mois (PJ comprises)",
      ocrNeeded: true,
      nlpNeeded: true,
      ragNeeded: true,
      complexityLevel: "HIGH",
      notes:
        "Mix de documents structurés (formulaires) et non structurés (lettres, scans). Qualité OCR variable — à valider en POC.",
    },
  });

  await prisma.regulatoryAnalysis.create({
    data: {
      projectId,
      rgpdApplicable: true,
      sensitiveDataConcerned: true,
      legalObligations: JSON.stringify([
        "RGPD — minimisation données",
        "RGPD — droit d'accès (réponse < 1 mois)",
        "RGPD — durée conservation 3 ans",
        "EU AI Act — système risque limité (transparence usagers)",
      ]),
      auditRequired: true,
      dpoConsulted: true,
      cnilConsultation: false,
      euAiActTier: "LIMITED",
      euAiActJustification:
        "Classification + génération assistée avec validation humaine systématique = risque limité, pas haut risque.",
      notes:
        "AIPD à formaliser avant POC. Transparence usager (mention 'réponse co-rédigée avec IA + agent') à mettre en place.",
    },
  });

  await prisma.maturityAssessment.create({
    data: {
      projectId,
      needClarity: 5,
      workflowKnowledge: 4,
      dataMaturity: 3,
      governanceMaturity: 4,
      stakeholderAlignment: 4,
      realismLevel: 4,
      selfAssessmentNotes:
        "Cadrage métier solide. Data : 3 car historique étiquetage à constituer. Stakeholders alignés grâce au sponsor engagé.",
    },
  });

  await prisma.feasibilityAssessment.create({
    data: {
      projectId,
      technicallyFeasible: 4,
      organizationallyFeasible: 4,
      regulatorilyFeasible: 4,
      resourcesAvailable: 4,
      dataAvailable: 3,
      overallFeasibility: "HIGH",
      blockingFactors: JSON.stringify([
        "API CRM à exposer (négociation en cours)",
        "Historique étiquetage à constituer",
      ]),
      enablers: JSON.stringify([
        "Sponsor engagé",
        "Équipe data science interne disponible",
        "GED déjà API-isée",
        "DPO consulté en amont",
      ]),
      notes:
        "Faisabilité globale élevée. Réserves sur data (3/5) — POC permettra de calibrer.",
    },
  });

  await prisma.atelier3Synthesis.create({
    data: {
      projectId,
      realNeed:
        "Assister les agents pour tenir l'objectif < 5 jours, sans dégrader la qualité ni mettre en cause la responsabilité humaine.",
      maturityLevel: "MEDIUM",
      complexityLevel: "HIGH",
      mainRisks: JSON.stringify([
        "Qualité OCR sur PJ scannées",
        "Acceptation utilisateur (agents)",
        "Dérive du modèle dans le temps",
      ]),
      mainConstraints: JSON.stringify([
        "EU AI Act + RGPD",
        "Budget 350K€ phase 1",
        "Pilote Q4 2026",
      ]),
      feasibilityGlobal: "HIGH",
      governanceLevel: "HIGH",
      finalRecommendation:
        "POC sur 1 service pilote (3 mois) avec supervision humaine 100% et KPI qualité IA quotidiens.",
      scoringPreparationNotes:
        "Tous les axes du scoring atelier 4 peuvent être renseignés. Points forts attendus : besoin clair, gouvernance, faisabilité. Points faibles : data maturity (3) et complexité documentaire.",
      cartographyPreparationNotes:
        "Architecture cible déjà esquissée atelier 2 — à rendre interactive atelier 5.",
    },
  });

  await prisma.atelier3Gate.create({
    data: {
      projectId,
      coverageReviewComplete: true,
      documentaryComplete: true,
      regulatoryComplete: true,
      maturityScored: true,
      feasibilityScored: true,
      synthesisWritten: true,
      scoringPreparationReady: true,
      verdict: "READY",
      decidedAt: new Date("2026-05-02"),
      decidedBy: "Comité projet IA",
    },
  });

  console.log("  ✓ Atelier 3 — Cadrage IA");
}

// =============================================================
// ATELIER 4 — Scoring et maturité
// =============================================================
async function seedAtelier4() {
  const projectId = PROJECT_ID;

  // Scorecard — overrides manuels avec justifications
  const autoFlags = {
    businessMaturity: true,
    dataQuality: false,
    workflowMaturity: true,
    governanceMaturity: true,
    riskControl: true,
    complexityScore: false,
    technicalFeasibility: true,
    organizationalFeasibility: true,
    regulatoryReadiness: true,
    siIndependence: false,
    aiReadiness: true,
  };
  const justifications: Record<string, string> = {
    dataQuality: "3/5 manuel : historique d'étiquetage à constituer, baseline incertaine.",
    complexityScore: "2/5 (complexité élevée) : 10 étapes, PJ hétérogènes, mix décisions humain/auto.",
    siIndependence: "2/5 : forte dépendance à API CRM en cours de négociation.",
  };

  await prisma.projectScorecard.create({
    data: {
      projectId,
      businessMaturity: 5,
      dataQuality: 3,
      workflowMaturity: 5,
      governanceMaturity: 4,
      riskControl: 4,
      complexityScore: 2,
      technicalFeasibility: 4,
      organizationalFeasibility: 4,
      regulatoryReadiness: 4,
      siIndependence: 2,
      aiReadiness: 4,
      autoFlags: JSON.stringify(autoFlags),
      justifications: JSON.stringify(justifications),
      overallScore: 74,
      overallLevel: "MATURE",
    },
  });

  await prisma.priorityAssessment.create({
    data: {
      projectId,
      level: "HIGH",
      justification:
        "Pression CNIL + objectif politique 2026 + ROI estimé à 1.5 ETP libéré. Conditions de réussite réunies (sponsor, équipe, faisabilité).",
      notes:
        "Plus prioritaire que le projet 'tchatbot internet' car impact métier mesurable et risques maîtrisés.",
    },
  });

  await prisma.atelier4Synthesis.create({
    data: {
      projectId,
      globalMaturity: "MATURE",
      globalFeasibility: "HIGH",
      globalRisk: "MEDIUM",
      recommendedDecision: "POC_IA",
      decisionRationale:
        "Score 74/100 (mature), faisabilité élevée, gouvernance solide. Les 2 axes faibles (data 3/5, complexité 2/5, SI 2/5) sont gérables via un POC ciblé. Profil atelier 2 = AI_HYBRID, parfait pour un POC avec validation humaine.",
      topRecommendations: JSON.stringify([
        "POC sur 1 service pilote (3 mois)",
        "Constitution d'un dataset d'étiquetage en parallèle",
        "Négocier ouverture API CRM en priorité",
        "Comité gouvernance IA mensuel",
        "Formation des agents pilotes avant déploiement",
      ]),
      strongPoints: JSON.stringify([
        "Maturité métier (5/5)",
        "Workflow cartographié (5/5)",
        "Faisabilité technique (4/5)",
        "Faisabilité organisationnelle (4/5)",
        "Gouvernance (4/5)",
      ]),
      weakPoints: JSON.stringify([
        "Qualité données (3/5) — étiquetage à constituer",
        "Indépendance SI (2/5) — dépendance API CRM",
        "Complexité élevée (simplicité 2/5)",
      ]),
    },
  });

  await prisma.atelier4Gate.create({
    data: {
      projectId,
      scoringComplete: true,
      weakPointsAddressed: true,
      priorityDefined: true,
      decisionRecommended: true,
      synthesisWritten: true,
      verdict: "READY",
      decidedAt: new Date("2026-05-10"),
      decidedBy: "Comité projet IA",
    },
  });

  console.log("  ✓ Atelier 4 — Scoring et maturité");
}

// =============================================================
// ATELIER 5 — Cartographie IA
// =============================================================
async function seedAtelier5() {
  const projectId = PROJECT_ID;

  await prisma.cartographyAnnotation.createMany({
    data: [
      { projectId, layer: "RISK", nodeId: "risk-hallucination", kind: "WARNING", criticality: "HIGH", content: "Hallucination LLM → toujours valider humain avant envoi." },
      { projectId, layer: "RISK", nodeId: "risk-rgpd", kind: "DECISION", criticality: "HIGH", content: "AIPD validée, minimisation données implémentée." },
      { projectId, layer: "GOVERNANCE", nodeId: "gov-dpo", kind: "NOTE", criticality: "MEDIUM", content: "DPO consulté en amont, à ré-impliquer avant chaque palier." },
      { projectId, layer: "DATA", nodeId: "data-ged", kind: "NOTE", criticality: "MEDIUM", content: "Source critique — bien tester l'accès en pré-POC." },
      { projectId, layer: "WORKFLOW", nodeId: "wf-validation", kind: "DECISION", criticality: "HIGH", content: "Validation humaine BLOQUANTE sur réponses sensibles." },
      { projectId, layer: "TECHNOLOGY", nodeId: "tech-llm", kind: "QUESTION", content: "Choix final LLM Mistral vs Azure OpenAI à arbitrer." },
    ],
  });

  await prisma.atelier5Synthesis.create({
    data: {
      projectId,
      systemOverview:
        "Architecture hybride : BPM en orchestrateur, IA en assistant, humain en superviseur. Les 6 couches cartographiques sont cohérentes : métier clair, workflow détaillé, data identifiée, technos sélectionnées, risques maîtrisés, gouvernance définie.",
      criticalNodes: JSON.stringify([
        "Hallucination LLM",
        "RGPD / EU AI Act",
        "Validation humaine bloquante",
        "API CRM (dépendance)",
      ]),
      missingComponents: JSON.stringify([
        "Monitoring dérive modèle en production",
        "Boucle de feedback agents → ré-entraînement",
      ]),
      governanceObservations:
        "Gouvernance bien dimensionnée : sponsor, DPO, RSSI, manager métier impliqués dès le cadrage.",
      governanceHotspots:
        "Définir formellement le comité IA mensuel et les seuils de re-validation.",
    },
  });

  await prisma.atelier5Gate.create({
    data: {
      projectId,
      sixLayersReviewed: true,
      criticalNodesAnnotated: true,
      governanceMapDefined: true,
      riskMapDefined: true,
      synthesisWritten: true,
      verdict: "READY",
      decidedAt: new Date("2026-05-15"),
      decidedBy: "Comité projet IA",
    },
  });

  console.log("  ✓ Atelier 5 — Cartographie IA");
}

// =============================================================
// ATELIER 6 — Gouvernance, risques, conformité
// =============================================================
async function seedAtelier6() {
  const projectId = PROJECT_ID;

  // RACI
  const racis = [
    // Pilotage projet IA
    { scope: "Pilotage projet IA", responsibilityType: "A", actorRole: "Sponsor — Mme Dupont" },
    { scope: "Pilotage projet IA", responsibilityType: "R", actorRole: "Chef de projet — M. Petit" },
    { scope: "Pilotage projet IA", responsibilityType: "C", actorRole: "Manager équipe — M. Martin" },
    { scope: "Pilotage projet IA", responsibilityType: "I", actorRole: "Direction générale" },
    // Validation réponses IA
    { scope: "Validation réponses IA", responsibilityType: "A", actorRole: "Manager équipe — M. Martin" },
    { scope: "Validation réponses IA", responsibilityType: "R", actorRole: "Agent senior" },
    { scope: "Validation réponses IA", responsibilityType: "C", actorRole: "DPO" },
    // Supervision IA
    { scope: "Supervision IA", responsibilityType: "A", actorRole: "Chef de projet — M. Petit" },
    { scope: "Supervision IA", responsibilityType: "R", actorRole: "DSI" },
    { scope: "Supervision IA", responsibilityType: "C", actorRole: "Data scientist interne" },
    // Sécurité données
    { scope: "Sécurité données", responsibilityType: "A", actorRole: "RSSI" },
    { scope: "Sécurité données", responsibilityType: "R", actorRole: "DSI" },
    { scope: "Sécurité données", responsibilityType: "C", actorRole: "DPO" },
    // Conformité RGPD
    { scope: "Conformité RGPD", responsibilityType: "A", actorRole: "DPO" },
    { scope: "Conformité RGPD", responsibilityType: "R", actorRole: "Chef de projet — M. Petit" },
    { scope: "Conformité RGPD", responsibilityType: "C", actorRole: "Sponsor — Mme Dupont" },
    { scope: "Conformité RGPD", responsibilityType: "I", actorRole: "Manager équipe — M. Martin" },
    // Architecture & SI
    { scope: "Architecture & SI", responsibilityType: "A", actorRole: "DSI" },
    { scope: "Architecture & SI", responsibilityType: "R", actorRole: "Architecte SI" },
    // Gestion incidents IA
    { scope: "Gestion incidents IA", responsibilityType: "A", actorRole: "Chef de projet — M. Petit" },
    { scope: "Gestion incidents IA", responsibilityType: "R", actorRole: "DSI" },
    { scope: "Gestion incidents IA", responsibilityType: "C", actorRole: "Manager équipe — M. Martin" },
  ];
  for (const r of racis) {
    await prisma.governanceRole.create({ data: { projectId, ...r } });
  }

  // Sécurité
  await prisma.securityControl.createMany({
    data: [
      { projectId, domain: "AUTH", name: "SSO + MFA pour tous les accès agents et admin", status: "IN_PLACE", responsibleRole: "DSI" },
      { projectId, domain: "RBAC", name: "Rôles agents / managers / admins distincts, principe moindre privilège", status: "IN_PLACE", responsibleRole: "DSI" },
      { projectId, domain: "ENCRYPTION", name: "Chiffrement données au repos (DB) + en transit (TLS 1.3)", status: "IN_PLACE", responsibleRole: "RSSI" },
      { projectId, domain: "LOGS", name: "Journalisation exhaustive (accès, décisions IA, validations)", status: "PLANNED", responsibleRole: "DSI" },
      { projectId, domain: "SEGMENTATION", name: "Environnements dev/recette/prod isolés", status: "IN_PLACE", responsibleRole: "DSI" },
      { projectId, domain: "MONITORING", name: "SIEM avec alertes sur comportements anormaux", status: "PLANNED", responsibleRole: "RSSI" },
      { projectId, domain: "BACKUP", name: "Sauvegardes quotidiennes + plan reprise activité", status: "TESTED", responsibleRole: "DSI" },
    ],
  });

  // Conformité
  await prisma.complianceItem.createMany({
    data: [
      { projectId, framework: "RGPD", requirementCode: "Art.5", requirement: "Minimisation des données traitées", status: "COMPLIANT", evidence: "Schéma data validé DPO", responsibleRole: "DPO" },
      { projectId, framework: "RGPD", requirementCode: "Art.13-14", requirement: "Information des personnes concernées (transparence IA)", status: "PARTIAL", evidence: "Mention à ajouter dans les réponses", responsibleRole: "DPO" },
      { projectId, framework: "RGPD", requirementCode: "Art.15-22", requirement: "Droits des personnes (accès, rectification, opposition)", status: "PARTIAL", responsibleRole: "DPO" },
      { projectId, framework: "RGPD", requirementCode: "Art.35", requirement: "Analyse d'impact (AIPD)", status: "PARTIAL", evidence: "AIPD en cours de rédaction", responsibleRole: "DPO" },
      { projectId, framework: "RGPD", requirementCode: "Art.5(1)(e)", requirement: "Durée de conservation limitée (3 ans)", status: "COMPLIANT", responsibleRole: "DPO" },
      { projectId, framework: "EU_AI_ACT", requirementCode: "Tier", requirement: "Classification système — Risque limité", status: "COMPLIANT", evidence: "Note juridique", responsibleRole: "DPO" },
      { projectId, framework: "EU_AI_ACT", requirementCode: "Art.52", requirement: "Transparence : informer l'usager qu'une IA assiste", status: "PARTIAL", responsibleRole: "DPO" },
      { projectId, framework: "INTERNAL", requirement: "Politique IA interne (charte usage)", status: "PARTIAL", responsibleRole: "Sponsor" },
      { projectId, framework: "ISO27001", requirement: "Conformité ISO27001 — annexe A (en cours)", status: "PARTIAL", responsibleRole: "RSSI" },
    ],
  });

  // KPI monitoring
  await prisma.monitoringKpi.createMany({
    data: [
      { projectId, name: "Taux de classification correcte", category: "QUALITY", unit: "%", targetValue: "95", alertThreshold: "<90", frequency: "DAILY", responsibleRole: "Data scientist" },
      { projectId, name: "Taux de validation humaine bloquante", category: "QUALITY", unit: "%", targetValue: "<30", alertThreshold: ">40", frequency: "DAILY", responsibleRole: "Manager équipe" },
      { projectId, name: "Délai moyen de réponse", category: "PERFORMANCE", unit: "jours", targetValue: "<5", alertThreshold: ">7", frequency: "DAILY", responsibleRole: "Manager équipe" },
      { projectId, name: "Score de confiance moyen IA", category: "DRIFT", unit: "%", targetValue: ">85", alertThreshold: "<75", frequency: "HOURLY", responsibleRole: "Data scientist" },
      { projectId, name: "Nombre d'incidents IA critiques", category: "INCIDENT", unit: "incidents/mois", targetValue: "0", alertThreshold: ">2", frequency: "REALTIME", responsibleRole: "DSI" },
      { projectId, name: "Volume traité par agent /jour", category: "USAGE", unit: "emails", targetValue: "60", frequency: "WEEKLY", responsibleRole: "Manager équipe" },
    ],
  });

  // Procédures incidents
  await prisma.incidentProcedure.createMany({
    data: [
      { projectId, incidentType: "AI_HALLUCINATION", severity: "HIGH", detectionMethod: "Validation agent + signalement", escalationPath: "Agent → Manager → DSI → DPO si donnée perso", correctiveActions: "Bloquer la réponse, journaliser, ré-entraîner si récurrent.", postIncidentReview: true },
      { projectId, incidentType: "DATA_LEAK", severity: "CRITICAL", detectionMethod: "Alerte SIEM + audit logs", escalationPath: "RSSI → DPO → Direction → CNIL si applicable", correctiveActions: "Coupure d'accès, analyse forensique, notification CNIL (72h).", postIncidentReview: true },
      { projectId, incidentType: "CLASSIFICATION_ERROR", severity: "MEDIUM", detectionMethod: "Re-classement manager + KPI dérive", escalationPath: "Agent → Manager → Data scientist", correctiveActions: "Correction + ajout au dataset d'amélioration.", postIncidentReview: false },
      { projectId, incidentType: "DRIFT", severity: "HIGH", detectionMethod: "Monitoring KPI quotidien (score confiance)", escalationPath: "Data scientist → Chef de projet → Sponsor", correctiveActions: "Investigation, ré-entraînement, déploiement nouveau modèle.", postIncidentReview: true },
      { projectId, incidentType: "OUTAGE", severity: "HIGH", detectionMethod: "Monitoring infra", escalationPath: "DSI → équipe ops 24/7", correctiveActions: "Bascule mode dégradé (traitement 100% manuel), restauration.", postIncidentReview: true },
      { projectId, incidentType: "OCR_ERROR", severity: "MEDIUM", detectionMethod: "Score OCR < seuil", escalationPath: "Agent (manuel)", correctiveActions: "Traitement manuel + signal data scientist." },
    ],
  });

  await prisma.atelier6Synthesis.create({
    data: {
      projectId,
      governanceScore: 71,
      governanceLevel: "HIGH",
      strongPoints: JSON.stringify([
        "RACI complet (21 entrées, 7 scopes)",
        "Sécurité couverte (7 domaines/8)",
        "Procédures incidents (6 types)",
        "KPI monitoring définis (6 KPI)",
      ]),
      weakPoints: JSON.stringify([
        "Logs et SIEM en mode PLANNED (à activer avant MVP)",
        "Quelques items RGPD encore PARTIAL (transparence, AIPD)",
      ]),
      priorityActions: JSON.stringify([
        "Finaliser AIPD avant POC",
        "Implémenter journalisation exhaustive",
        "Ajouter mention transparence IA dans toutes les réponses",
        "Activer SIEM avant MVP",
      ]),
      overallStatement:
        "Gouvernance solide (71/100, niveau HIGH). Conditions réunies pour un POC, avec quelques items à finaliser avant MVP (AIPD, logs, transparence).",
      industrializationReadiness: true,
    },
  });

  await prisma.atelier6Gate.create({
    data: {
      projectId,
      governanceDefined: true,
      validationsMapped: true,
      risksControlled: true,
      securityDefined: true,
      complianceChecked: true,
      monitoringPlanned: true,
      incidentsPrepared: true,
      synthesisWritten: true,
      verdict: "READY",
      decidedAt: new Date("2026-05-22"),
      decidedBy: "Comité de gouvernance IA",
    },
  });

  console.log("  ✓ Atelier 6 — Gouvernance, risques, conformité");
}

// =============================================================
// ATELIER 7 — Architecture cible, roadmap, décision finale
// =============================================================
async function seedAtelier7() {
  const projectId = PROJECT_ID;

  await prisma.strategicVision.create({
    data: {
      projectId,
      visionStatement:
        "Doter le service d'un assistant IA qui libère les agents des tâches répétitives (tri, classification, recherche, brouillon) pour leur permettre de se concentrer sur la qualité de la réponse et les cas complexes — sans jamais déléguer la responsabilité de la décision finale à l'IA.",
      strategicObjectives: JSON.stringify([
        "Tenir l'objectif politique 2026 : délai de réponse < 5 jours",
        "Lever la pression CNIL sur les droits d'accès",
        "Améliorer la satisfaction usager (NPS de -8 à +20)",
        "Libérer 30% du temps agent pour les cas complexes",
        "Industrialiser l'IA de manière responsable et auditable",
      ]),
      businessValue:
        "Gain estimé : 1.5 ETP libéré + NPS +28 points + zéro saisie CNIL. ROI 12-18 mois. Vitrine institutionnelle pour la transformation numérique.",
      transformationGoals: JSON.stringify([
        "Monter en compétence l'équipe IA interne",
        "Établir un comité de gouvernance IA réutilisable pour d'autres projets",
        "Industrialiser une plateforme IA hybride réplicable",
      ]),
      successCriteria: JSON.stringify([
        "Délai < 5 jours sur 80% des demandes au bout de 12 mois",
        "Taux validation humaine bloquante < 30%",
        "Zéro incident RGPD critique",
        "Adoption agents > 85% (satisfaction outil)",
      ]),
      businessValueScore: 5,
      transformationScore: 4,
    },
  });

  // Roadmap items
  const roadmapItems = [
    // Phase 0 POC
    { phase: "PHASE_0_POC", title: "POC classification + RAG sur 1 service pilote", impact: 5, complexity: 3, effortMonths: 3, itemType: "QUICK_WIN", ownerRole: "Chef de projet", description: "Validation faisabilité technique + acceptation agents." },
    { phase: "PHASE_0_POC", title: "Constitution dataset étiquetage (500 emails)", impact: 4, complexity: 2, effortMonths: 1, itemType: "DEPENDENCY", ownerRole: "Data scientist" },
    { phase: "PHASE_0_POC", title: "Finalisation AIPD + transparence usager", impact: 5, complexity: 2, effortMonths: 1, itemType: "DEPENDENCY", ownerRole: "DPO" },
    { phase: "PHASE_0_POC", title: "Négociation ouverture API CRM", impact: 5, complexity: 3, effortMonths: 2, itemType: "DEPENDENCY", ownerRole: "DSI" },
    // Phase 1 MVP
    { phase: "PHASE_1_MVP", title: "MVP avec génération brouillons + validation 100%", impact: 5, complexity: 4, effortMonths: 4, itemType: "STRATEGIC", ownerRole: "Chef de projet" },
    { phase: "PHASE_1_MVP", title: "Activation journalisation + SIEM", impact: 4, complexity: 3, effortMonths: 2, itemType: "STRATEGIC", ownerRole: "RSSI" },
    { phase: "PHASE_1_MVP", title: "Mise en place comité IA mensuel + KPI", impact: 4, complexity: 2, effortMonths: 1, itemType: "STRATEGIC", ownerRole: "Sponsor" },
    // Phase 2 Pilote
    { phase: "PHASE_2_PILOT", title: "Pilote élargi à 3 services", impact: 5, complexity: 4, effortMonths: 4, itemType: "STRATEGIC", ownerRole: "Chef de projet" },
    { phase: "PHASE_2_PILOT", title: "Formation agents + change management", impact: 4, complexity: 3, effortMonths: 3, itemType: "STRATEGIC", ownerRole: "Manager équipe" },
    // Phase 3 Rollout
    { phase: "PHASE_3_ROLLOUT", title: "Déploiement progressif tous services", impact: 5, complexity: 4, effortMonths: 6, itemType: "STRATEGIC", ownerRole: "Chef de projet" },
    { phase: "PHASE_3_ROLLOUT", title: "Intégration cockpit pilotage manager", impact: 4, complexity: 2, effortMonths: 2, itemType: "QUICK_WIN", ownerRole: "DSI" },
    // Phase 4 Run
    { phase: "PHASE_4_RUN", title: "Exploitation + amélioration continue (boucle feedback)", impact: 3, complexity: 2, effortMonths: 12, itemType: "RUN", ownerRole: "DSI + Data scientist" },
    { phase: "PHASE_4_RUN", title: "Re-training trimestriel modèle classification", impact: 4, complexity: 2, effortMonths: 12, itemType: "RUN", ownerRole: "Data scientist" },
  ];
  for (let i = 0; i < roadmapItems.length; i++) {
    await prisma.roadmapItem.create({ data: { projectId, ...roadmapItems[i], position: i, status: i < 4 ? "IN_PROGRESS" : "PLANNED" } });
  }

  // Industrialization steps
  await prisma.industrializationStep.createMany({
    data: [
      { projectId, stage: "POC", name: "POC service pilote", description: "Validation faisabilité + acceptation agents sur 1 service.", readinessLevel: 4, status: "IN_PROGRESS", startTarget: new Date("2026-06-01"), endTarget: new Date("2026-08-31"), exitCriteria: "Taux classification > 85% + acceptation agents > 70%." },
      { projectId, stage: "MVP", name: "MVP avec génération assistée", description: "Génération brouillons + validation humaine 100%.", readinessLevel: 3, status: "NOT_STARTED", startTarget: new Date("2026-09-01"), endTarget: new Date("2026-12-31"), exitCriteria: "Taux validation bloquante < 40% + 0 incident critique." },
      { projectId, stage: "PILOT", name: "Pilote 3 services", description: "Extension à 3 services métiers.", readinessLevel: 2, status: "NOT_STARTED", startTarget: new Date("2027-01-01"), endTarget: new Date("2027-04-30"), exitCriteria: "NPS > 0 + délai moyen < 7 jours." },
      { projectId, stage: "ROLLOUT", name: "Déploiement complet", description: "Tous les services, gouvernance opérationnelle.", readinessLevel: 1, status: "NOT_STARTED", startTarget: new Date("2027-05-01"), endTarget: new Date("2027-10-31"), exitCriteria: "Délai < 5 jours sur 80% + adoption > 85%." },
      { projectId, stage: "RUN", name: "Exploitation pérenne", description: "Run + amélioration continue + re-training.", readinessLevel: 1, status: "NOT_STARTED", startTarget: new Date("2027-11-01"), exitCriteria: "Performance stable, 0 incident critique sur 12 mois." },
    ],
  });

  await prisma.atelier7Synthesis.create({
    data: {
      projectId,
      globalProjectScore: 72,
      globalMaturity: "MATURE",
      finalDecision: "POC_IA",
      decisionRationale:
        "Score global 72/100 (mature), gouvernance solide (71/100), vision forte (90/100 — sponsor engagé, ROI clair). Profil atelier 2 = AI_HYBRID. Conditions parfaites pour un POC ciblé sur 3 mois avant industrialisation. Risques principaux maîtrisés (data, API CRM, OCR) via le POC.",
      strongPoints: JSON.stringify([
        "Sponsor engagé + équipe alignée",
        "Workflow cartographié et chiffré",
        "Gouvernance complète (RACI, DPO, RSSI)",
        "ROI clair (1.5 ETP + NPS +28)",
        "Architecture hybride réplicable",
      ]),
      weakPoints: JSON.stringify([
        "Qualité OCR à valider en POC",
        "Dataset étiquetage à constituer",
        "Dépendance API CRM",
      ]),
      mainRisks: JSON.stringify([
        "Hallucinations LLM (mitigé par validation humaine)",
        "Acceptation agents (mitigé par change management)",
        "EU AI Act évolutif",
      ]),
      roadmapSummary:
        "POC (3 mois) → MVP (4 mois) → Pilote 3 services (4 mois) → Rollout (6 mois) → Run.",
      industrializationStrategy:
        "Stratégie progressive avec gates de sortie clairs à chaque stage. Validation humaine systématique en POC et MVP, allègement progressif si KPI qualité tenus.",
      governanceStrategy:
        "Comité IA mensuel, RACI formel, DPO et RSSI impliqués à chaque palier. Reporting trimestriel direction.",
      pilotageStrategy:
        "6 KPI suivis quotidiennement, dashboard manager temps réel, alertes sur dérive modèle.",
      sponsorDecision: "OK",
      sponsorName: "Mme Dupont — Responsable accueil",
      sponsorDecisionDate: new Date("2026-06-01"),
    },
  });

  await prisma.atelier7Gate.create({
    data: {
      projectId,
      visionDefined: true,
      roadmapBuilt: true,
      industrializationPlanned: true,
      finalDecisionMade: true,
      sponsorSignOff: true,
      deliverableExported: false,
      verdict: "NOT_READY",
      decidedAt: null,
      decidedBy: null,
    },
  });

  console.log("  ✓ Atelier 7 — Architecture cible, roadmap, décision finale");
}

async function main() {
  console.log("Seeding atelier 1-7 data for project 'demo-mailbox'…\n");
  const project = await prisma.project.findUnique({ where: { id: PROJECT_ID } });
  if (!project) {
    console.error(`❌ Project '${PROJECT_ID}' not found. Run 'npm run seed' first.`);
    process.exit(1);
  }
  console.log(`  Project found: ${project.name}\n`);

  await clean();
  await seedAtelier1();
  await seedAtelier2();
  await seedAtelier3();
  await seedAtelier4();
  await seedAtelier5();
  await seedAtelier6();
  await seedAtelier7();

  console.log("\n✅ Done. Open the project in the app to navigate the 7 ateliers fully populated.");
  console.log(`   → http://localhost:3000/projects/${PROJECT_ID}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
