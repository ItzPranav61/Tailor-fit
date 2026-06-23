import OpenAI from "openai";

import { TAILOR_SYSTEM_PROMPT } from "./prompt";
import {
  buildTailorUserPrompt,
  LLM_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  openAiResponseJsonSchema,
  parseJsonObject,
  tailorResultSchema,
} from "./shared";
import type { LlmProvider, TailorRequest } from "./types";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

export class OpenAiProvider implements LlmProvider {
  async tailor(input: TailorRequest) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const client = new OpenAI({ apiKey });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    try {
      const response = await client.responses.create(
        {
          model: OPENAI_MODEL,
          input: [
            {
              role: "system",
              content: TAILOR_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: buildTailorUserPrompt(
                input.resume,
                input.jobDescription,
              ),
            },
          ],
          max_output_tokens: MAX_OUTPUT_TOKENS,
          text: {
            format: {
              type: "json_schema",
              name: "tailored_resume_response",
              strict: true,
              schema: openAiResponseJsonSchema,
            },
          },
        },
        { signal: controller.signal },
      );

      return tailorResultSchema.parse(parseJsonObject(response.output_text));
    } finally {
      clearTimeout(timeout);
    }
  }
}
