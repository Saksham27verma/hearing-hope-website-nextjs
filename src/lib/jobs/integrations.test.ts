import { describe, expect, it } from "vitest";
import { GoogleBusinessProfileClient, syncGbp, type GbpStore } from "./gbp";
import { CompetitorCrawler, syncCompetitors, type CompetitorStore } from "./competitors";
import { GeminiGroundingClient, probeAiVisibility, type AiVisibilityStore } from "./ai-visibility";
import { LlmQuota, type LlmUsageStore } from "@/lib/generation/quota";
import { sendManualAiCheckReminder } from "./manual-ai-reminder";
import { subscribeAutomationEvent } from "@/lib/automation/events";

describe("checkpoint G integrations", () => {
  it("uses the GBP OAuth refresh flow and exercises locations, reviews, insights, replies, and posts", async () => {
    const calls: string[] = [];
    const fetcher: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input); calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.includes("oauth2.googleapis.com")) return Response.json({ access_token: "access" });
      if (url.endsWith("/accounts")) return Response.json({ accounts: [{ name: "accounts/1" }] });
      if (url.includes("locations?readMask")) return Response.json({ locations: [{ name: "locations/rohini", title: "Rohini" }] });
      if (url.endsWith("/reviews")) return Response.json({ reviews: [{ reviewId: "review-1", starRating: "FIVE", comment: "Great", reviewer: { displayName: "Asha" }, createTime: "2026-10-01T00:00:00Z" }] });
      if (url.includes(":reportInsights")) return Response.json({ locationMetrics: [{ date: "2026-10-01", metricValues: [{ metric: "CALL_CLICKS", totalValue: { value: "4" } }, { metric: "DIRECTION_REQUESTS", totalValue: { value: "2" } }] }] });
      return Response.json({});
    };
    const client = new GoogleBusinessProfileClient({ clientId: "id", clientSecret: "secret", refreshToken: "refresh", fetcher });
    await expect(client.listLocations()).resolves.toEqual([{ id: "locations/rohini", name: "Rohini" }]);
    await expect(client.reviews("rohini")).resolves.toMatchObject([{ id: "review-1", rating: 5 }]);
    await expect(client.insights("rohini")).resolves.toMatchObject([{ calls: 4, directionRequests: 2 }]);
    await client.reply("rohini", "review-1", "Thank you");
    await client.publishPost("rohini", { summary: "Book a hearing check", callToActionType: "BOOK", url: "https://www.hearinghope.in/contact" });
    expect(calls.filter((call) => call.includes("oauth2.googleapis.com"))).toHaveLength(1);
    expect(calls).toEqual(expect.arrayContaining([expect.stringContaining("PUT https://mybusiness.googleapis.com/v4/locations/rohini/reviews/review-1/reply"), expect.stringContaining("POST https://mybusiness.googleapis.com/v4/locations/rohini/localPosts")]));
  });

  it("upserts mocked GBP data and emits only for a newly received review", async () => {
    let reviews = 0; let insights = 0;
    const received: Record<string, unknown>[] = []; const unsubscribe = subscribeAutomationEvent("review.received", (event) => { received.push(event.payload); });
    const store: GbpStore = { clinics: async () => [{ id: "clinic", name: "Rohini", gbpLocationId: "rohini", managerId: "manager" }], upsertReview: async () => { reviews += 1; return true; }, upsertInsight: async () => { insights += 1; } };
    const result = await syncGbp(store, { listLocations: async () => [{ id: "locations/rohini", name: "Rohini" }], reviews: async () => [{ id: "review", rating: 4, text: "Good", authorName: "Asha", createdAt: "2026-10-01T00:00:00Z" }], insights: async () => [{ date: "2026-10-01", calls: 1, directionRequests: 0, websiteClicks: 0, viewsSearch: 1, viewsMaps: 0 }] });
    unsubscribe();
    expect(result).toEqual({ reviews: 1, insights: 1 }); expect(reviews).toBe(1); expect(insights).toBe(1); expect(received).toMatchObject([{ reviewId: "review", rating: 4, clinic: "Rohini" }]);
  });

  it("follows sitemap indexes, respects robots, and rate-limits new-page title fetches", async () => {
    const sleeps: number[] = []; const writes: unknown[] = [];
    const fetcher: typeof fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/sitemap.xml")) return new Response("<sitemapindex><sitemap><loc>https://competitor.test/posts.xml</loc></sitemap></sitemapindex>");
      if (url.endsWith("/posts.xml")) return new Response("<urlset><url><loc>https://competitor.test/new-guide</loc></url><url><loc>https://competitor.test/private/x</loc></url></urlset>");
      if (url.endsWith("/robots.txt")) return new Response("User-agent: *\nDisallow: /private");
      if (url.endsWith("/new-guide")) return new Response("<html><title>New Hearing Guide</title></html>");
      return new Response("not found", { status: 404 });
    };
    const store: CompetitorStore = { knownUrls: async () => new Set(), upsert: async (page) => { writes.push(page); } };
    const inserted = await syncCompetitors(["competitor.test"], store, new CompetitorCrawler({ fetcher, sleep: async (milliseconds) => { sleeps.push(milliseconds); } }));
    expect(inserted).toBe(1); expect(writes).toEqual([{ domain: "competitor.test", url: "https://competitor.test/new-guide", title: "New Hearing Guide" }]); expect(sleeps).toEqual([1_000]);
  });

  it("uses Gemini grounding metadata, not response prose, and passes through the global LLM cap", async () => {
    const usage: { requests: number } = { requests: 0 };
    const quota = new LlmQuota({ cap: 2, minIntervalMs: 0, store: { list: async () => [{ provider: "gemini", model: "test", requests: usage.requests, inputTokens: 0, outputTokens: 0, errors429: 0 }], increment: async (_date, _provider, _model, delta) => { usage.requests += delta.requests ?? 0; } } satisfies LlmUsageStore });
    const client = new GeminiGroundingClient({ quota, model: "test", client: { models: { generateContent: async (args: { config?: { tools?: unknown[] } }) => { expect(args.config?.tools).toEqual([{ googleSearch: {} }]); return { text: "Prose claims https://ignored.test was cited", usageMetadata: { promptTokenCount: 2, candidatesTokenCount: 3 }, candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://www.hearinghope.in/bera-test" } }, { web: { uri: "https://competitor.test/guide" } }] } }] }; } } } as never });
    const rows: unknown[] = []; const store: AiVisibilityStore = { activeQuestions: async () => [{ id: "q1", question: "What is a BERA test?" }], upsert: async (row) => { rows.push(row); } };
    expect(await probeAiVisibility(store, client, "hearinghope.in")).toBe(1); expect(usage.requests).toBe(1); expect(rows).toMatchObject([{ ourDomainCited: true, ourUrlsCited: ["https://www.hearinghope.in/bera-test"], competitorDomainsCited: ["competitor.test"], citedDomains: ["www.hearinghope.in", "competitor.test"] }]);
  });

  it("sends the monthly manual-check reminder only when Telegram is configured", async () => {
    const sent: string[] = [];
    const sender = async (_recipient: unknown, type: string) => { sent.push(type); return []; };
    expect(await sendManualAiCheckReminder(sender as never, { telegramChatId: "123", preferences: { email: false, inApp: false } })).toBe(1);
    expect(await sendManualAiCheckReminder(sender as never, { preferences: { email: false, inApp: false } })).toBe(0);
    expect(sent).toEqual(["manual_ai_check_due"]);
  });
});
