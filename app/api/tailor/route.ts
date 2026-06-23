import { NextResponse } from "next/server";
import { z } from "zod";

import { getLlmProvider } from "../../../lib/llm";

const RESUME_MIN_LENGTH = 50;
const RESUME_MAX_LENGTH = 15_000;
const JOB_DESCRIPTION_MIN_LENGTH = 50;
const JOB_DESCRIPTION_MAX_LENGTH = 10_000;

const tailorRequestSchema = z.object({
  resume: z
    .string({ required_error: "Resume is required." })
    .trim()
    .min(RESUME_MIN_LENGTH, "Resume must be at least 50 characters.")
    .max(RESUME_MAX_LENGTH, "Resume must be 15,000 characters or fewer."),
  jobDescription: z
    .string({ required_error: "Job description is required." })
    .trim()
    .min(
      JOB_DESCRIPTION_MIN_LENGTH,
      "Job description must be at least 50 characters.",
    )
    .max(
      JOB_DESCRIPTION_MAX_LENGTH,
      "Job description must be 10,000 characters or fewer.",
    ),
});

function validationMessage(error: z.ZodError): string {
  return error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join(" ");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsedRequest = tailorRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { message: validationMessage(parsedRequest.error) },
      { status: 400 },
    );
  }

  try {
    const result = await getLlmProvider().tailor(parsedRequest.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Tailor API LLM provider failure", error);

    return NextResponse.json(
      {
        message:
          "We could not tailor the resume right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}
