import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getLlmQuota, isQuotaResponse, type LlmQuota } from "../quota";
import { LlmUnavailableError, type GenerateJsonArgs, type LlmProvider } from "../types";

type GeminiClient = Pick<GoogleGenAI, "models">;

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
export const DEFAULT_GEMINI_FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const BACKOFF_MS = [30_000, 120_000, 480_000];
// A full page takes about 30 seconds; an overloaded model can otherwise hold the request open past Vercel's 300-second limit.
const REQUEST_TIMEOUT_MS = 60_000;

/** 5xx overload responses, aborted requests and dropped connections; 429 quota errors are handled separately. */
export function isUnavailableResponse(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return [500, 502, 503, 504].includes(status) || name === "AbortError" || name === "TimeoutError" || /UNAVAILABLE|high demand|overloaded|fetch failed/i.test(message);
}

export type GeminiProviderOptions = {
  apiKey?: string;
  model?: string;
  fallbackModels?: string[];
  timeoutMs?: number;
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
  private readonly models: string[];
  private readonly timeoutMs: number;
  private readonly unavailableModels = new Set<string>();
  private readonly quota: LlmQuota;
  private readonly client: GeminiClient;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly fallback?: LlmProvider;

  constructor(options: GeminiProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey && !options.client) throw new Error("Add GEMINI_API_KEY to use Gemini generation.");
    this.model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    const fallbackModels = options.fallbackModels ?? (process.env.GEMINI_FALLBACK_MODELS !== undefined ? process.env.GEMINI_FALLBACK_MODELS.split(",").map((model) => model.trim()).filter(Boolean) : DEFAULT_GEMINI_FALLBACK_MODELS);
    this.models = [...new Set([this.model, ...fallbackModels])];
    this.timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
    this.quota = options.quota ?? getLlmQuota();
    this.client = options.client ?? new GoogleGenAI({ apiKey: apiKey! });
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
    this.fallback = options.fallback;
  }

  async generateJson<T>(args: GenerateJsonArgs<T>) {
    let unavailable: unknown;
    for (const model of this.models) {
      if (this.unavailableModels.has(model)) continue;
      try {
        return await this.generateWith(model, args);
      } catch (error) {
        if (!isUnavailableResponse(error)) throw error;
        // Skip this model for the rest of the run instead of waiting on it again for the next ticket.
        this.unavailableModels.add(model);
        unavailable = error;
      }
    }
    const detail = unavailable instanceof Error ? unavailable.message : "all models were already unavailable this run";
    throw new LlmUnavailableError(`Gemini is unavailable (${this.models.join(", ")}): ${detail.slice(0, 200)}`, { cause: unavailable });
  }

  private async generateWith<T>(model: string, args: GenerateJsonArgs<T>) {
    let retry = 0;
    while (true) {
      try {
        const result = await this.quota.run({
          provider: this.name,
          model,
          request: async () => {
            const response = await this.client.models.generateContent({
              model,
              contents: `${args.systemPrompt}\n\n${args.userPrompt}`,
              config: {
                responseMimeType: "application/json",
                responseSchema: z.toJSONSchema(args.schema),
                maxOutputTokens: args.maxOutputTokens,
                httpOptions: { timeout: this.timeoutMs },
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
