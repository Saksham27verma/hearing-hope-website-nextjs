import { describe, expect, it } from "vitest";
import { fetchWithBackoff, withBackoff } from "./backoff";

describe("external adapter backoff", () => {
  it("retries 429/5xx failures with the documented schedule before succeeding", async () => {
    const waits: number[] = []; let calls = 0;
    const value = await withBackoff(async () => { calls += 1; if (calls < 3) { const error = Object.assign(new TypeError("network"), { }); throw error; } return "ok"; }, { delaysMs: [10, 50], sleep: async (ms) => { waits.push(ms); } });
    expect(value).toBe("ok"); expect(waits).toEqual([10, 50]); expect(calls).toBe(3);
  });

  it("does not retry a permanent response", async () => {
    let calls = 0;
    const response = await fetchWithBackoff((async () => { calls += 1; return new Response("bad", { status: 401 }); }) as typeof fetch, "https://example.test");
    expect(response.status).toBe(401); expect(calls).toBe(1);
  });
});
