// Bibliothèque centrale des bulles d'aide affichées par le "(i)"
// à côté de chaque label de champ. Indexée par l'attribut `name`
// du formulaire — auto-lookup dans Field / SelectField / TextareaField.
//
// Quand un même `name` est utilisé dans plusieurs contextes, on
// préfère le sens le plus courant ; les éditeurs spécifiques
// peuvent toujours surcharger via la prop `hint`.

export const FIELD_HINTS: Record<string, string> = {
  // -------------------------------------------------------------
  // Atelier 1 — Compréhension du besoin métier
  // -------------------------------------------------------------
  initialRequest: "Reprends la phrase exacte du sponsor, telle qu'il l'a formulée. Ne corrige pas encore.",
  reformulatedNeed: "Réécris en termes MÉTIER, pas techno. Décris ce que l'usager veut accomplir, pas la solution.",
  expectedValue: "Quelle valeur métier on en tire ? (gain temps, qualité, conformité, satisfaction). Chiffre si possible.",
  expectedOutcome: "Résultat tangible attendu : -30% délai, +20% satisfaction, +1 ETP libéré, etc.",
  usersImpacted: "Qui utilise / subit le changement ? (agents, managers, usagers finaux). Nombre approximatif.",
  problemStatement: "Une phrase qui résume LE problème métier (pas la techno, pas la solution).",
  currentImpactSummary: "Quel est l'impact actuel du problème ? (en délai, coût, qualité, charge).",
  expectedResultSummary: "Quel résultat tangible vises-tu, avec quel KPI principal mesurable ?",

  // Acteurs
  fullName: "Nom + prénom (anonymisable si nécessaire).",
  role: "Rôle dans le projet. Pour le RACI, utilise un libellé court et stable.",
  actorType: "SPONSOR (décide budget), CLIENT (bénéficiaire), USER (utilise au quotidien), STAKEHOLDER, OTHER.",
  influence: "À quel point peut-il bloquer ou accélérer ? (1 = faible, 5 = critique).",
  interest: "Quel est son intérêt à voir le projet aboutir ? (1 = nul, 5 = très fort).",
  needs: "Que veut-il obtenir concrètement du projet ?",
  concerns: "Ce qui l'inquiète ou freine son engagement.",
  contactInfo: "Email / téléphone / lien Slack (optionnel).",

  // Process steps
  stepName: "Nom court de l'étape. Verbe à l'infinitif : « Trier les emails », « Valider la réponse ».",
  stepType: "MANUAL / AUTOMATED / DECISION / VALIDATION / INPUT / OUTPUT.",
  description: "Décris brièvement ce qui se passe dans cette case du formulaire.",
  responsible: "Qui exécute concrètement cette étape ? Rôle, pas nom.",
  durationMinutes: "Durée moyenne en minutes (estimation honnête).",
  volume: "Combien de fois par jour / semaine / mois est-elle exécutée ?",
  position: "Ordre dans le workflow (0 = premier, croissant ensuite).",
  isPainPoint: "Coche si cette étape est ressentie comme une douleur (lenteur, erreurs, frustration).",

  // Irritants
  title: "Titre court et parlant : « 40% du temps perdu à lire les emails ».",
  irritantType: "DELAY / QUALITY / RISK / COMPLIANCE / COST / EXPERIENCE / OTHER — choisis le plus représentatif.",
  severity: "LOW (gênant) / MEDIUM (régulier) / HIGH (critique) / CRITICAL (bloquant).",
  frequency: "À quelle fréquence ce problème apparaît ? (RARE, OCCASIONAL, FREQUENT, CONSTANT).",
  source: "D'où vient l'info ? (INTERVIEW agent, OBSERVATION, REPORT, DATA, OTHER).",
  evidence: "Citation, chiffre, exemple concret qui prouve l'irritant.",
  affectedActors: "Qui subit ? (un par ligne — ex. agents, usagers, manager).",
  rootCause: "Cause profonde si tu la connais (sinon, laisse vide — on creusera atelier 2).",

  // KPIs baseline
  name: "Nom court et stable du KPI ou de l'élément (réutilisable dans plusieurs ateliers).",
  unit: "Unité : %, jours, min, €, n. Choisis l'unité finale du sponsor.",
  currentValue: "Valeur ACTUELLE mesurée. Si pas mesuré, écris l'estimation + note 'estimation'.",
  targetValue: "Valeur CIBLE engageante mais réaliste. Validée par le sponsor.",
  measureStatus: "MEASURED (mesuré), ESTIMATED (estimé), TO_MEASURE (à mesurer), UNKNOWN.",
  notes: "Méthodologie de mesure, hypothèses, points d'attention.",

  // Qualification
  directionConcerned: "Direction métier qui porte le projet.",
  businessOwner: "Sponsor opérationnel — la personne qui prendra la décision GO/NO-GO.",
  workshopDate: "Date du premier atelier de cadrage.",
  workshopParticipants: "Liste des participants à l'atelier (JSON ou ligne par participant).",

  // Scope / périmètre
  inScope: "Ce qui est DANS le périmètre (un élément par ligne).",
  outOfScope: "Ce qui est EXPLICITEMENT EXCLU (un par ligne) — évite les malentendus en COPIL.",
  prerequisites: "Pré-requis avant de démarrer (données, accès, accords).",
  exclusionsRationale: "Pourquoi ces exclusions ? Justifie en 1-2 phrases.",

  // Objectifs
  measurableTarget: "Cible chiffrée (KPI + valeur) pour l'objectif.",
  priority: "LOW / MEDIUM / HIGH. Garde HIGH rare.",
  horizon: "SHORT (≤ 6 mois), MEDIUM (6-18 mois), LONG (> 18 mois).",

  // Impacts métier
  impactType: "TIME (temps), QUALITY (qualité), COST (coût), COMPLIANCE (conformité), EXPERIENCE (expérience), OTHER.",
  magnitude: "LOW / MEDIUM / HIGH / CRITICAL.",
  quantification: "Chiffrage : « ~ 2h/jour/agent », « 15% des dossiers », etc.",
  affectedScope: "Sur qui / quoi porte l'impact ? (équipe, service, usager final).",

  // Hypothèses
  category: "Catégorie : DATA, USAGE, REGULATION, ORGANIZATION, TECHNICAL, OTHER.",
  confidence: "Confiance que cette hypothèse soit vraie (1 = très faible, 5 = très forte).",
  validationMethod: "Comment vas-tu vérifier ? (interview, mesure, POC, audit).",

  // Incertitudes
  uncertaintyType: "DATA, USAGE, REGULATION, ORGANIZATION, TECHNICAL, MARKET, OTHER.",
  impactIfWrong: "Quel impact si on se trompe ? (LOW, MEDIUM, HIGH, CRITICAL).",
  mitigation: "Comment réduire le risque ? Plan de mitigation.",

  // Contraintes
  constraintType: "BUDGET / TIMELINE / REGULATORY / TECHNICAL / ORGANIZATIONAL / DATA / OTHER.",
  constraintDescription: "Décris la contrainte précisément.",
  isBlocking: "Coche si la contrainte est BLOQUANTE (interdit d'avancer sans la traiter).",

  // Opportunités
  opportunityType: "QUICK_WIN, STRATEGIC, EFFICIENCY, COMPLIANCE, OTHER.",
  benefit: "Bénéfice attendu chiffré ou qualitatif.",
  effort: "LOW / MEDIUM / HIGH (effort de mise en œuvre).",

  // Verbatims
  quote: "Citation EXACTE (entre guillemets). Garde le ton et le vocabulaire de l'usager/agent.",
  speakerRole: "Rôle du locuteur : « Agent de traitement », « Usager », « Manager ».",
  speakerName: "Prénom + nom (peut être anonymisé : « Agent A »).",
  sentiment: "NEGATIVE (douleur) / NEUTRAL (constat) / POSITIVE (forces).",
  theme: "Thème mot-clé court : « délai », « qualité OCR », « surcharge ».",

  // -------------------------------------------------------------
  // Atelier 3 — Cadrage IA
  // -------------------------------------------------------------
  formats: "Formats des documents (PDF, DOCX, JPG, email...) — un par ligne ou JSON.",
  structureLevel: "STRUCTURED (formulaires), MIXED, UNSTRUCTURED (texte libre).",
  exploitability: "EASY / MODERATE / HARD — qualité immédiate des documents.",
  interpretationNeeded: "Coche si le document doit être COMPRIS (pas juste lu) — déclenche NLP.",
  estimatedVolume: "Volume estimé : « 3000 docs/mois », « 200 emails/jour ».",
  ocrNeeded: "Documents scannés ou photos ? Alors OCR requis.",
  nlpNeeded: "Du texte libre à comprendre ? Alors NLP requis.",
  ragNeeded: "Besoin d'aller chercher dans une base documentaire ? Alors RAG requis.",
  complexityLevel: "Complexité documentaire globale : LOW / MEDIUM / HIGH / VERY_HIGH.",

  rgpdApplicable: "Le projet traite-t-il des données personnelles ? Si oui, RGPD applicable.",
  sensitiveDataConcerned: "Données sensibles (santé, identifiants, etc.) — déclenche obligations renforcées.",
  auditRequired: "Coche si un audit externe sera requis (CNIL, sectoriel, ISO).",
  dpoConsulted: "Coche dès que tu as une trace écrite de la consultation DPO.",
  cnilConsultation: "Consultation officielle CNIL prévue ?",
  euAiActTier: "NONE / MINIMAL / LIMITED / HIGH / UNACCEPTABLE — détermine les obligations EU AI Act.",
  euAiActJustification: "Justifie en 1-2 phrases pourquoi ce tier (ex. validation humaine = limited).",
  legalObligations: "Liste les obligations spécifiques (RGPD Art.X, CNIL Y…) — une par ligne.",

  needClarity: "1-5 — clarté du besoin reformulé, irritants identifiés, KPI cible.",
  workflowKnowledge: "1-5 — connaissance du workflow AS-IS (étapes, durées, volumes).",
  dataMaturity: "1-5 — qualité, accès, historique des données.",
  governanceMaturity: "1-5 — RACI, validations humaines, audit.",
  stakeholderAlignment: "1-5 — alignement sponsor / métier / IT / gouvernance.",
  realismLevel: "1-5 — objectifs SMART, hypothèses testées, baseline solide.",
  selfAssessmentNotes: "Notes d'auto-évaluation : justifications, écarts vs moteur, points d'attention.",

  technicallyFeasible: "1-5 — faisabilité technique (POC envisageable, briques disponibles).",
  organizationallyFeasible: "1-5 — équipe, sponsor, change management.",
  regulatorilyFeasible: "1-5 — conformité atteignable.",
  resourcesAvailable: "1-5 — budget + ressources humaines sécurisés.",
  dataAvailable: "1-5 — données accessibles et exploitables.",
  overallFeasibility: "LOW / MEDIUM / HIGH — verdict global feasibility.",
  blockingFactors: "Facteurs bloquants (un par ligne).",
  enablers: "Facteurs facilitateurs / atouts (un par ligne).",

  // -------------------------------------------------------------
  // Atelier 4 — Scoring (overrides)
  // -------------------------------------------------------------
  justification: "Pourquoi cet override manuel ? Explique brièvement le contexte qui justifie ton score.",

  // -------------------------------------------------------------
  // Atelier 6 — Gouvernance / risques / conformité
  // -------------------------------------------------------------
  scope: "Périmètre RACI : « Pilotage projet », « Validation IA », « Sécurité données »…",
  actorRole: "Rôle générique (DPO, RSSI, Sponsor) — pas un nom de personne.",
  responsibilityType: "R (Responsible) = fait / A (Accountable) = répond / C (Consulted) = avis / I (Informed) = au courant.",
  actorName: "Nom de la personne occupant le rôle (peut rester vide).",

  domain: "Domaine sécurité : AUTH / RBAC / ENCRYPTION / LOGS / SEGMENTATION / MONITORING / BACKUP / OTHER.",
  status: "Statut actuel du contrôle / item / item roadmap.",
  responsibleRole: "Rôle responsable (RSSI, DSI, DPO, manager…).",

  framework: "RGPD / EU_AI_ACT / CNIL / INTERNAL / ISO27001 / OTHER.",
  requirementCode: "Référence dans le framework : « Art. 5 », « §A.6.1 ».",
  requirement: "Énoncé de l'exigence (1 phrase claire).",

  alertThreshold: "Seuil de déclenchement d'alerte (ex. « < 90 » ou « > 5 »).",

  incidentType: "AI_HALLUCINATION / DATA_LEAK / CLASSIFICATION_ERROR / DRIFT / OUTAGE / OCR_ERROR / OTHER.",
  detectionMethod: "Comment détecte-t-on l'incident ? (monitoring, agent, SIEM…).",
  escalationPath: "Chaîne d'escalade : Qui prévient qui ? (Agent → Manager → DSI…).",
  correctiveActions: "Actions à mener immédiatement pour limiter l'impact.",
  postIncidentReview: "Post-mortem obligatoire après cet incident ?",

  overallStatement: "Phrase de synthèse exécutive — la formulation qui ira au sponsor.",
  industrializationReadiness: "Coche si la gouvernance permet l'industrialisation (score ≥ 60 + RACI OK + DPO + monitoring).",
  strongPoints: "Points forts (un par ligne).",
  weakPoints: "Points faibles (un par ligne).",
  priorityActions: "Actions prioritaires à mener avant l'atelier suivant (un par ligne).",

  // -------------------------------------------------------------
  // Atelier 7 — Vision, roadmap, industrialisation, décision
  // -------------------------------------------------------------
  visionStatement: "Énoncé de vision MÉTIER (pas techno) — c'est le pitch d'ouverture du dossier COPIL.",
  businessValue: "Valeur business chiffrée : ROI, gain temps, NPS, etc.",
  strategicObjectives: "Objectifs stratégiques mesurables (un par ligne, 3-5 max).",
  transformationGoals: "Objectifs de transformation au-delà du projet (montée en compétence, gouvernance…).",
  successCriteria: "Critères SMART de succès projet (un par ligne).",
  businessValueScore: "1-5 — Score d'impact valeur business (5 = ROI très fort, vitrine).",
  transformationScore: "1-5 — Score d'impact transformation organisationnelle.",

  phase: "Phase roadmap : POC / MVP / Pilote / Rollout / Run.",
  impact: "Impact business 1-5 (5 = critique).",
  complexity: "Complexité 1-5 (5 = très complexe à livrer).",
  effortMonths: "Effort estimé en mois (entier).",
  itemType: "QUICK_WIN / STRATEGIC / DEPENDENCY / RUN.",
  ownerRole: "Rôle responsable de cet item (CDP, RSSI, DSI…).",

  stage: "POC / MVP / PILOT / ROLLOUT / RUN.",
  readinessLevel: "Niveau de readiness 1-5 (1 = pas démarré, 5 = prêt à passer au stage suivant).",
  startTarget: "Date cible de démarrage du stage.",
  endTarget: "Date cible de fin du stage.",
  exitCriteria: "Critères SMART pour SORTIR de ce stage et passer au suivant.",

  finalDecision: "GO_IA / POC_IA / AUTOMATION / STUDY / NO_GO — décision argumentée.",
  decisionRationale: "Justification de la décision en 2-3 phrases (cite score, conditions, contraintes).",
  mainRisks: "Risques principaux résiduels (un par ligne).",
  roadmapSummary: "Résumé exécutif roadmap pour COPIL.",
  industrializationStrategy: "Stratégie d'industrialisation en 1-2 phrases (paliers, gates).",
  governanceStrategy: "Stratégie gouvernance en 1-2 phrases (comité, fréquence, acteurs).",
  pilotageStrategy: "Stratégie de pilotage en 1-2 phrases (KPI, fréquence, alertes).",
  sponsorDecision: "OK / KO / IN_REVIEW.",
  sponsorName: "Nom du sponsor + rôle (ex. « Marie Dupont — Directrice métier »).",
};

// Récupère un hint par nom de champ. Retourne `undefined` si absent
// — dans ce cas le label ne montre pas de "(i)".
export function getHint(name: string): string | undefined {
  return FIELD_HINTS[name];
}
