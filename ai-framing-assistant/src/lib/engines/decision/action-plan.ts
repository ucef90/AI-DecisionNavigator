// Action plan generator — converts a decision result into an ordered set
// of next steps the team can execute.
//
// Reference: SPEC.MD §201 ("plan d'action"). Each step has an owner role,
// a category, and an estimated horizon — those are heuristics, not commitments.

import type { Decision, UserRole } from "@/types";
import type { DecisionResult } from "./rules";
import type { ProjectSnapshot, Signal } from "@/lib/engines/types";

export type ActionStep = {
  id: string;
  order: number;
  title: string;
  detail: string;
  owner: UserRole;
  category: "BUSINESS" | "DATA" | "TECH" | "GOVERNANCE" | "PILOT";
  horizon: "IMMEDIATE" | "SHORT" | "MEDIUM"; // <2sem / <2mois / >2mois
};

export type ActionPlan = {
  decision: Decision;
  steps: ActionStep[];
};

export function buildActionPlan(
  snapshot: ProjectSnapshot,
  decision: DecisionResult,
): ActionPlan {
  const steps: ActionStep[] = [];
  let order = 0;
  const push = (s: Omit<ActionStep, "order">) =>
    steps.push({ ...s, order: ++order });

  // 1. Resolve blockers first — they short-circuit any forward motion.
  for (const blocker of decision.blockers) {
    push(stepFromBlocker(blocker));
  }

  // 2. Decision-specific tracks.
  switch (decision.decision) {
    case "GO_IA":
      pushGoIASteps(snapshot, push);
      break;
    case "POC_IA":
      pushPocSteps(snapshot, push);
      break;
    case "AUTOMATION":
      pushAutomationSteps(push);
      break;
    case "STUDY":
      pushStudySteps(snapshot, push);
      break;
    case "NO_GO":
      pushNoGoSteps(push);
      break;
  }

  // 3. Cross-cutting reminders (governance + adoption) when relevant.
  if (snapshot.dataAssessment?.personalData) {
    push({
      id: "gov.dpo-loop",
      title: "Itération DPO / RSSI",
      detail:
        "Programmer une revue de conformité avec le DPO et la sécurité avant d'instrumenter de la production.",
      owner: "GOVERNANCE",
      category: "GOVERNANCE",
      horizon: "SHORT",
    });
  }

  if (!snapshot.architecture?.traceability) {
    push({
      id: "tech.traceability",
      title: "Définir la traçabilité",
      detail:
        "Préciser les logs, audit-trails et explicabilité attendus pour les décisions IA.",
      owner: "IT",
      category: "GOVERNANCE",
      horizon: "SHORT",
    });
  }

  return { decision: decision.decision, steps };
}

function stepFromBlocker(b: Signal): Omit<ActionStep, "order"> {
  return {
    id: "blk." + b.id,
    title: `Lever le bloquant : ${b.title}`,
    detail: b.detail,
    owner: b.category === "GOVERNANCE" || b.category === "RISK" ? "GOVERNANCE" : "PROJECT_MANAGER",
    category: "GOVERNANCE",
    horizon: "IMMEDIATE",
  };
}

function pushGoIASteps(
  snap: ProjectSnapshot,
  push: (s: Omit<ActionStep, "order">) => void,
) {
  push({
    id: "go.kickoff",
    title: "Kickoff projet IA",
    detail: "Lancer l'équipe, valider sponsor, sécuriser budget et planning.",
    owner: "PROJECT_MANAGER",
    category: "PILOT",
    horizon: "IMMEDIATE",
  });
  push({
    id: "go.archi",
    title: "Finaliser l'architecture cible",
    detail: `Confirmer l'approche ${snap.aiAnalysis?.recommendedApproach ?? "retenue"} et les intégrations SI.`,
    owner: "IT",
    category: "TECH",
    horizon: "SHORT",
  });
  push({
    id: "go.kpi",
    title: "Instrumenter les KPIs métier",
    detail:
      "Définir les KPIs de suivi (qualité, latence, satisfaction) et leur baseline avant mise en production.",
    owner: "BUSINESS",
    category: "BUSINESS",
    horizon: "SHORT",
  });
}

