import type { AIProvider, CompletionRequest, CompletionResult } from "../provider";

// Stub provider. Returns deterministic, template-based responses so the
// app remains useful when no API key is configured. The shape mirrors a
// real provider response, so callers can always trust the contract.
//
// Each skill (reformulate, challenge, suggest-kpis, detect-bias) calls
// this with a "system" message containing the skill id, which lets the
// stub branch on intent. See src/lib/ai/skills/* for the few callers.

export function createStubAdapter(): AIProvider {
  return {
    id: "stub",
    available: true,
    async complete(req: CompletionRequest): Promise<CompletionResult> {
      const sys = req.messages.find((m) => m.role === "system")?.content ?? "";
      const user = req.messages.find((m) => m.role === "user")?.content ?? "";
      const text = template(sys, user, req.jsonMode === true);
      return { text, fromLlm: false, provider: "stub" };
    },
  };
}

function template(systemPrompt: string, userPrompt: string, jsonMode: boolean): string {
  const skill = detectSkill(systemPrompt);

  if (jsonMode) {
    switch (skill) {
      case "detect-solution-bias":
        return JSON.stringify(detectSolutionBiasStub(userPrompt));
      case "suggest-kpis":
        return JSON.stringify(suggestKpisStub(userPrompt));
      case "extract-actors":
        return JSON.stringify(extractActorsStub(userPrompt));
      case "challenge":
        return JSON.stringify({ challenges: challengeStub(userPrompt) });
      case "reformulate":
        return JSON.stringify({ reformulation: reformulateStub(userPrompt) });
      default:
        return JSON.stringify({ note: "stub", input: truncate(userPrompt, 200) });
    }
  }

  switch (skill) {
    case "reformulate":
      return reformulateStub(userPrompt);
    case "challenge":
      return challengeStub(userPrompt).join("\n");
    default:
      return [
        "Coach IA non configuré (mode stub).",
        "",
        "Pour activer un vrai LLM : ouvre /settings et choisis un provider.",
      ].join("\n");
  }
}

function detectSkill(systemPrompt: string): string {
  const m = systemPrompt.match(/SKILL:([a-z-]+)/i);
  return m ? m[1].toLowerCase() : "generic";
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

// -------------- skill stubs --------------

function reformulateStub(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "Décrivez d'abord le problème (sans nommer de techno).";
  // Strip solution-oriented preambles
  const stripped = trimmed
    .replace(/^(nous voulons|on veut|je veux|on souhaite|nous souhaitons)\s+/i, "")
    .replace(/\b(une|un|du|de l'?|des)\s+(ia|chatbot|agent ia|llm|rag|automatisation)\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `Reformulation proposée : « ${capitalize(stripped)} » — décrivez l'objectif métier mesurable, pas la solution.`;
}

function challengeStub(input: string): string[] {
  const out: string[] = [];
  if (/\bIA|chatbot|LLM|automatisation\b/i.test(input)) {
    out.push("Vous décrivez une solution, pas un problème. Quel est l'irritant à résoudre ?");
  }
  if (input.trim().length < 80) {
    out.push("La formulation est très courte — précisez les utilisateurs et la valeur attendue.");
  }
  if (!/\d/.test(input)) {
    out.push("Aucune donnée chiffrée : quel volume, quel délai, quelle fréquence ?");
  }
  if (out.length === 0) {
    out.push("Aucune alerte évidente. Pensez à challenger l'hypothèse implicite que ce problème existe vraiment chez tous les acteurs.");
  }
  return out;
}

function suggestKpisStub(input: string): { suggestions: { name: string; unit: string }[] } {
  const lower = input.toLowerCase();
  const seeds: { name: string; unit: string }[] = [];
  if (/email|courrier|message/.test(lower)) {
    seeds.push({ name: "Temps moyen de traitement par email", unit: "min" });
    seeds.push({ name: "Taux de classification correcte", unit: "%" });
    seeds.push({ name: "Délai moyen de réponse usager", unit: "h" });
  }
  if (/document|piece|justificatif|dossier/.test(lower)) {
    seeds.push({ name: "Temps moyen de constitution dossier", unit: "min" });
    seeds.push({ name: "Taux de dossier complet à la 1re soumission", unit: "%" });
  }
  if (/usager|client|citoyen/.test(lower)) {
    seeds.push({ name: "Satisfaction usager (NPS)", unit: "score" });
  }
  if (seeds.length === 0) {
    seeds.push({ name: "Temps moyen de traitement", unit: "min" });
    seeds.push({ name: "Taux d'erreur", unit: "%" });
    seeds.push({ name: "Volume traité par agent / jour", unit: "n" });
  }
  return { suggestions: seeds };
}

function extractActorsStub(input: string): { actors: { name: string; category: string }[] } {
  const out: { name: string; category: string }[] = [];
  const lower = input.toLowerCase();
  if (/agent|gestionnaire|opérateur/.test(lower)) out.push({ name: "Agent de traitement", category: "AGENT" });
  if (/usager|client|citoyen|demandeur/.test(lower)) out.push({ name: "Usager / demandeur", category: "USER" });
  if (/manager|responsable|chef/.test(lower)) out.push({ name: "Manager métier", category: "MANAGER" });
  if (/dsi|si|système|informatique/.test(lower)) out.push({ name: "DSI", category: "IT" });
  if (/data|donnée|rgpd|dpo/.test(lower)) out.push({ name: "DPO / Data", category: "GOVERNANCE" });
  if (out.length === 0) {
    out.push({ name: "Agent de traitement", category: "AGENT" });
    out.push({ name: "Usager", category: "USER" });
  }
  return { actors: out };
}

function detectSolutionBiasStub(input: string): {
  biasDetected: boolean;
  patterns: string[];
  rephrasings: string[];
} {
  const patterns: string[] = [];
  const lower = input.toLowerCase();
  const checks: { re: RegExp; label: string }[] = [
    { re: /\bnous voulons (de l'?ia|un chatbot|un agent ia|un llm|un rag)\b/i, label: "solution imposée (IA/chatbot/agent…)" },
    { re: /\bautomatiser (avec|via) (l'?ia|une ia)\b/i, label: "techno annoncée avant le problème" },
    { re: /\bmettre en place (un|une) (chatbot|llm|rag|agent)\b/i, label: "outil pré-choisi" },
    { re: /\bgenai|gpt|copilot\b/i, label: "techno spécifique mentionnée" },
  ];
  for (const c of checks) if (c.re.test(input)) patterns.push(c.label);
  const biasDetected = patterns.length > 0 || /\bia\b/i.test(lower);
  return {
    biasDetected,
    patterns,
    rephrasings: biasDetected
      ? [
          "Reformulez en partant de l'irritant métier observé.",
          "Décrivez ce que les agents ou usagers vivent aujourd'hui.",
          "Précisez l'objectif mesurable (temps, qualité, satisfaction) avant toute techno.",
        ]
      : [],
  };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
