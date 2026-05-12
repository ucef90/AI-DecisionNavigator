// Demo seed — three reference projects from SPEC.MD §389-400.
//
//   1. "Automatisation des boîtes mails"  → expected: GO_IA / POC_IA
//   2. "Interprétariat PMI"               → expected: NO_GO or STUDY
//   3. "LAD MDPH"                         → expected: POC_IA
//
// The seed is idempotent: each project has a stable cuid-like id, and we
// upsert-then-replace-children to avoid duplicates. Run with `npm run seed`.

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filePath });
const prisma = new PrismaClient({ adapter, log: ["error"] });

type SeedProject = {
  id: string;
  name: string;
  direction: string;
  sponsor: string;
  managerName: string;
  description: string;
  maturity: "LOW" | "MEDIUM" | "HIGH";
  businessNeed: {
    initialRequest: string;
    reformulatedNeed: string;
    painPoints: string[];
    expectedValue: string;
    usersImpacted: string;
    currentKpis: string[];
    expectedOutcome: string;
  };
  aiAnalysis: {
    automationRelevant: boolean;
    ruleEngineRelevant: boolean;
    mlRelevant: boolean;
    llmRelevant: boolean;
    ragRelevant: boolean;
    agentRelevant: boolean;
    hybridRelevant: boolean;
    classicRelevant: boolean;
    recommendedApproach: string;
    justification: string;
  };
  dataAssessment: {
    dataSources: string[];
    structured: boolean;
    unstructured: boolean;
    history: string;
    quality: string;
    availability: string;
    silos: string;
    personalData: boolean;
    sensitivity: "NONE" | "INTERNAL" | "CONFIDENTIAL" | "SENSITIVE";
    rgpdConstraints: string;
  };
  architecture: {
    applications: string[];
    apis: string[];
    workflowCurrent: string;
    workflowTarget: string;
    siIntegration: string;
    humanValidation: boolean;
    traceability: string;
    existingTools: string[];
  };
  risks: {
    rgpdRisk: number;
    sensitiveDataRisk: number;
    hallucinationRisk: number;
    biasRisk: number;
    classificationRisk: number;
    autoDecisionRisk: number;
    securityRisk: number;
    vendorLockRisk: number;
    adoptionRisk: number;
    supervisionRisk: number;
    overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitigationPlan: string;
  };
};

