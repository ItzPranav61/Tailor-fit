import { z } from "zod";

export const LLM_TIMEOUT_MS = 30_000;
export const MAX_OUTPUT_TOKENS = 4_000;

export const tailorResultSchema = z.object({
  tailoredResume: z.string().min(1),
  changeNotes: z.array(z.string().min(1)).min(3).max(8),
});

export const openAiResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    tailoredResume: {
      type: "string",
      description: "The full rewritten resume in clean markdown.",
    },
    changeNotes: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "string",
        description:
          "A concise note explaining a change and the JD requirement it supports.",
      },
    },
  },
  required: ["tailoredResume", "changeNotes"],
} as const;

export function buildTailorUserPrompt(resume: string, jobDescription: string) {
  return [
    "Rewrite this resume for the target job description.",
    "",
    "Original resume:",
    resume,
    "",
    "Target job description:",
    jobDescription,
  ].join("\n");
}

export function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object found in model response.");
    }

    return JSON.parse(match[0]);
  }
}
