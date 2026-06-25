export type TailorRequest = {
  resume: string;
  jobDescription: string;
  isExampleDemo?: boolean;
};
export type TailorResult = { tailoredResume: string; changeNotes: string[] };

export class LlmQuotaUnavailableError extends Error {
  constructor() {
    super("LLM quota is temporarily unavailable.");
    this.name = "LlmQuotaUnavailableError";
  }
}

export interface LlmProvider {
  tailor(input: TailorRequest): Promise<TailorResult>;
}
