import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getLlmQuota, isQuotaResponse, type LlmQuota } from "../quota";
import type { GenerateJsonArgs, LlmProvider } from "../types";

type GeminiClient = Pick<GoogleGenAI, "models">;

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
const BACKOFF_MS = [30_000, 120_000, 480_000];

export type GeminiProviderOptions = {
  apiKey?: string;
  model?: string;
  quota?: LlmQuota;
  client?: GeminiClient;
  sleep?: (milliseconds: number) => Promise<void>;
  fallback?: LlmProvider;
};

export class GeminiRetriesExhaustedError extends Error {
  constructor(cause: unknown) {
    super("Gemini quota retries were exhausted; route this ticket to the configured fallback or manual brief.", { cause });
    this.name = "GeminiRetriesExhaustedError";
  }
}

export class GeminiProvider implements LlmProvider {
  readonly name = "gemini" as const;
  readonly model: string;
  private readonly quota: LlmQuota;
  private readonly client: GeminiClient;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly fallback?: LlmProvider;

  constructor(options: GeminiProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey && !options.client) throw new Error("Add GEMINI_API_KEY to use Gemini generation.");
    this.model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    this.quota = options.quota ?? getLlmQuota();
    this.client = options.client ?? new GoogleGenAI({ apiKey: apiKey! });
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
    this.fallback = options.fallback;
  }

  async generateJson<T>(args: GenerateJsonArgs<T>) {
    let retry = 0;
    while (true) {
      try {
        const result = await this.quota.run({
          provider: this.name,
          model: this.model,
          request: async () => {
            const response = await this.client.models.generateContent({
              model: this.model,
              contents: `${args.systemPrompt}\n\n${args.userPrompt}`,
              config: {
                responseMimeType: "application/json",
                responseSchema: z.toJSONSchema(args.schema),
                maxOutputTokens: args.maxOutputTokens,
              },
            });
            const data = args.schema.parse(JSON.parse(response.text || ""));
            return {
              value: data,
              usage: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
              },
            };
          },
        });
        return { data: result.value, usage: result.usage };
      } catch (error) {
        if (!isQuotaResponse(error)) throw error;
        if (retry >= BACKOFF_MS.length) {
          if (this.fallback) return this.fallback.generateJson(args);
          throw new GeminiRetriesExhaustedError(error);
        }
        await this.sleep(BACKOFF_MS[retry]);
        retry += 1;
      }
    }
  }
}
