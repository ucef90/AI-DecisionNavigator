// LLM provider abstraction.
//
// Goal: a single interface used by atelier engines (reformulation,
// challenge, KPI suggestion, signal detection) that can run against
// OpenAI / Azure / Mistral / Ollama, OR fall back to a deterministic
// "stub" mode when no key is configured — so the app stays fully
// functional out of the box without paid credentials.
//
// Why this shape: the system prompt + a structured JSON schema cover
// 90% of the atelier needs (reformulate, list, score). The few free-form
// calls go through `complete()`.

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type CompletionRequest = {
  messages: ChatMessage[];
  /** Free-form temperature. Defaults to 0.2 (consulting tone: precise, not creative). */
  temperature?: number;
  /** Maximum tokens to generate. Provider-dependent. */
  maxTokens?: number;
  /** If true, ask the provider to return strict JSON. */
  jsonMode?: boolean;
};

export type CompletionResult = {
  text: string;
  /** True when the response was returned by a real LLM, false for stub fallback. */
  fromLlm: boolean;
  /** Provider identifier used (or "stub"). */
  provider: string;
  /** Optional model identifier. */
  model?: string;
};

export interface AIProvider {
  readonly id: string;
  readonly available: boolean;
  complete(req: CompletionRequest): Promise<CompletionResult>;
}

export type ProviderId = "openai" | "azure" | "mistral" | "ollama" | "stub";

export type ProviderConfig = {
  provider: ProviderId;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
};

/** Read configuration from environment. Pure function, easy to override in tests. */
export function readProviderConfig(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  const raw = (env.AI_PROVIDER ?? "stub").toLowerCase();
  const provider: ProviderId =
    raw === "openai" || raw === "azure" || raw === "mistral" || raw === "ollama"
      ? raw
      : "stub";
  return {
    provider,
    apiKey: env.AI_API_KEY,
    baseUrl: env.AI_BASE_URL,
    model: env.AI_MODEL,
    azureDeployment: env.AI_AZURE_DEPLOYMENT,
    azureApiVersion: env.AI_AZURE_API_VERSION,
  };
}
