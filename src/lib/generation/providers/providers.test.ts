import { describe, expect, it } from "vitest";
import { z } from "zod";
import { LlmQuota, type LlmUsageStore, type UsageDelta, type UsageRow } from "../quota";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { ManualProvider } from "./manual";
import { getConfiguredLlmProvider } from "./index";

class MemoryUsageStore implements LlmUsageStore {
  rows: UsageRow[] = [];
  async list() { return this.rows; }
  async increment(_date: string, provider: string, model: string, delta: UsageDelta) {
    const row = this.rows.find((candidate) => candidate.provider === provider && candidate.model === model) ?? { provider, model, requests: 0, inputTokens: 0, outputTokens: 0, errors429: 0 };
    if (!this.rows.includes(row)) this.rows.push(row);
    row.requests += delta.requests ?? 0;
    row.inputTokens += delta.inputTokens ?? 0;
    row.outputTokens += delta.outputTokens ?? 0;
    row.errors429 += delta.errors429 ?? 0;
  }
}

const schema = z.object({ answer: z.string() });
const quota = () => new LlmQuota({ cap: 5, minIntervalMs: 0, store: new MemoryUsageStore() });

describe("generation providers", () => {
  it("Gemini uses structured JSON through the cap", async () => {
    let captured: Record<string, unknown> | undefined;
    const provider = new GeminiProvider({
      quota: quota(),
      client: { models: { generateContent: async (args: Record<string, unknown>) => {
        captured = args;
        return { text: '{"answer":"ok"}', usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 4 } };
      } } } as never,
    });

    await expect(provider.generateJson({ systemPrompt: "system", userPrompt: "user", schema })).resolves.toEqual({ data: { answer: "ok" }, usage: { inputTokens: 3, outputTokens: 4 } });
    expect(captured).toMatchObject({ model: provider.model, config: { responseMimeType: "application/json" } });
    expect((captured?.config as { responseSchema?: unknown }).responseSchema).toBeTruthy();
  });

  it("retries Gemini quota errors with the specified backoff", async () => {
    const waits: number[] = [];
    let attempts = 0;
    const provider = new GeminiProvider({
      quota: quota(),
      sleep: async (milliseconds) => { waits.push(milliseconds); },
      client: { models: { generateContent: async () => {
        attempts += 1;
        if (attempts < 3) { const error = new Error("429 quota"); Object.assign(error, { status: 429 }); throw error; }
        return { text: '{"answer":"after retry"}' };
      } } } as never,
    });

    await expect(provider.generateJson({ systemPrompt: "system", userPrompt: "user", schema })).resolves.toMatchObject({ data: { answer: "after retry" } });
    expect(waits).toEqual([30_000, 120_000]);
  });

  it("uses a configured fallback after the final Gemini quota retry", async () => {
    const waits: number[] = [];
    const fallback = { name: "groq" as const, generateJson: async () => ({ data: { answer: "fallback" }, usage: { inputTokens: 1, outputTokens: 1 } }) };
    const provider = new GeminiProvider({
      quota: quota(),
      fallback,
      sleep: async (milliseconds) => { waits.push(milliseconds); },
      client: { models: { generateContent: async () => { const error = new Error("429 quota"); Object.assign(error, { status: 429 }); throw error; } } } as never,
    });

    await expect(provider.generateJson({ systemPrompt: "system", userPrompt: "user", schema })).resolves.toMatchObject({ data: { answer: "fallback" } });
    expect(waits).toEqual([30_000, 120_000, 480_000]);
  });

  it("Groq uses JSON mode through the same cap", async () => {
    const provider = new GroqProvider({
      apiKey: "test",
      model: "free-test-model",
      quota: quota(),
      request: async (_url, init) => {
        expect(JSON.parse(String(init?.body))).toMatchObject({ response_format: { type: "json_object" } });
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"answer":"fallback"}' } }], usage: { prompt_tokens: 2, completion_tokens: 6 } }), { status: 200 });
      },
    });
    await expect(provider.generateJson({ systemPrompt: "system", userPrompt: "user", schema })).resolves.toEqual({ data: { answer: "fallback" }, usage: { inputTokens: 2, outputTokens: 6 } });
  });

  it("manual provider writes a brief and never calls an LLM", async () => {
    const writes: Array<{ ticketId: string; systemPrompt: string; userPrompt: string }> = [];
    const provider = new ManualProvider({ markBriefReady: async (ticketId, prompts) => { writes.push({ ticketId, ...prompts }); } });
    await provider.prepareBrief("ticket-1", { systemPrompt: "system", userPrompt: "user" });
    expect(writes).toEqual([{ ticketId: "ticket-1", systemPrompt: "system", userPrompt: "user" }]);
    await expect(provider.generateJson({ systemPrompt: "system", userPrompt: "user", schema })).rejects.toThrow("never calls an LLM");
  });

  it("uses the manual adapter when the automation kill switch is off", () => {
    const previous = process.env.AUTOMATION_ENABLED;
    process.env.AUTOMATION_ENABLED = "false";
    try {
      expect(getConfiguredLlmProvider().name).toBe("manual");
    } finally {
      process.env.AUTOMATION_ENABLED = previous;
    }
  });
});
