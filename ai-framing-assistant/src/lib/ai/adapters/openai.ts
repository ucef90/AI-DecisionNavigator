import type { AIProvider, CompletionRequest, CompletionResult, ProviderConfig } from "../provider";

// OpenAI-compatible adapter. Works for:
//   - OpenAI (api.openai.com/v1)
//   - Azure OpenAI (with deployment + api-version)
//   - Mistral La Plateforme (api.mistral.ai/v1, same chat-completions shape)
//   - Ollama (http://host:11434/v1 with OPENAI_API_KEY=ollama)
//
// Endpoints differ only in how the URL is composed; the request body is
// identical, which keeps this adapter small.

export function createOpenAIAdapter(config: ProviderConfig): AIProvider {
  const id = config.provider;
  const apiKey = config.apiKey ?? "";
  const model = config.model ?? defaultModel(config);
  const { url, headers } = endpointFor(config);

  return {
    id,
    available: Boolean(model) && (config.provider === "ollama" || Boolean(apiKey)),
    async complete(req: CompletionRequest): Promise<CompletionResult> {
      const body: Record<string, unknown> = {
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      };
      if (req.maxTokens) body.max_tokens = req.maxTokens;
      if (req.jsonMode) body.response_format = { type: "json_object" };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`AI provider ${id} returned ${res.status}: ${errText.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content ?? "";
      return { text, fromLlm: true, provider: id, model };
    },
  };

  function endpointFor(c: ProviderConfig): { url: string; headers: Record<string, string> } {
    if (c.provider === "azure") {
      const base = (c.baseUrl ?? "").replace(/\/+$/, "");
      const deployment = c.azureDeployment ?? c.model ?? "";
      const apiVersion = c.azureApiVersion ?? "2024-08-01-preview";
      return {
        url: `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      };
    }
    const base = c.baseUrl ?? defaultBaseUrl(c.provider);
    return {
      url: `${base.replace(/\/+$/, "")}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || "ollama"}`,
      },
    };
  }
}

function defaultBaseUrl(provider: string): string {
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1";
    case "mistral":
      return "https://api.mistral.ai/v1";
    case "ollama":
      return "http://localhost:11434/v1";
    default:
      return "https://api.openai.com/v1";
  }
}

function defaultModel(c: ProviderConfig): string {
  switch (c.provider) {
    case "openai":
      return "gpt-4o-mini";
    case "azure":
      return c.azureDeployment ?? "";
    case "mistral":
      return "mistral-small-latest";
    case "ollama":
      return "llama3.1";
    default:
      return "";
  }
}
