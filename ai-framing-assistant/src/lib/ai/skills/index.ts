// AI skills — high-level functions called by atelier 1 sections.
//
// Each skill builds a tight system prompt (with a SKILL:<id> tag so the
// stub adapter can branch), calls the provider in JSON mode, and parses
// the result against a known shape. If parsing fails we fall back to a
// safe default so the UI never blows up.

import { getAIProvider } from "../index";

const SYSTEM_BASE = [
  "Tu es un consultant senior en cadrage de projets IA dans le secteur public et privé.",
  "Tu réponds en français, avec un ton professionnel, concis, factuel.",
  "Tu ne proposes JAMAIS une techno avant que le problème métier soit clarifié.",
].join(" ");

function safeJSON<T>(text: string, fallback: T): T {
  try {
    const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

// -------------------------------------------------------------
// Skill: reformulate — transforme une demande vague en
// problème métier sans techno.
// -------------------------------------------------------------
export type ReformulationResult = {
  reformulation: string;
  fromLlm: boolean;
};

export async function reformulateBusinessNeed(input: string): Promise<ReformulationResult> {
  const provider = getAIProvider();
  const res = await provider.complete({
    jsonMode: true,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_BASE}\nSKILL:reformulate\nObjectif: reformuler la demande en problème métier mesurable, sans mention de techno.\nRetourne strictement: {"reformulation": string}.`,
      },
      { role: "user", content: input },
    ],
  });
  const parsed = safeJSON<{ reformulation?: string }>(res.text, {});
  return {
    reformulation: parsed.reformulation?.trim() || (res.fromLlm ? "" : res.text),
    fromLlm: res.fromLlm,
  };
}

// -------------------------------------------------------------
// Skill: detect-solution-bias — détecte les formulations
// "nous voulons de l'IA / un chatbot / …" et propose comment
// reformuler.
// -------------------------------------------------------------
export type SolutionBiasResult = {
  biasDetected: boolean;
  patterns: string[];
  rephrasings: string[];
  fromLlm: boolean;
};

export async function detectSolutionBias(input: string): Promise<SolutionBiasResult> {
  const provider = getAIProvider();
  const res = await provider.complete({
    jsonMode: true,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_BASE}\nSKILL:detect-solution-bias\nDétecte si la formulation impose déjà une techno (IA, chatbot, RAG, agent, automatisation…) au lieu de décrire un problème métier.\nRetourne strictement: {"biasDetected": boolean, "patterns": string[], "rephrasings": string[]}.`,
      },
      { role: "user", content: input },
    ],
  });
  const parsed = safeJSON<{ biasDetected?: boolean; patterns?: string[]; rephrasings?: string[] }>(
    res.text,
    {},
  );
  return {
    biasDetected: Boolean(parsed.biasDetected),
    patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
    rephrasings: Array.isArray(parsed.rephrasings) ? parsed.rephrasings : [],
    fromLlm: res.fromLlm,
  };
}

// -------------------------------------------------------------
// Skill: challenge — challenger une réponse pour faire émerger
// les implicites.
// -------------------------------------------------------------
export type ChallengeResult = {
  challenges: string[];
  fromLlm: boolean;
};

export async function challengeAnswer(input: string, context?: string): Promise<ChallengeResult> {
  const provider = getAIProvider();
  const res = await provider.complete({
    jsonMode: true,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_BASE}\nSKILL:challenge\nChallenge cette réponse : pose 2 à 4 questions courtes qui aident à révéler les implicites, contradictions ou angles morts. Format strict: {"challenges": string[]}.`,
      },
      { role: "user", content: context ? `${context}\n\n---\n${input}` : input },
    ],
  });
  const parsed = safeJSON<{ challenges?: string[] }>(res.text, {});
  return {
    challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
    fromLlm: res.fromLlm,
  };
}

// -------------------------------------------------------------
// Skill: suggest-kpis — propose des KPI candidats à partir du
// contexte (besoin + activité).
// -------------------------------------------------------------
export type KpiSuggestion = { name: string; unit: string };
export type SuggestKpisResult = {
  suggestions: KpiSuggestion[];
  fromLlm: boolean;
};

export async function suggestKpis(context: string): Promise<SuggestKpisResult> {
  const provider = getAIProvider();
  const res = await provider.complete({
    jsonMode: true,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_BASE}\nSKILL:suggest-kpis\nPropose 4 à 6 KPI métier mesurables (avec leur unité) adaptés au contexte décrit. Format strict: {"suggestions": [{"name": string, "unit": string}]}.`,
      },
      { role: "user", content: context },
    ],
  });
  const parsed = safeJSON<{ suggestions?: KpiSuggestion[] }>(res.text, {});
  return {
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    fromLlm: res.fromLlm,
  };
}

// -------------------------------------------------------------
// Skill: extract-actors — extrait les acteurs probables à
// partir d'une description libre (pour pré-remplir la
// cartographie des acteurs).
// -------------------------------------------------------------
export type ActorSuggestion = { name: string; category: string };
export type ExtractActorsResult = {
  actors: ActorSuggestion[];
  fromLlm: boolean;
};

export async function extractActors(context: string): Promise<ExtractActorsResult> {
  const provider = getAIProvider();
  const res = await provider.complete({
    jsonMode: true,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_BASE}\nSKILL:extract-actors\nExtrait les acteurs probables (utilisateurs, agents, managers, sponsors, IT, data, gouvernance, externes).\nCategory ∈ {USER, AGENT, MANAGER, SPONSOR, IT, DATA, GOVERNANCE, EXTERNAL}.\nFormat strict: {"actors": [{"name": string, "category": string}]}.`,
      },
      { role: "user", content: context },
    ],
  });
  const parsed = safeJSON<{ actors?: ActorSuggestion[] }>(res.text, {});
  return {
    actors: Array.isArray(parsed.actors) ? parsed.actors : [],
    fromLlm: res.fromLlm,
  };
}
