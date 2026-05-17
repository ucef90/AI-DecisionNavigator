// Engine "next step" — détecte automatiquement où le CDP en est
// dans les 7 ateliers et propose la prochaine action concrète.
//
// Logique : on parcourt les ateliers dans l'ordre, on regarde
// chaque gate. Le 1er gate non validé indique l'atelier en cours.
// On en déduit la section pivot ou la première section à attaquer.

import { prisma } from "@/lib/prisma";

export type NextStep = {
  /** N° d'atelier (1..7) ou null si tout est terminé */
  atelier: number | null;
  /** Titre court de l'étape */
  title: string;
  /** Description "consultant" : que faire et pourquoi */
  description: string;
  /** URL à ouvrir */
  url: string;
  /** Libellé du bouton CTA */
  ctaLabel: string;
  /** Mode : DISCOVER (1er passage) | CONTINUE (en cours) | GATE (gate à valider) | DONE (terminé) */
  mode: "DISCOVER" | "CONTINUE" | "GATE" | "DONE";
  /** Optionnel : % d'avancement global du projet (0..100) */
  overallProgress?: number;
};

export async function computeNextStep(projectId: string): Promise<NextStep> {
  // On lit en une fois les gates + quelques compteurs pour décider.
  const [
    project,
    a1Gate,
    a2Gate,
    a3Gate,
    a4Gate,
    a5Gate,
    a6Gate,
    a7Gate,
    actorsCount,
    taskQualCount,
  ] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true } }),
    prisma.atelier1Gate.findUnique({ where: { projectId } }),
    prisma.atelier2Gate.findUnique({ where: { projectId } }),
    prisma.atelier3Gate.findUnique({ where: { projectId } }),
    prisma.atelier4Gate.findUnique({ where: { projectId } }),
    prisma.atelier5Gate.findUnique({ where: { projectId } }),
    prisma.atelier6Gate.findUnique({ where: { projectId } }),
    prisma.atelier7Gate.findUnique({ where: { projectId } }),
    prisma.businessActor.count({ where: { projectId } }),
    prisma.taskQualification.count({ where: { projectId } }),
  ]);

  if (!project) {
    return {
      atelier: null,
      title: "Projet introuvable",
      description: "Le projet n'existe pas ou plus.",
      url: "/projects",
      ctaLabel: "Liste des projets",
      mode: "DONE",
    };
  }

  // Helper : un gate est "passed" s'il est READY ou OVERRIDE (ou CLOSED pour atelier 7)
  const isPassed = (g: { verdict: string } | null, passVal: string[]): boolean =>
    Boolean(g && passVal.includes(g.verdict));

  // Estimation grossière d'avancement (gates passés / 7)
  const passedCount =
    Number(isPassed(a1Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a2Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a3Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a4Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a5Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a6Gate, ["READY", "OVERRIDE"])) +
    Number(isPassed(a7Gate, ["CLOSED", "OVERRIDE"]));
  const overallProgress = Math.round((passedCount / 7) * 100);

  const base = `/projects/${projectId}`;

  // Cas 0 : tout neuf — pas même un acteur saisi → "Discover"
  if (actorsCount === 0 && taskQualCount === 0 && !a1Gate) {
    return {
      atelier: 1,
      title: "Bienvenue — commence par l'atelier 1",
      description:
        "L'application va te guider en 7 ateliers. Commence par comprendre le vrai problème métier — sans parler de techno.",
      url: `${base}/atelier/1`,
      ctaLabel: "Démarrer l'atelier 1",
      mode: "DISCOVER",
      overallProgress,
    };
  }

  // Cas 1 — Atelier 1 non validé
  if (!isPassed(a1Gate, ["READY", "OVERRIDE"])) {
    const advanced = actorsCount >= 3 || (a1Gate && a1Gate.atLeastThreeIrritants);
    return {
      atelier: 1,
      title: advanced ? "Termine l'atelier 1 — valide le gate" : "Continue l'atelier 1",
      description: advanced
        ? "Les données sont bien avancées. Va sur le gate pour valider les 5 critères et passer à l'atelier 2."
        : "Cartographie acteurs, workflow AS-IS, irritants chiffrés, KPI baseline, périmètre validé sponsor.",
      url: advanced ? `${base}/atelier/1/gate` : `${base}/atelier/1`,
      ctaLabel: advanced ? "Valider le gate atelier 1" : "Ouvrir l'atelier 1",
      mode: advanced ? "GATE" : "CONTINUE",
      overallProgress,
    };
  }

  // Cas 2 — Atelier 2 non validé
  if (!isPassed(a2Gate, ["READY", "OVERRIDE"])) {
    const advanced = taskQualCount >= 3;
    return {
      atelier: 2,
      title: advanced ? "Termine l'atelier 2 — valide le gate" : "Atelier 2 : matrice IA vs auto",
      description: advanced
        ? "La matrice est bien remplie. Valide les besoins d'intelligence et le gate."
        : "Pour chaque tâche du workflow, choisis : automatisation / IA / humain / hybride. Avec justification.",
      url: advanced ? `${base}/atelier/2/gate` : `${base}/atelier/2/matrix`,
      ctaLabel: advanced ? "Valider le gate atelier 2" : "Ouvrir la matrice",
      mode: advanced ? "GATE" : "CONTINUE",
      overallProgress,
    };
  }

  // Cas 3 — Atelier 3 non validé
  if (!isPassed(a3Gate, ["READY", "OVERRIDE"])) {
    return {
      atelier: 3,
      title: "Atelier 3 : consolidation et cadrage IA",
      description:
        "L'atelier 3 lit ce qui a été collecté avant et te demande seulement les compléments réels : documentaire, réglementaire, maturité, faisabilité.",
      url: `${base}/atelier/3/coverage`,
      ctaLabel: "Voir la vue de couverture",
      mode: "CONTINUE",
      overallProgress,
    };
  }

  // Cas 4 — Atelier 4 non validé
  if (!isPassed(a4Gate, ["READY", "OVERRIDE"])) {
    return {
      atelier: 4,
      title: "Atelier 4 : scoring et décision recommandée",
      description:
        "11 axes auto-calculés depuis tes ateliers 1-3. Survole, ajuste, justifie, et obtiens ta décision IA argumentée.",
      url: `${base}/atelier/4/cockpit`,
      ctaLabel: "Ouvrir le cockpit scoring",
      mode: "CONTINUE",
      overallProgress,
    };
  }

  // Cas 5 — Atelier 5 non validé
  if (!isPassed(a5Gate, ["READY", "OVERRIDE"])) {
    return {
      atelier: 5,
      title: "Atelier 5 : cartographie IA complète",
      description:
        "6 cartographies (métier, workflow, data, IA, risques, gouvernance) auto-générées. Annote les nœuds critiques pour l'atelier 6.",
      url: `${base}/atelier/5/overview`,
      ctaLabel: "Voir les 6 cartographies",
      mode: "CONTINUE",
      overallProgress,
    };
  }

  // Cas 6 — Atelier 6 non validé
  if (!isPassed(a6Gate, ["READY", "OVERRIDE"])) {
    return {
      atelier: 6,
      title: "Atelier 6 : gouvernance, risques, conformité",
      description:
        "RACI, heatmap risques, contrôles sécurité, conformité RGPD/EU AI Act, monitoring, incidents — un cockpit gouvernance prêt pour COPIL.",
      url: `${base}/atelier/6/cockpit`,
      ctaLabel: "Ouvrir le cockpit gouvernance",
      mode: "CONTINUE",
      overallProgress,
    };
  }

  // Cas 7 — Atelier 7 non clôturé
  if (!isPassed(a7Gate, ["CLOSED", "OVERRIDE"])) {
    return {
      atelier: 7,
      title: "Atelier 7 : architecture cible, roadmap, décision finale",
      description:
        "Vision, roadmap Gantt, matrice priorisation, décision finale et dossier markdown exportable. Le sommet du framework.",
      url: `${base}/atelier/7/executive-cockpit`,
      ctaLabel: "Ouvrir le cockpit exécutif",
      mode: "CONTINUE",
      overallProgress,
    };
  }

  // Tout est fait
  return {
    atelier: null,
    title: "Framework complet — exporte le dossier",
    description:
      "Les 7 ateliers sont validés. Génère le dossier stratégique consolidé prêt à présenter en COPIL.",
    url: `${base}/atelier/7/deliverable`,
    ctaLabel: "Exporter le dossier",
    mode: "DONE",
    overallProgress: 100,
  };
}
