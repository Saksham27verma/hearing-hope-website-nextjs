import { describe, expect, it } from "vitest";
import { DailyLlmCapReachedError, LlmQuota, type LlmUsageStore, type UsageDelta, type UsageRow } from "./quota";

class MemoryUsageStore implements LlmUsageStore {
  rows = new Map<string, UsageRow>();

  async list() {
    return [...this.rows.values()];
  }

  async increment(date: string, provider: string, model: string, delta: UsageDelta) {
    const key = `${date}:${provider}:${model}`;
    const row = this.rows.get(key) ?? { provider, model, requests: 0, inputTokens: 0, outputTokens: 0, errors429: 0 };
    row.requests += delta.requests ?? 0;
    row.inputTokens += delta.inputTokens ?? 0;
    row.outputTokens += delta.outputTokens ?? 0;
    row.errors429 += delta.errors429 ?? 0;
    this.rows.set(key, row);
  }
}

describe("LlmQuota", () => {
  it("makes at most the cap number of requests across 1,000 tickets", async () => {
    const store = new MemoryUsageStore();
    const quota = new LlmQuota({ cap: 7, minIntervalMs: 0, store });
    let requests = 0;

    const results = await Promise.allSettled(
      Array.from({ length: 1_000 }, (_, index) =>
        quota.run({
          provider: index % 2 ? "gemini" : "groq",
          model: "test-model",
          request: async () => {
            requests += 1;
            return { value: index, usage: { inputTokens: 2, outputTokens: 3 } };
          },
        }),
      ),
    );

    expect(requests).toBe(7);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(7);
    expect(results.filter((result) => result.status === "rejected" && result.reason instanceof DailyLlmCapReachedError)).toHaveLength(993);
    expect([...store.rows.values()].reduce((sum, row) => sum + row.requests, 0)).toBe(7);
  });

  it("records token usage and alerts once when the cap is reached", async () => {
    const store = new MemoryUsageStore();
    let alerts = 0;
    const quota = new LlmQuota({
      cap: 1,
      minIntervalMs: 0,
      store,
      notifier: { quotaReached: async () => { alerts += 1; } },
    });

    await quota.run({ provider: "gemini", model: "flash", request: async () => ({ value: null, usage: { inputTokens: 4, outputTokens: 5 } }) });
    await expect(quota.run({ provider: "groq", model: "fallback", request: async () => ({ value: null, usage: { inputTokens: 0, outputTokens: 0 } }) })).rejects.toBeInstanceOf(DailyLlmCapReachedError);
    await expect(quota.run({ provider: "groq", model: "fallback", request: async () => ({ value: null, usage: { inputTokens: 0, outputTokens: 0 } }) })).rejects.toBeInstanceOf(DailyLlmCapReachedError);

    expect(alerts).toBe(1);
    expect([...store.rows.values()][0]).toMatchObject({ requests: 1, inputTokens: 4, outputTokens: 5 });
  });

  it("spaces requests by the configured global minimum interval", async () => {
    const store = new MemoryUsageStore();
    let clock = new Date("2026-09-30T00:00:00.000Z").getTime();
    const waits: number[] = [];
    const quota = new LlmQuota({
      cap: 2,
      minIntervalMs: 10_000,
      store,
      now: () => new Date(clock),
      sleep: async (milliseconds) => { waits.push(milliseconds); clock += milliseconds; },
    });

    await quota.run({ provider: "gemini", model: "flash", request: async () => ({ value: null, usage: { inputTokens: 0, outputTokens: 0 } }) });
    await quota.run({ provider: "groq", model: "fallback", request: async () => ({ value: null, usage: { inputTokens: 0, outputTokens: 0 } }) });

    expect(waits).toEqual([10_000]);
  });
});
