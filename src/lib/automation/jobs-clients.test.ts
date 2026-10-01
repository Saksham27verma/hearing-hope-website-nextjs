import { generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GooglePageSpeedClient, GoogleSearchConsoleClient, RedditQuestionClient } from "@/lib/jobs/clients";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

describe("recorded free-signal adapters", () => {
  it("sends the required five dimensions to Search Console and parses its recorded response", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const serviceAccount = JSON.stringify({ client_email: "automation@example.test", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(), token_uri: "https://auth.example.test/token" });
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      if (String(input).includes("/token")) return Response.json({ access_token: "recorded-token" });
      return Response.json({ rows: [{ keys: ["2026-09-28", "https://www.hearinghope.in/services/bera-test", "what is bera test", "IND", "MOBILE"], clicks: 2, impressions: 20, ctr: 0.1, position: 8 }] });
    }) as typeof fetch;
    const rows = await new GoogleSearchConsoleClient(serviceAccount, "sc-domain:hearinghope.in").queryLastThreeDays();
    const requestBody = JSON.parse(String(calls[1].init?.body));
    expect(requestBody).toMatchObject({ dimensions: ["date", "page", "query", "country", "device"], rowLimit: 25_000 });
    expect(rows).toEqual([expect.objectContaining({ device: "MOBILE", impressions: 20 })]);
  });

  it("parses a recorded PageSpeed response and queries Reddit's four intended communities for supplied seeds", async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input); calls.push(url);
      if (url.includes("pagespeedonline")) return Response.json({ lighthouseResult: { audits: { "largest-contentful-paint": { numericValue: 2200 }, "interaction-to-next-paint": { numericValue: 180 }, "cumulative-layout-shift": { numericValue: 0.04 } }, categories: { performance: { score: 0.91 } } } });
      if (url.includes("access_token")) return Response.json({ access_token: "recorded-token" });
      return Response.json({ data: { children: [{ data: { title: "What is a BERA test?" } }, { data: { title: "A non-question title" } }] } });
    }) as typeof fetch;
    const vital = await new GooglePageSpeedClient("recorded-key").measure("https://www.hearinghope.in/", "mobile");
    const questions = await new RedditQuestionClient("id", "secret", ["hearing aid", "BERA test"]).questionTitles();
    expect(vital).toMatchObject({ lcp: 2.2, inp: 180, cls: 0.04, performanceScore: 91 });
    expect(questions).toEqual(["What is a BERA test?"]);
    expect(calls.filter((url) => url.includes("oauth.reddit.com/r/HearingAids+Audiology+india+AskDocs/search"))).toHaveLength(2);
    expect(calls.find((url) => url.includes("oauth.reddit.com"))).toContain("t=week");
  });
});
