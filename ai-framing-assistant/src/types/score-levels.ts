// Échelle de notation 1..5 utilisée transversalement par les
// ateliers (maturité, faisabilité, scoring atelier 4).
//
// Chaque niveau a 3 ressources :
//   - label   : terme court (badge UI)
//   - color   : tonalité tailwind
//   - generic : description générique réutilisable
//
// Les descriptions SPÉCIFIQUES par axe sont stockées dans
// SCORE_LEVEL_HINTS, indexées par axe — pour qu'au moment de
// noter "Maturité gouvernance", l'utilisateur lise des
// indicateurs propres à la gouvernance, pas un texte générique.

export type ScoreValue = 1 | 2 | 3 | 4 | 5;

export type ScoreLevelMeta = {
  value: ScoreValue;
  label: string;
  short: string;
  /** Tailwind classes pour la pastille (border + bg + text) */
  classes: string;
  /** Couleur "principale" (utile pour le radar SVG) */
  hex: string;
  generic: string;
};

export const SCORE_LEVELS: Record<ScoreValue, ScoreLevelMeta> = {
  1: {
    value: 1,
    label: "Inexistant",
    short: "1",
    classes:
      "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
    hex: "#e11d48",
    generic: "Aucun élément en place. Sujet non traité.",
  },
  2: {
    value: 2,
    label: "Embryonnaire",
    short: "2",
    classes:
      "border-orange-500/40 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
    hex: "#f97316",
    generic: "Quelques éléments épars, pas structurés.",
  },
  3: {
    value: 3,
    label: "Émergent",
    short: "3",
    classes:
      "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    hex: "#f59e0b",
    generic: "Bases existantes mais pas généralisées.",
  },
  4: {
    value: 4,
    label: "Maîtrisé",
    short: "4",
    classes:
      "border-lime-500/40 bg-lime-50 text-lime-900 dark:bg-lime-950/40 dark:text-lime-100",
    hex: "#84cc16",
    generic: "Bien défini, documenté, opérationnel.",
  },
  5: {
    value: 5,
    label: "Optimisé",
    short: "5",
    classes:
      "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    hex: "#10b981",
    generic: "Excellence : mesure, amélioration continue.",
  },
};

export function scoreLevelMeta(score: ScoreValue | number | null | undefined): ScoreLevelMeta | null {
  if (score == null) return null;
  const n = Math.min(5, Math.max(1, Math.round(score))) as ScoreValue;
  return SCORE_LEVELS[n];
}

// -------------------------------------------------------------
// Hints CONTEXTUELS par axe — pour chaque niveau (1..5), un
// indicateur observable.
//
// Convention de clé d'axe : utiliser un slug stable
// (ex. "businessMaturity", "dataQuality"…)
// Les ateliers consultent ce mapping pour décorer le ScoreInput.
// -------------------------------------------------------------
export type ScoreLevelHints = Record<ScoreValue, string>;

