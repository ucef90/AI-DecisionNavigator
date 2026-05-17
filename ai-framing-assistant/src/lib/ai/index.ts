// Public entry point for the AI provider. Caches a single instance per
// process and falls back to the stub adapter if the configured provider
// can't be instantiated (missing key, bad URL...). This keeps every
// caller resilient: server actions never crash because of AI config.

import { createOpenAIAdapter } from "./adapters/openai";
import { createStubAdapter } from "./adapters/stub";
import { readProviderConfig, type AIProvider } from "./provider";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const config = readProviderConfig();
  if (config.provider === "stub") {
    cached = createStubAdapter();
    return cached;
  }
  try {
    const adapter = createOpenAIAdapter(config);
    cached = adapter.available ? adapter : createStubAdapter();
  } catch {
    cached = createStubAdapter();
  }
  return cached;
}

// For tests / settings page: force a refresh after env changes.
export function resetAIProvider(): void {
  cached = null;
}

export type { AIProvider, ChatMessage, CompletionRequest, CompletionResult } from "./provider";
export type { ProviderConfig, ProviderId } from "./provider";
export { readProviderConfig } from "./provider";
