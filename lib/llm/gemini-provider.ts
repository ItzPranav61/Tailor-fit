import { GoogleGenAI, Type } from "@google/genai";

import { TAILOR_SYSTEM_PROMPT } from "./prompt";
import {
  buildTailorUserPrompt,
  LLM_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  parseJsonObject,
  tailorResultSchema,
} from "./shared";
import type { LlmProvider, TailorRequest } from "./types";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [500, 1_000, 2_000];

const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tailoredResume: {
      type: Type.STRING,
      description: "The full rewritten resume in clean markdown.",
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

export class GeminiProvider implements LlmProvider {
  async tailor(input: TailorRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const client = new GoogleGenAI({ apiKey });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

      try {
        const response = await client.models.generateContent({
          model: GEMINI_MODEL,
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
          throw new Error("Gemini returned an empty response.");
        }

        return tailorResultSchema.parse(parseJsonObject(responseText));
      } catch (error) {
        const shouldRetry =
          attempt < MAX_ATTEMPTS &&
          (isTransientProviderError(error) ||
            (error instanceof Error &&
              error.message === "Gemini returned an empty response."));

        if (!shouldRetry) {
          throw error;
        }

        console.warn(
          `Gemini provider attempt ${attempt} failed with a transient error; retrying.`,
        );

        await sleep(BACKOFF_MS[attempt - 1]);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error("Gemini provider failed after retries.");
  }
}
