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

export class LlmProviderFailureError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LlmProviderFailureError";
    this.status = status;
  }
}

export interface LlmProvider {
  tailor(input: TailorRequest): Promise<TailorResult>;
}
