import { describe, expect, it } from "vitest";
import { subscribeAutomationEvent } from "./events";
import { runJob } from "@/lib/jobs/run";
import { postJob } from "@/lib/jobs/http";
import type { GscRow, JobName, JobStore, JobSummary, QuestionCandidate, WebVital } from "@/lib/jobs/types";

class MemoryStore implements JobStore {
  jobs: JobSummary[] = []; gsc = new Map<string, GscRow>(); vitals = new Map<string, WebVital>(); questions = new Map<string, QuestionCandidate>();
  async start(name: JobName) { return `${name}-${this.jobs.length}`; }
  async finish(_id: string, summary: JobSummary) { this.jobs.push(summary); }
  async upsertGsc(rows: GscRow[]) { for (const row of rows) this.gsc.set(`${row.date}:${row.pageUrl}:${row.query}:${row.country}:${row.device}`, row); return rows.length; }
  async upsertVital(vital: WebVital) { this.vitals.set(`${vital.url}:${vital.strategy}`, vital); }
  async latestVital(url: string, strategy: "mobile" | "desktop") { return this.vitals.get(`${url}:${strategy}`) ?? null; }
  async questionQueries() { return [{ question: "What is a BERA test?", source: "gsc" as const, volumeHint: 20 }, { question: "What is a BERA test?", source: "gsc" as const, volumeHint: 20 }]; }
  async staffQuestions() { return [{ question: "Can hearing aids help tinnitus?", source: "staff" as const }]; }
  async upsertQuestion(candidate: QuestionCandidate) { this.questions.set(candidate.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), candidate); }
}

describe("scheduled signal jobs", () => {
  it("rejects a missing cron secret and returns a JSON success summary for a valid job", async () => {
    const originalSecret = process.env.CRON_SECRET; process.env.CRON_SECRET = "test-cron-secret";
    try {
      const unauthorized = await postJob(new Request("https://example.test/api/jobs/sync-search-console", { method: "POST" }), "sync-search-console", async () => { throw new Error("must not run"); });
      const authorized = await postJob(new Request("https://example.test/api/jobs/sync-search-console", { method: "POST", headers: { authorization: "Bearer test-cron-secret" } }), "sync-search-console", async (jobName) => ({ jobName, status: "success", itemsProcessed: 1, llmRequestsUsed: 0, errors: [], notes: "recorded fixture" }));
      expect(unauthorized.status).toBe(401); expect(await unauthorized.json()).toMatchObject({ error: "Unauthorized." }); expect(authorized.status).toBe(200); expect(await authorized.json()).toMatchObject({ ok: true, summary: { itemsProcessed: 1 } });
    } finally { process.env.CRON_SECRET = originalSecret; }
  });

  it("uses all five GSC dimensions and reruns without duplicate signal rows", async () => {
    const store = new MemoryStore(); const rows = [{ date: "2026-09-28", pageUrl: "https://www.hearinghope.in/bera-test", query: "what is bera", country: "IND", device: "MOBILE", clicks: 2, impressions: 20, ctr: 0.1, position: 8 }];
    const client = { queryLastThreeDays: async () => rows, inspectRecentlyPublishedUrls: async () => 1 };
    await runJob("sync-search-console", { store, searchConsole: client }); await runJob("sync-search-console", { store, searchConsole: client });
    expect(store.gsc.size).toBe(1); expect(store.jobs).toHaveLength(2); expect(store.jobs[0].notes).toContain("date,page,query,country,device");
  });

  it("stores both strategies and emits a CWV regression after a passing result", async () => {
    const store = new MemoryStore(); const events: unknown[] = []; const unsubscribe = subscribeAutomationEvent("technical.cwv_regression", (event) => { events.push(event.payload); }); let run = 0;
    const client = { measure: async (url: string, strategy: "mobile" | "desktop") => { run += 1; const fail = run > 2; return { url, strategy, lcp: fail ? 3 : 2, inp: 100, cls: 0.05, performanceScore: 90, raw: {} }; } };
    await runJob("sync-web-vitals", { store, pageSpeed: client, urls: ["https://www.hearinghope.in/"] }); await runJob("sync-web-vitals", { store, pageSpeed: client, urls: ["https://www.hearinghope.in/"] }); unsubscribe();
    expect(store.vitals.size).toBe(2); expect(events).toHaveLength(2);
  });

  it("normalises and deduplicates GSC and Reddit question candidates", async () => {
    const store = new MemoryStore(); const reddit = { questionTitles: async () => ["What is a BERA test?", "What is tympanometry used for?"] };
    const summary = await runJob("harvest-questions", { store, reddit });
    expect(summary.itemsProcessed).toBe(3); expect(store.questions.size).toBe(2); expect(store.jobs[0].notes).toContain("1 staff"); expect(store.jobs[0].status).toBe("success");
  });
});