const PROJECTS: SeedProject[] = [
  // -----------------------------------------------------------
  // 1) Automatisation des boîtes mails — GO_IA / POC_IA
  // -----------------------------------------------------------
  {
    id: "demo-mailbox",
    name: "Automatisation des boîtes mails",
    direction: "Direction de la Relation Citoyenne",
    sponsor: "Directrice de la Relation Citoyenne",
    managerName: "Chef de projet IA — Pôle innovation",
    description:
      "Réduire le délai de traitement et améliorer la qualité de réponse aux demandes citoyennes reçues sur la boîte mail générique.",
    maturity: "MEDIUM",
    businessNeed: {
      initialRequest:
        "Nous recevons 4 000 mails par mois sur la boîte générique et les délais explosent : nous voulons automatiser une partie du traitement.",
      reformulatedNeed:
        "Les agents passent 60% de leur temps à trier, qualifier et router les demandes citoyennes avant d'y répondre. Le besoin réel est de réduire ce temps de qualification et d'aider la rédaction des réponses standards, tout en gardant la décision finale humaine sur les cas complexes.",
      painPoints: [
        "Tri manuel chronophage des 4 000 mails mensuels",
        "Demandes redirigées 2 à 3 fois avant le bon service",
        "Délai moyen de réponse supérieur à 8 jours",
        "Réponses incohérentes selon l'agent",
        "Pas de suivi des récurrences thématiques",
      ],
      expectedValue:
        "Réduire le temps moyen de traitement de 40%, améliorer la qualité et la cohérence des réponses, libérer les agents pour les cas complexes.",
      usersImpacted: "Agents Relation Citoyenne, citoyens, managers de service",
      currentKpis: [
        "Temps moyen de traitement : 8.4 jours",
        "Taux de résolution au premier contact : 38%",
        "Taux de satisfaction usager : 62%",
        "Volume mensuel : 4 000 mails",
      ],
      expectedOutcome:
        "Workflow hybride : classification + extraction IA, suggestion de réponse, validation humaine systématique avant envoi.",
    },
    aiAnalysis: {
      automationRelevant: false,
      ruleEngineRelevant: false,
      mlRelevant: true,
      llmRelevant: true,
      ragRelevant: true,
      agentRelevant: false,
      hybridRelevant: true,
      classicRelevant: false,
      recommendedApproach: "HYBRID",
      justification:
        "Volume textuel important, demandes hétérogènes, besoin de classification (ML) et de rédaction assistée (LLM) avec ancrage documentaire (RAG sur base FAQ + procédures internes). Workflow hybride pour garder une validation humaine.",
    },
    dataAssessment: {
      dataSources: [
        "Boîte mail Exchange / Outlook",
        "Base FAQ Relation Citoyenne (SharePoint)",
        "Procédures internes (GED)",
        "Historique CRM des demandes (3 ans)",
      ],
      structured: true,
      unstructured: true,
      history: "Historique CRM disponible sur 3 ans, environ 140 000 demandes catégorisées.",
      quality:
        "Qualité bonne sur le CRM. Pièces jointes hétérogènes (PDF, DOC, photos). Catégorisation historique fiable à 85%.",
      availability: "Accès en temps réel via API Exchange + connecteur CRM",
      silos: "FAQ et procédures dispersées entre SharePoint et GED — nécessite indexation préalable",
      personalData: true,
      sensitivity: "CONFIDENTIAL",
      rgpdConstraints:
        "Données personnelles citoyennes (nom, adresse, situation). Base légale : mission de service public. AIPD à actualiser. Conservation 3 ans. Pas de prise de décision automatisée sur les usagers.",
    },
    architecture: {
      applications: [
        "Outlook / Exchange",
        "CRM Relation Citoyenne",
        "GED SharePoint",
        "Portail Agent (intranet)",
      ],
      apis: [
        "API Exchange Web Services",
        "API CRM (REST)",
        "API SharePoint Graph",
      ],
      workflowCurrent:
        "1. Email entrant 2. Lecture manuelle 3. Classement manuel 4. Analyse manuelle 5. Rédaction réponse 6. Validation humaine 7. Envoi réponse",
      workflowTarget:
        "1. Email entrant 2. IA Classification (ML) 3. IA Extraction (OCR/NLP des pièces jointes) 4. IA Analyse & Suggestion réponse (LLM + RAG) 5. Validation humaine 6. Envoi réponse",
      siIntegration: "API REST + webhook Exchange, intégration via le bus de service existant",
      humanValidation: true,
      traceability:
        "Log de chaque étape IA (classification, extraction, suggestion) horodaté et associé à l'agent ayant validé. Audit trail RGPD complet.",
      existingTools: ["Power Automate", "Power BI", "ServiceNow"],
    },
    risks: {
      rgpdRisk: 3,
      sensitiveDataRisk: 2,
      hallucinationRisk: 3,
      biasRisk: 2,
      classificationRisk: 2,
      autoDecisionRisk: 1,
      securityRisk: 2,
      vendorLockRisk: 3,
      adoptionRisk: 3,
      supervisionRisk: 1,
      overallRisk: "MEDIUM",
      mitigationPlan:
        "Hallucinations : RAG avec citations + validation humaine systématique. RGPD : AIPD validée par DPO, abstraction provider LLM (cloud souverain). Adoption : 2 ateliers/mois avec les agents pilotes, montée en charge progressive. Supervision : tableau de bord qualité IA mensuel.",
    },
  },

  // -----------------------------------------------------------
  // 2) Interprétariat PMI — NO_GO or STUDY
  // -----------------------------------------------------------
  {
    id: "demo-pmi",
    name: "Interprétariat médical PMI",
    direction: "Direction Enfance / PMI",
    sponsor: "Médecin-chef PMI",
    managerName: "Chef de projet PMI",
    description:
      "Étude de remplacement progressif de l'interprétariat humain par un assistant IA de traduction en temps réel pour les consultations PMI.",
    maturity: "LOW",
    businessNeed: {
      initialRequest:
        "Nous voulons un agent IA qui traduit en temps réel pendant les consultations PMI pour réduire le coût des interprètes humains.",
      reformulatedNeed:
        "Les consultations PMI avec familles allophones nécessitent un interprète présent. Le coût annuel est important et les délais d'accès aux interprètes ralentissent la prise en charge. La demande initiale propose directement une solution IA — il faut d'abord qualifier le vrai problème (accès rapide à un interprète qualifié sur des sujets de santé infantile).",
      painPoints: [
        "Coût annuel des interprètes vacataires",
        "Délai d'accès parfois supérieur à 2 semaines",
        "Disponibilité limitée sur certaines langues rares",
        "Confidentialité sujette à la qualité de l'interprète",
      ],
      expectedValue:
        "Réduire les coûts d'interprétariat. ATTENTION : la valeur réelle dépend totalement de la fiabilité — une erreur sur un diagnostic enfant est inacceptable.",
      usersImpacted: "Médecins PMI, infirmières, familles allophones, enfants",
      currentKpis: [
        "Coût annuel interprétariat : 180 k€",
        "Délai moyen d'accès interprète : 9 jours",
        "Volume annuel consultations interprétées : ~1 200",
      ],
      expectedOutcome:
        "À ce stade, l'objectif est de qualifier la faisabilité — la décision n'est pas évidente compte tenu du contexte santé / enfance.",
    },
    aiAnalysis: {
      automationRelevant: false,
      ruleEngineRelevant: false,
      mlRelevant: false,
      llmRelevant: true,
      ragRelevant: false,
      agentRelevant: false,
      hybridRelevant: false,
      classicRelevant: false,
      recommendedApproach: "LLM",
      justification:
        "Sur le papier un LLM multimodal traduction pourrait répondre. MAIS le contexte (santé, enfance, précision critique sur le diagnostic, vulnérabilité des familles) rend l'IA très risquée. La justification penche plutôt vers le maintien d'interprètes humains et une étude approfondie.",
    },
    dataAssessment: {
      dataSources: [],
      structured: false,
      unstructured: true,
      history: "Aucun historique exploitable : conversations orales non enregistrées",
      quality: "Faible — aucune donnée d'entraînement spécifique au vocabulaire médical pédiatrique",
      availability: "Données absentes",
      silos: "—",
      personalData: true,
      sensitivity: "SENSITIVE",
      rgpdConstraints:
        "Données de santé d'enfants mineurs allophones — catégorie particulière (art. 9 RGPD). Base légale très restrictive. Consentement éclairé requis. AIPD obligatoire avec consultation préalable CNIL probable.",
    },
    architecture: {
      applications: ["Logiciel PMI métier"],
      apis: [],
      workflowCurrent:
        "1. Prise de rendez-vous 2. Réservation interprète humain 3. Consultation à 3 (médecin/famille/interprète) 4. Compte-rendu manuel",
      workflowTarget:
        "À définir — la cible IA n'est pas mature.",
      siIntegration: "Non instruite",
      humanValidation: true,
      traceability: "Non définie",
      existingTools: [],
    },
    risks: {
      rgpdRisk: 5,
      sensitiveDataRisk: 5,
      hallucinationRisk: 5,
      biasRisk: 4,
      classificationRisk: 3,
      autoDecisionRisk: 2,
      securityRisk: 4,
      vendorLockRisk: 3,
      adoptionRisk: 4,
      supervisionRisk: 3,
      overallRisk: "CRITICAL",
      mitigationPlan: "",
    },
  },

  // -----------------------------------------------------------
  // 3) LAD MDPH — POC_IA
  // -----------------------------------------------------------
  {
    id: "demo-lad-mdph",
    name: "LAD MDPH — Lecture automatique des dossiers",
    direction: "MDPH",
    sponsor: "Directrice MDPH",
    managerName: "Chef de projet LAD",
    description:
      "Automatiser la lecture, l'extraction et le pré-classement des dossiers de demande MDPH (formulaires papier scannés + certificats médicaux + pièces complémentaires).",
    maturity: "MEDIUM",
    businessNeed: {
      initialRequest:
        "Nous voulons mettre en place un système OCR + IA pour traiter automatiquement les dossiers MDPH qui arrivent par centaines chaque semaine.",
      reformulatedNeed:
        "Les agents instructeurs MDPH passent un temps considérable à lire, extraire et saisir les informations des dossiers papier dans le SI métier. Le besoin est de fiabiliser cette extraction documentaire et de pré-qualifier les dossiers (complets/incomplets/à compléter) pour libérer du temps d'instruction.",
      painPoints: [
        "Dossiers papier scannés de qualité hétérogène",
        "Saisie manuelle des certificats médicaux et formulaires Cerfa",
        "30% des dossiers incomplets identifiés tardivement",
        "Délai d'instruction supérieur à 4 mois",
        "Stress et turnover des agents instructeurs",
      ],
      expectedValue:
        "Réduire de 30% le temps d'instruction par dossier, détecter les pièces manquantes à l'arrivée, fiabiliser la saisie.",
      usersImpacted: "Agents instructeurs MDPH, usagers en situation de handicap, équipes pluridisciplinaires",
      currentKpis: [
        "Délai moyen d'instruction : 4.2 mois",
        "Taux de dossiers incomplets détectés tardivement : 31%",
        "Volume annuel : 28 000 dossiers",
        "ETP saisie : 12",
      ],
      expectedOutcome:
        "OCR + classification documentaire + extraction structurée. Validation systématique par l'agent avant intégration au SI métier.",
    },
    aiAnalysis: {
      automationRelevant: false,
      ruleEngineRelevant: false,
      mlRelevant: true,
      llmRelevant: true,
      ragRelevant: false,
      agentRelevant: false,
      hybridRelevant: true,
      classicRelevant: false,
      recommendedApproach: "HYBRID",
      justification:
        "Combinaison OCR (extraction du texte des PDF/scans), ML (classification du type de document : Cerfa, certificat médical, RIB…), LLM (extraction structurée des champs et détection de complétude). Workflow hybride : validation humaine systématique avant intégration au SI MDPH.",
    },
    dataAssessment: {
      dataSources: [
        "Scans de dossiers MDPH (PDF + images)",
        "Référentiel Cerfa MDPH",
        "Référentiel nomenclature handicap",
        "Historique des dossiers instruits (5 ans)",
      ],
      structured: true,
      unstructured: true,
      history: "Historique sur 5 ans, environ 140 000 dossiers — corpus d'entraînement potentiel.",
      quality:
        "Qualité hétérogène : scans variés, certificats manuscrits parfois illisibles. Cerfa standardisé donc fiable.",
      availability: "Données accessibles via GED métier MDPH",
      silos: "Référentiels Cerfa et nomenclature accessibles, à indexer",
      personalData: true,
      sensitivity: "SENSITIVE",
      rgpdConstraints:
        "Données de santé (art. 9 RGPD) + données personnelles d'usagers en situation de handicap. Base légale : mission de service public obligatoire (Code de l'action sociale). AIPD validée par DPO obligatoire avant POC. Hébergement HDS exigé.",
    },
    architecture: {
      applications: [
        "SI MDPH métier (instruction)",
        "GED MDPH (archivage)",
        "Portail usager",
      ],
      apis: [
        "API SI MDPH (REST)",
        "API GED (CMIS / REST)",
      ],
      workflowCurrent:
        "1. Réception dossier papier 2. Numérisation 3. Lecture manuelle par agent 4. Saisie SI MDPH 5. Détection complétude 6. Instruction",
      workflowTarget:
        "1. Réception dossier 2. Numérisation 3. OCR + classification documentaire 4. Extraction structurée IA 5. Détection complétude automatique 6. Validation humaine 7. Pré-remplissage SI MDPH 8. Instruction",
      siIntegration: "API REST vers SI MDPH, dépôt automatique en GED après validation agent",
      humanValidation: true,
      traceability:
        "Chaque extraction loggée avec score de confiance, document source et champ extrait. Audit trail RGPD.",
      existingTools: ["GED métier", "Outils OCR bureautique (peu performants)"],
    },
    risks: {
      rgpdRisk: 4,
      sensitiveDataRisk: 4,
      hallucinationRisk: 3,
      biasRisk: 3,
      classificationRisk: 3,
      autoDecisionRisk: 1,
      securityRisk: 3,
      vendorLockRisk: 3,
      adoptionRisk: 3,
      supervisionRisk: 1,
      overallRisk: "HIGH",
      mitigationPlan:
        "RGPD : AIPD validée par DPO, hébergement HDS, contrat sous-traitant DPA. Hallucinations LLM : extraction structurée avec score de confiance + validation humaine systématique. Classification : seuil de confiance minimal sinon escalade humaine. Adoption : POC sur un service pilote MDPH (3 mois) avant généralisation. Vendor-lock : abstraction provider OCR/LLM (Azure + Mistral).",
    },
  },
];

