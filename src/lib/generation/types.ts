import type { ZodType } from "zod";

export type LlmUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type GenerateJsonArgs<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodType<T>;
  maxOutputTokens?: number;
};

export interface LlmProvider {
  name: "gemini" | "groq" | "manual";
  generateJson<T>(args: GenerateJsonArgs<T>): Promise<{ data: T; usage: LlmUsage }>;
}

/** The provider is overloaded or timed out; the ticket should wait for the next run rather than spend an attempt. */
export class LlmUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LlmUnavailableError";
  }
}
