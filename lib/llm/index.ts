import { GeminiProvider } from "./gemini-provider";
import { GroqProvider } from "./groq-provider";
import { OpenAiProvider } from "./openai-provider";
import { offlineDemoFallback } from "./offline-fallback";
import {
  LlmProviderFailureError,
  LlmQuotaUnavailableError,
  type LlmProvider,
  type TailorRequest,
} from "./types";

type ProviderName = "gemini" | "groq" | "openai";

function isProviderName(value: string): value is ProviderName {
  return value === "gemini" || value === "groq" || value === "openai";
}

function getErrorSummary(error: unknown) {
  const errorObject =
    typeof error === "object" && error !== null
      ? (error as {
          code?: unknown;
          message?: unknown;
          name?: unknown;
          status?: unknown;
        })
      : undefined;

  const name =
    error instanceof Error
      ? error.name
      : typeof errorObject?.name === "string"
        ? errorObject.name
        : typeof error;

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof errorObject?.message === "string"
        ? errorObject.message
        : String(error);

  return {
    code: errorObject?.code,
    message: rawMessage.slice(0, 200),
    name,
    status: errorObject?.status,
  };
}

function isQuotaOrRateLimitError(error: unknown) {
  const summary = getErrorSummary(error);
  const message = summary.message.toLowerCase();
  const status = Number(summary.status);
  const code = Number(summary.code);

  return (
    status === 429 ||
    code === 429 ||
    /quota|rate.?limit|resource_exhausted/.test(message)
  );
}

function isRealProviderFailure(error: unknown) {
  const summary = getErrorSummary(error);
  const message = summary.message.toLowerCase();

  if (/api_key.*not configured|api key.*not configured/.test(message)) {
    return false;
  }

  if (error instanceof LlmProviderFailureError) {
    return true;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return [429, 500, 502, 503, 504].includes(status);
  }

  if (error instanceof Error) {
    return /fetch|network|timeout|quota|rate.?limit|unavailable|invalid Tailor Fit response/i.test(
      message,
    );
  }

  return false;
}

function createProvider(name: ProviderName): LlmProvider {
  if (name === "openai") {
    return new OpenAiProvider();
  }

  if (name === "groq") {
    return new GroqProvider();
  }

  return new GeminiProvider();
}

class OrderedProvider implements LlmProvider {
  constructor(private readonly primaryName: ProviderName) {}

  async tailor(input: TailorRequest) {
    if (this.primaryName !== "gemini") {
      return createProvider(this.primaryName).tailor(input);
    }

    const failures: unknown[] = [];

    try {
      return await new GeminiProvider().tailor(input);
    } catch (error) {
      failures.push(error);
      console.warn("[Tailor Fit] Gemini providers unavailable", {
        error: getErrorSummary(error),
      });
    }

    try {
      return await new GroqProvider().tailor(input);
    } catch (error) {
      failures.push(error);
      console.warn("[Tailor Fit] Groq fallback unavailable", {
        error: getErrorSummary(error),
      });
    }

    if (
      input.isExampleDemo === true &&
      failures.some((error) => isRealProviderFailure(error))
    ) {
      console.warn(
        "[Tailor Fit] Using offline demo fallback after real providers failed.",
      );
      return offlineDemoFallback;
    }

    if (failures.some((error) => isQuotaOrRateLimitError(error))) {
      throw new LlmQuotaUnavailableError();
    }

    throw failures[failures.length - 1] ?? new Error("No LLM providers ran.");
  }
}

export function getLlmProvider(): LlmProvider {
  const primaryName = process.env.LLM_PROVIDER || "gemini";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  if (!isProviderName(primaryName)) {
    throw new Error(`Unsupported LLM_PROVIDER: ${primaryName}`);
  }

  console.info("[Tailor Fit] LLM provider selected", {
    GEMINI_API_KEY_EXISTS: Boolean(process.env.GEMINI_API_KEY),
    GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL,
    GEMINI_MODEL: geminiModel,
    GROQ_API_KEY_EXISTS: Boolean(process.env.GROQ_API_KEY),
    GROQ_MODEL: groqModel,
    LLM_PROVIDER: primaryName,
  });

  return new OrderedProvider(primaryName);
}