async function upsertProject(p: SeedProject) {
  // Replace strategy: delete existing related rows, then recreate.
  // We don't delete the project itself to keep its createdAt stable.
  await prisma.businessNeed.deleteMany({ where: { projectId: p.id } });
  await prisma.aIAnalysis.deleteMany({ where: { projectId: p.id } });
  await prisma.dataAssessment.deleteMany({ where: { projectId: p.id } });
  await prisma.architectureAssessment.deleteMany({ where: { projectId: p.id } });
  await prisma.riskAssessment.deleteMany({ where: { projectId: p.id } });
  await prisma.scoring.deleteMany({ where: { projectId: p.id } });
  await prisma.deliverable.deleteMany({ where: { projectId: p.id } });

  await prisma.project.upsert({
    where: { id: p.id },
    update: {
      name: p.name,
      direction: p.direction,
      sponsor: p.sponsor,
      managerName: p.managerName,
      description: p.description,
      maturity: p.maturity,
      status: "IN_PROGRESS",
      finalDecision: null,
      totalScore: null,
    },
    create: {
      id: p.id,
      name: p.name,
      direction: p.direction,
      sponsor: p.sponsor,
      managerName: p.managerName,
      description: p.description,
      maturity: p.maturity,
      status: "IN_PROGRESS",
    },
  });

  await prisma.businessNeed.create({
    data: {
      projectId: p.id,
      initialRequest: p.businessNeed.initialRequest,
      reformulatedNeed: p.businessNeed.reformulatedNeed,
      painPoints: JSON.stringify(p.businessNeed.painPoints),
      expectedValue: p.businessNeed.expectedValue,
      usersImpacted: p.businessNeed.usersImpacted,
      currentKpis: JSON.stringify(p.businessNeed.currentKpis),
      expectedOutcome: p.businessNeed.expectedOutcome,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      projectId: p.id,
      automationRelevant: p.aiAnalysis.automationRelevant,
      ruleEngineRelevant: p.aiAnalysis.ruleEngineRelevant,
      mlRelevant: p.aiAnalysis.mlRelevant,
      llmRelevant: p.aiAnalysis.llmRelevant,
      ragRelevant: p.aiAnalysis.ragRelevant,
      agentRelevant: p.aiAnalysis.agentRelevant,
      hybridRelevant: p.aiAnalysis.hybridRelevant,
      classicRelevant: p.aiAnalysis.classicRelevant,
      recommendedApproach: p.aiAnalysis.recommendedApproach,
      justification: p.aiAnalysis.justification,
    },
  });

  await prisma.dataAssessment.create({
    data: {
      projectId: p.id,
      dataSources: JSON.stringify(p.dataAssessment.dataSources),
      dataTypes: JSON.stringify({
        structured: p.dataAssessment.structured,
        unstructured: p.dataAssessment.unstructured,
      }),
      history: p.dataAssessment.history,
      quality: p.dataAssessment.quality,
      availability: p.dataAssessment.availability,
      silos: p.dataAssessment.silos,
      personalData: p.dataAssessment.personalData,
      sensitivity: p.dataAssessment.sensitivity,
      rgpdConstraints: p.dataAssessment.rgpdConstraints,
    },
  });

  await prisma.architectureAssessment.create({
    data: {
      projectId: p.id,
      applications: JSON.stringify(p.architecture.applications),
      apis: JSON.stringify(p.architecture.apis),
      workflowCurrent: p.architecture.workflowCurrent,
      workflowTarget: p.architecture.workflowTarget,
      siIntegration: p.architecture.siIntegration,
      humanValidation: p.architecture.humanValidation,
      traceability: p.architecture.traceability,
      existingTools: JSON.stringify(p.architecture.existingTools),
    },
  });

  await prisma.riskAssessment.create({
    data: {
      projectId: p.id,
      rgpdRisk: p.risks.rgpdRisk,
      sensitiveDataRisk: p.risks.sensitiveDataRisk,
      hallucinationRisk: p.risks.hallucinationRisk,
      biasRisk: p.risks.biasRisk,
      classificationRisk: p.risks.classificationRisk,
      autoDecisionRisk: p.risks.autoDecisionRisk,
      securityRisk: p.risks.securityRisk,
      vendorLockRisk: p.risks.vendorLockRisk,
      adoptionRisk: p.risks.adoptionRisk,
      supervisionRisk: p.risks.supervisionRisk,
      overallRisk: p.risks.overallRisk,
      mitigationPlan: p.risks.mitigationPlan,
    },
  });

  console.log(`  ✓ ${p.name}`);
}

async function main() {
  console.log("Seeding demo projects…");
  for (const p of PROJECTS) {
    await upsertProject(p);
  }
  console.log(`\nDone. ${PROJECTS.length} projects ready.`);
  console.log("Run `npm run dev` and open /projects to inspect them.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