export const SCORE_LEVEL_HINTS: Record<string, ScoreLevelHints> = {
  // ----- Atelier 4 — Scorecard projet -----
  businessMaturity: {
    1: "Besoin flou, formulé en termes de techno.",
    2: "Reformulation présente mais incomplète, sans irritants.",
    3: "Besoin reformulé, ≥ 3 irritants identifiés.",
    4: "Besoin clair, irritants quantifiés, valeur métier explicite.",
    5: "Besoin mature, KPI mesurés, périmètre validé sponsor.",
  },
  dataQuality: {
    1: "Données non identifiées ou indisponibles.",
    2: "Sources connues mais qualité non évaluée.",
    3: "Sources et qualité documentées, accès partiel.",
    4: "Qualité bonne, accès stable, historique disponible.",
    5: "Données nettoyées, mesurées en continu, gouvernance data en place.",
  },
  workflowMaturity: {
    1: "Workflow non cartographié, connaissance individuelle.",
    2: "Workflow partiellement décrit, étapes flou.",
    3: "Workflow cartographié AS-IS, ≥ 3 étapes typées.",
    4: "Workflow AS-IS et TO-BE détaillés, validés métier.",
    5: "Workflow mesuré (temps, volumes), KPI suivis en continu.",
  },
  governanceMaturity: {
    1: "Aucune gouvernance définie, responsabilités floues.",
    2: "Responsabilités partielles, pas de validation humaine prévue.",
    3: "Validations humaines identifiées, audit prévu.",
    4: "DPO consulté, audit en place, traçabilité définie.",
    5: "Gouvernance complète : RACI, supervision continue, contrôles automatisés.",
  },
  riskControl: {
    1: "Risques non identifiés.",
    2: "Quelques risques listés, sans criticité.",
    3: "Risques cartographiés par axe, niveau évalué.",
    4: "Risques avec plan de mitigation par criticité.",
    5: "Risques pilotés, suivi continu, exercices de crise.",
  },
  complexityScore: {
    1: "Complexité très élevée (très complexe = score faible).",
    2: "Complexité élevée — beaucoup d'exceptions, dépendances.",
    3: "Complexité moyenne, gérable.",
    4: "Complexité maîtrisée, peu d'exceptions.",
    5: "Cas simple, faible variabilité, peu de dépendances.",
  },
  technicalFeasibility: {
    1: "Faisabilité technique non démontrée, briques manquantes.",
    2: "Faisabilité partielle, dépendances bloquantes.",
    3: "Faisabilité confirmée sur les briques principales.",
    4: "Faisabilité validée, POC possible immédiatement.",
    5: "Faisabilité éprouvée — précédents internes / industrialisable.",
  },
  organizationalFeasibility: {
    1: "Pas de sponsor, équipe non identifiée.",
    2: "Sponsor partiel, conduite du changement absente.",
    3: "Sponsor + équipe + conduite du changement esquissée.",
    4: "Sponsor engagé, équipe formée, plan d'adoption clair.",
    5: "Organisation prête, change management éprouvé.",
  },
  regulatoryReadiness: {
    1: "Cadre réglementaire non analysé (RGPD, EU AI Act).",
    2: "Risques réglementaires identifiés mais non traités.",
    3: "DPO consulté, AI Act tier défini.",
    4: "Analyse d'impact réalisée, mesures en place.",
    5: "Conformité documentée, contrôles automatisés, monitoring continu.",
  },
  siIndependence: {
    1: "Très forte dépendance, plusieurs SI bloquants non disponibles.",
    2: "Dépendances bloquantes en cours de négociation.",
    3: "Dépendances identifiées, accès partiels.",
    4: "APIs et SI disponibles, peu de risques d'intégration.",
    5: "Architecture isolable, faibles dépendances externes.",
  },
  aiReadiness: {
    1: "Aucune compétence IA, pas de plateforme.",
    2: "Quelques expérimentations isolées, pas de cadre.",
    3: "Compétences émergentes, plateforme MLOps esquissée.",
    4: "Compétences IA opérationnelles, plateforme stable.",
    5: "Maturité IA reconnue, méthodologie outillée, gouvernance IA.",
  },

  // ----- Atelier 3 — Maturité auto-évaluée -----
  needClarity: {
    1: "Besoin formulé en techno ou demande floue.",
    2: "Reformulation tentée, manque de précision.",
    3: "Besoin reformulé, irritants identifiés.",
    4: "Besoin clair, KPI cible définis.",
    5: "Besoin mature, validé sponsor, mesuré.",
  },
  workflowKnowledge: {
    1: "Workflow inconnu, connaissance tribale.",
    2: "Quelques étapes décrites par les agents.",
    3: "Workflow cartographié AS-IS, étapes typées.",
    4: "Workflow AS-IS + TO-BE, mesuré en partie.",
    5: "Workflow mesuré (durée, volume), KPI suivis.",
  },
  dataMaturity: {
    1: "Données non identifiées ou inaccessibles.",
    2: "Sources connues, qualité incertaine.",
    3: "Sources documentées, accès organisés.",
    4: "Qualité validée, historique disponible.",
    5: "Données nettoyées, mesurées, gouvernées.",
  },
  stakeholderAlignment: {
    1: "Pas de sponsor, acteurs non identifiés.",
    2: "Sponsor partiel, acteurs en cours d'identification.",
    3: "Sponsor + acteurs cartographiés, scope partagé.",
    4: "Sponsor engagé, scope validé, comité projet.",
    5: "Alignement total : sponsor, métier, IT, gouvernance.",
  },
  realismLevel: {
    1: "Objectifs irréalistes, pas d'hypothèses challengées.",
    2: "Hypothèses listées mais non vérifiées.",
    3: "Hypothèses vérifiées partiellement, KPI atteignables.",
    4: "Hypothèses validées, KPI mesurés, plan de risque.",
    5: "Objectifs SMART, hypothèses testées, baseline solide.",
  },

  // ----- Atelier 3 — Feasibility (par axe) -----
  technicallyFeasible: {
    1: "Pas de POC envisageable, briques manquantes.",
    2: "Faisabilité incertaine sur 1+ briques.",
    3: "Faisabilité plausible sur les briques principales.",
    4: "POC réalisable immédiatement.",
    5: "Faisabilité éprouvée en interne ou marché.",
  },
  organizationallyFeasible: {
    1: "Pas d'équipe, pas de sponsor, blocage organisationnel.",
    2: "Sponsor partiel, équipe à constituer.",
    3: "Équipe et sponsor identifiés, charge à valider.",
    4: "Équipe disponible, plan d'adoption clair.",
    5: "Équipe rodée, change management maîtrisé.",
  },
  regulatorilyFeasible: {
    1: "Bloquage réglementaire non analysé.",
    2: "Risques connus, mesures non définies.",
    3: "DPO consulté, mesures esquissées.",
    4: "Conformité validée, mesures en place.",
    5: "Conformité éprouvée, audit régulier.",
  },
  resourcesAvailable: {
    1: "Pas de budget, pas de ressources humaines.",
    2: "Budget partiel, équipe non engagée.",
    3: "Budget et équipe identifiés, à confirmer.",
    4: "Budget validé, équipe engagée.",
    5: "Ressources sécurisées sur tout le cycle.",
  },
  dataAvailable: {
    1: "Données inexistantes ou inaccessibles.",
    2: "Données partiellement accessibles, qualité incertaine.",
    3: "Données accessibles, qualité à valider.",
    4: "Données disponibles, qualité validée.",
    5: "Données prêtes à l'emploi, gouvernées.",
  },

  // ----- Atelier 2 — Complexity -----
  workflowComplexity: {
    1: "Workflow simple, linéaire.",
    2: "Workflow modéré, quelques branches.",
    3: "Workflow moyen, plusieurs cas.",
    4: "Workflow complexe, nombreuses branches.",
    5: "Workflow très complexe, exceptions multiples.",
  },
  documentComplexity: {
    1: "Documents structurés, formats simples.",
    2: "Documents semi-structurés, peu de variabilité.",
    3: "Mix de formats, qualité variable.",
    4: "Documents non structurés, qualité hétérogène.",
    5: "Documents très complexes, OCR + NLP nécessaire.",
  },
  decisionComplexity: {
    1: "Décisions déterministes, règles claires.",
    2: "Quelques cas d'arbitrage humain.",
    3: "Arbitrages métier fréquents.",
    4: "Décisions complexes, multi-critères.",
    5: "Décisions très complexes, expertise métier.",
  },
  governanceComplexity: {
    1: "Gouvernance simple, peu d'acteurs.",
    2: "Gouvernance modérée.",
    3: "Plusieurs validations, contrôles à mettre en place.",
    4: "Gouvernance complexe, multi-niveaux.",
    5: "Gouvernance très exigeante (régulation, audit, RGPD).",
  },

  // ----- Atelier 7 — Vision (business / transformation) -----
  businessValue: {
    1: "Aucune valeur business identifiée, projet exploratoire.",
    2: "Valeur business floue, gain potentiel non chiffré.",
    3: "Valeur business identifiée, gain estimé approximatif.",
    4: "Valeur business chiffrée (ROI, KPI), vitrine sectorielle.",
    5: "Valeur business critique, ROI majeur, transformation stratégique.",
  },
  transformation: {
    1: "Pas de transformation organisationnelle, projet outil isolé.",
    2: "Transformation locale, 1 équipe / 1 process impactés.",
    3: "Transformation transversale sur plusieurs équipes.",
    4: "Transformation business model, montée en compétence majeure.",
    5: "Transformation systémique (gouvernance, organisation, métier, SI).",
  },

  // ----- Atelier 7 — Roadmap (impact / complexité) -----
  roadmapImpact: {
    1: "Très faible — gain marginal sur 1 cas d'usage isolé.",
    2: "Faible — amélioration ponctuelle, valeur limitée.",
    3: "Moyen — gain perceptible métier ou utilisateurs.",
    4: "Élevé — gain majeur sur KPI cibles ou expérience.",
    5: "Critique — transformation visible, ROI fort, vitrine.",
  },
  roadmapComplexity: {
    1: "Simple — outils existants, périmètre étroit, peu de dépendances.",
    2: "Faible — quelques adaptations, dépendances connues.",
    3: "Moyenne — efforts pluri-disciplinaires, intégrations standards.",
    4: "Élevée — nombreuses dépendances, change management important.",
    5: "Très complexe — refonte, multiples intégrations, risques techniques.",
  },

  // ----- Atelier 7 — Industrialisation (readiness) -----
  industrializationReadiness: {
    1: "Inexistant — POC pas démarré, aucune brique en place.",
    2: "Embryonnaire — POC en cours, validation incomplète.",
    3: "Émergent — POC validé, MVP en construction.",
    4: "Maîtrisé — pilote stable, KPI suivis, gouvernance en place.",
    5: "Optimisé — run continu, amélioration mesurée, industrialisé.",
  },
};

// Helper : retourne le hint contextuel, sinon le générique.
export function hintForAxis(axis: string, score: ScoreValue): string {
  return SCORE_LEVEL_HINTS[axis]?.[score] ?? SCORE_LEVELS[score].generic;
}