function pushPocSteps(
  snap: ProjectSnapshot,
  push: (s: Omit<ActionStep, "order">) => void,
) {
  push({
    id: "poc.scope",
    title: "Définir le périmètre du POC",
    detail:
      "Choisir 1 à 2 cas d'usage, critères de succès chiffrés (précision, temps de traitement, coût).",
    owner: "PROJECT_MANAGER",
    category: "PILOT",
    horizon: "IMMEDIATE",
  });
  push({
    id: "poc.data",
    title: "Constituer un jeu de données POC",
    detail:
      "Échantillonner les données nécessaires en environnement contrôlé, traçabilité RGPD documentée.",
    owner: "DATA",
    category: "DATA",
    horizon: "SHORT",
  });
  push({
    id: "poc.guardrails",
    title: "Définir les garde-fous",
    detail:
      "Supervision humaine, plan de remédiation en cas d'hallucination/erreur, métriques de qualité.",
    owner: "GOVERNANCE",
    category: "GOVERNANCE",
    horizon: "SHORT",
  });
  if (snap.aiAnalysis?.recommendedApproach) {
    push({
      id: "poc.tech",
      title: `Prototyper l'approche ${snap.aiAnalysis.recommendedApproach}`,
      detail: "Construire un démonstrateur isolé sur 4 à 6 semaines.",
      owner: "IT",
      category: "TECH",
      horizon: "MEDIUM",
    });
  }
}

function pushAutomationSteps(push: (s: Omit<ActionStep, "order">) => void) {
  push({
    id: "auto.bpm",
    title: "Cadrer l'automatisation",
    detail: "Documenter les règles métiers, choisir un BPM/iPaaS (Power Automate, n8n, etc.).",
    owner: "BUSINESS",
    category: "BUSINESS",
    horizon: "SHORT",
  });
  push({
    id: "auto.delivery",
    title: "Industrialiser le workflow",
    detail: "Livrer un workflow automatisé sans IA, simple à maintenir.",
    owner: "IT",
    category: "TECH",
    horizon: "MEDIUM",
  });
}

function pushStudySteps(
  snap: ProjectSnapshot,
  push: (s: Omit<ActionStep, "order">) => void,
) {
  push({
    id: "study.reform",
    title: "Reformuler le besoin métier",
    detail:
      "Atelier de cadrage avec les sponsors : reformuler en termes de problème, valeur et utilisateurs.",
    owner: "BUSINESS",
    category: "BUSINESS",
    horizon: "IMMEDIATE",
  });
  if (snap.dataAssessment?.dataSources.length === 0) {
    push({
      id: "study.data-mapping",
      title: "Cartographier les données disponibles",
      detail: "Lister sources, formats, fréquence, qualité, droits d'accès.",
      owner: "DATA",
      category: "DATA",
      horizon: "SHORT",
    });
  }
  push({
    id: "study.benchmark",
    title: "Benchmark approches non-IA",
    detail: "Comparer à des alternatives (RPA, workflow, règles) avant d'engager du ML.",
    owner: "IT",
    category: "TECH",
    horizon: "SHORT",
  });
}

function pushNoGoSteps(push: (s: Omit<ActionStep, "order">) => void) {
  push({
    id: "nogo.communicate",
    title: "Documenter le NO GO",
    detail:
      "Transmettre aux sponsors les motifs (risque, conformité, faisabilité) et les conditions de réouverture.",
    owner: "PROJECT_MANAGER",
    category: "GOVERNANCE",
    horizon: "IMMEDIATE",
  });
  push({
    id: "nogo.alt",
    title: "Étudier une alternative",
    detail: "Reformuler le besoin et proposer une solution non-IA ou un autre périmètre.",
    owner: "BUSINESS",
    category: "BUSINESS",
    horizon: "SHORT",
  });
}
