import { TAILOR_SYSTEM_PROMPT } from "./prompt";
import {
  buildTailorUserPrompt,
  LLM_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  parseJsonObject,
  tailorResultSchema,
} from "./shared";
import {
  LlmProviderFailureError,
  type LlmProvider,
  type TailorRequest,
} from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function safeProviderMessage(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 200);
}

export class GroqProvider implements LlmProvider {
  async tailor(input: TailorRequest) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new LlmProviderFailureError("GROQ_API_KEY is not configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: TAILOR_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: [
                buildTailorUserPrompt(input.resume, input.jobDescription),
                "",
                'Return only valid JSON with this exact shape: {"tailoredResume":"string","changeNotes":["string"]}.',
              ].join("\n"),
            },
          ],
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new LlmProviderFailureError(
          `Groq request failed: ${safeProviderMessage(errorText)}`,
          response.status,
        );
      }

      const data = (await response.json()) as GroqChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content ?? "";

      if (!content.trim()) {
        throw new LlmProviderFailureError("Groq returned an empty response.");
      }

      try {
        return tailorResultSchema.parse(parseJsonObject(content));
      } catch {
        throw new LlmProviderFailureError(
          "Groq returned an invalid Tailor Fit response.",
        );
      }
    } catch (error) {
      if (error instanceof LlmProviderFailureError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new LlmProviderFailureError("Groq request timed out.");
      }

      throw new LlmProviderFailureError("Groq provider request failed.");
    } finally {
      clearTimeout(timeout);
    }
  }
}
