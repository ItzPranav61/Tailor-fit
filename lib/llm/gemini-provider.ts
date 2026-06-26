import { GoogleGenAI, Type } from "@google/genai";

import { TAILOR_SYSTEM_PROMPT } from "./prompt";
import {
  buildTailorUserPrompt,
  LLM_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  parseJsonObject,
  tailorResultSchema,
} from "./shared";
import {
  type LlmProvider,
  type TailorRequest,
} from "./types";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [500, 1_000, 2_000];
const EMPTY_RESPONSE_ERROR = "Gemini returned an empty response.";

const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tailoredResume: {
      type: Type.STRING,
      description: "The full rewritten resume in clean plain text.",
    },
    changeNotes: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 8,
      items: {
        type: Type.STRING,
        description:
          "A concise note explaining a change and the JD requirement it supports.",
      },
    },
  },
  required: ["tailoredResume", "changeNotes"],
} as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (error instanceof Error && error.name === "AbortError");
}

function isNetworkError(error: unknown) {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      /fetch|network|econnreset|econnrefused|etimedout/i.test(error.message))
  );
}

function isTransientProviderError(error: unknown) {
  if (isAbortError(error) || isNetworkError(error)) {
    return true;
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return status === 429 || status === 503;
  }

  return false;
}

function isRetryableGeminiError(error: unknown) {
  return (
    isTransientProviderError(error) ||
    (error instanceof Error && error.message === EMPTY_RESPONSE_ERROR)
  );
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

  const status =
    errorObject && "status" in errorObject ? errorObject.status : undefined;
  const code =
    errorObject && "code" in errorObject ? errorObject.code : undefined;

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof errorObject?.message === "string"
        ? errorObject.message
        : String(error);

  return {
    code,
    message: rawMessage.slice(0, 200),
    name,
    status,
  };
}

function logGeminiFailure(
  label: string,
  error: unknown,
  model: string,
  attempt?: number,
) {
  console.warn("[Tailor Fit] Gemini provider failure", {
    attempt,
    error: getErrorSummary(error),
    label,
    model,
  });
}

export class GeminiProvider implements LlmProvider {
  async tailor(input: TailorRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const client = new GoogleGenAI({ apiKey });

    try {
      return await this.tailorWithRetries(client, input, GEMINI_MODEL);
    } catch (error) {
      if (
        !GEMINI_FALLBACK_MODEL ||
        GEMINI_FALLBACK_MODEL === GEMINI_MODEL ||
        !isRetryableGeminiError(error)
      ) {
        throw error;
      }

      console.warn(
        `[Tailor Fit] Trying Gemini fallback model: ${GEMINI_FALLBACK_MODEL}`,
      );

      try {
        return await this.tailorOnce(client, input, GEMINI_FALLBACK_MODEL);
      } catch (fallbackError) {
        logGeminiFailure(
          "fallback",
          fallbackError,
          GEMINI_FALLBACK_MODEL,
          1,
        );

        throw fallbackError;
      }
    }
  }

  private async tailorWithRetries(
    client: GoogleGenAI,
    input: TailorRequest,
    model: string,
  ) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await this.tailorOnce(client, input, model);
      } catch (error) {
        logGeminiFailure("primary", error, model, attempt);

        const shouldRetry =
          attempt < MAX_ATTEMPTS && isRetryableGeminiError(error);

        if (!shouldRetry) {
          throw error;
        }

        console.warn("[Tailor Fit] Gemini retry scheduled", {
          attempt,
          backoffMs: BACKOFF_MS[attempt - 1],
          model,
        });

        await sleep(BACKOFF_MS[attempt - 1]);
      }
    }

    throw new Error("Gemini provider failed after retries.");
  }

  private async tailorOnce(
    client: GoogleGenAI,
    input: TailorRequest,
    model: string,
  ) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    try {
      const response = await client.models.generateContent({
        model,
        contents: buildTailorUserPrompt(input.resume, input.jobDescription),
        config: {
          abortSignal: controller.signal,
          systemInstruction: TAILOR_SYSTEM_PROMPT,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema,
        },
      });

      const responseText = response.text ?? "";

      if (!responseText.trim()) {
        throw new Error(EMPTY_RESPONSE_ERROR);
      }

      return tailorResultSchema.parse(parseJsonObject(responseText));
    } finally {
      clearTimeout(timeout);
    }
  }
}
