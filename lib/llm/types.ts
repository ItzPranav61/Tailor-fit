export type TailorRequest = { resume: string; jobDescription: string };
export type TailorResult = { tailoredResume: string; changeNotes: string[] };

export interface LlmProvider {
  tailor(input: TailorRequest): Promise<TailorResult>;
}
