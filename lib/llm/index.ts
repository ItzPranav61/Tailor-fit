import { GeminiProvider } from "./gemini-provider";
import { OpenAiProvider } from "./openai-provider";
import type { LlmProvider, TailorRequest } from "./types";

type ProviderName = "gemini" | "openai";

function isProviderName(value: string): value is ProviderName {
  return value === "gemini" || value === "openai";
}

function createProvider(name: ProviderName): LlmProvider {
  if (name === "openai") {
    return new OpenAiProvider();
  }

  return new GeminiProvider();
}

class FallbackProvider implements LlmProvider {
  constructor(
    private readonly primary: LlmProvider,
    private readonly fallback?: LlmProvider,
  ) {}

  async tailor(input: TailorRequest) {
    try {
      return await this.primary.tailor(input);
    } catch (error) {
      if (!this.fallback) {
        throw error;
      }

      console.warn("Primary LLM provider failed; trying fallback provider.");
      return this.fallback.tailor(input);
    }
  }
}

export function getLlmProvider(): LlmProvider {
  const primaryName = process.env.LLM_PROVIDER || "gemini";
  const fallbackName = process.env.LLM_FALLBACK_PROVIDER;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!isProviderName(primaryName)) {
    throw new Error(`Unsupported LLM_PROVIDER: ${primaryName}`);
  }

  console.info("[Tailor Fit] LLM provider selected", {
    GEMINI_API_KEY_EXISTS: Boolean(process.env.GEMINI_API_KEY),
    GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL,
    GEMINI_MODEL: geminiModel,
    LLM_PROVIDER: primaryName,
  });

  const fallback =
    fallbackName && isProviderName(fallbackName) && fallbackName !== primaryName
      ? createProvider(fallbackName)
      : undefined;

  return new FallbackProvider(createProvider(primaryName), fallback);
}
