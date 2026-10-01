import { createSign } from "node:crypto";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { SEED_KEYWORDS } from "@/config/seed-keywords";
import { fetchWithBackoff } from "@/lib/automation/backoff";
import type { GscRow, PageSpeedClient, RedditClient, SearchConsoleClient, WebVital } from "./types";

function asDate(date: Date) { return date.toISOString().slice(0, 10); }
function base64url(value: string) { return Buffer.from(value).toString("base64url"); }

async function serviceAccountToken(raw: string) {
  const account = JSON.parse(raw) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: account.token_uri ?? "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const signer = createSign("RSA-SHA256"); signer.update(`${header}.${payload}`); signer.end();
  const assertion = `${header}.${payload}.${signer.sign(account.private_key, "base64url")}`;
  const response = await fetchWithBackoff(fetch, account.token_uri ?? "https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
  if (!response.ok) throw new Error(`GSC authentication failed (${response.status}).`);
  return String((await response.json() as { access_token: string }).access_token);
}

export class GoogleSearchConsoleClient implements SearchConsoleClient {
  constructor(private readonly serviceAccount = process.env.GSC_SERVICE_ACCOUNT_JSON, private readonly siteUrl = process.env.GSC_SITE_URL) {}
  private async authorization() { if (!this.serviceAccount || !this.siteUrl) throw new Error("GSC_SERVICE_ACCOUNT_JSON and GSC_SITE_URL are required."); return `Bearer ${await serviceAccountToken(this.serviceAccount)}`; }
  async queryLastThreeDays() {
    const authorization = await this.authorization(); const end = new Date(); end.setUTCDate(end.getUTCDate() - 2); const start = new Date(end); start.setUTCDate(start.getUTCDate() - 2);
    const response = await fetchWithBackoff(fetch, `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl!)}/searchAnalytics/query`, { method: "POST", headers: { authorization, "content-type": "application/json" }, body: JSON.stringify({ startDate: asDate(start), endDate: asDate(end), dimensions: ["date", "page", "query", "country", "device"], rowLimit: 25_000 }) });
    if (!response.ok) throw new Error(`GSC query failed (${response.status}).`);
    const body = await response.json() as { rows?: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }> };
    return (body.rows ?? []).map((row) => ({ date: row.keys[0], pageUrl: row.keys[1], query: row.keys[2], country: row.keys[3], device: row.keys[4], clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }));
  }
  async inspectRecentlyPublishedUrls() {
    if (!isServiceRoleConfigured()) return 0;
    const authorization = await this.authorization();
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const { data, error } = await createServiceSupabaseClient().from("content_pages").select("canonical_url,slug").eq("status", "published").gte("published_at", since);
    if (error) throw new Error(`Could not list recently published URLs: ${error.message}`);
    let inspected = 0;
    for (const page of data ?? []) {
      const inspectionUrl = page.canonical_url || `https://www.hearinghope.in/${page.slug}`;
      const response = await fetchWithBackoff(fetch, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", headers: { authorization, "content-type": "application/json" }, body: JSON.stringify({ inspectionUrl, siteUrl: this.siteUrl }) });
      if (!response.ok) throw new Error(`GSC URL inspection failed (${response.status}).`);
      inspected += 1;
    }
    return inspected;
  }
}

export class GooglePageSpeedClient implements PageSpeedClient {
  constructor(private readonly apiKey = process.env.PSI_API_KEY) {}
  async measure(url: string, strategy: "mobile" | "desktop"): Promise<WebVital> {
    if (!this.apiKey) throw new Error("PSI_API_KEY is required.");
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed"); endpoint.searchParams.set("url", url); endpoint.searchParams.set("strategy", strategy); endpoint.searchParams.set("key", this.apiKey);
    const response = await fetchWithBackoff(fetch, endpoint); if (!response.ok) throw new Error(`PageSpeed request failed (${response.status}).`);
    const raw = await response.json() as Record<string, any>; const audits = raw.lighthouseResult?.audits ?? {};
    const metric = (id: string) => typeof audits[id]?.numericValue === "number" ? audits[id].numericValue : null;
    return { url, strategy, lcp: metric("largest-contentful-paint") === null ? null : metric("largest-contentful-paint") / 1000, inp: metric("interaction-to-next-paint"), cls: metric("cumulative-layout-shift"), performanceScore: typeof raw.lighthouseResult?.categories?.performance?.score === "number" ? raw.lighthouseResult.categories.performance.score * 100 : null, raw };
  }
}

export class RedditQuestionClient implements RedditClient {
  constructor(private readonly clientId = process.env.REDDIT_CLIENT_ID, private readonly secret = process.env.REDDIT_CLIENT_SECRET, private readonly keywords: readonly string[] = SEED_KEYWORDS) {}
  async questionTitles() {
    if (!this.clientId || !this.secret) throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required.");
    const token = await fetchWithBackoff(fetch, "https://www.reddit.com/api/v1/access_token", { method: "POST", headers: { authorization: `Basic ${Buffer.from(`${this.clientId}:${this.secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded", "user-agent": "HearingHopeAutomation/1.0" }, body: "grant_type=client_credentials" });
    if (!token.ok) throw new Error(`Reddit authentication failed (${token.status}).`); const accessToken = String((await token.json() as { access_token: string }).access_token);
    const titles = new Set<string>();
    for (const keyword of this.keywords) {
      const endpoint = new URL("https://oauth.reddit.com/r/HearingAids+Audiology+india+AskDocs/search"); endpoint.search = new URLSearchParams({ q: keyword, restrict_sr: "on", sort: "new", t: "week" }).toString();
      const response = await fetchWithBackoff(fetch, endpoint, { headers: { authorization: `Bearer ${accessToken}`, "user-agent": "HearingHopeAutomation/1.0" } });
      if (!response.ok) throw new Error(`Reddit search failed (${response.status}).`); const body = await response.json() as { data?: { children?: Array<{ data?: { title?: string } }> } };
      for (const title of (body.data?.children ?? []).map((item) => item.data?.title ?? "")) if (/\?|^(how|what|why|can|does|is|cost|price|near me|vs)\b/i.test(title)) titles.add(title);
    }
    return [...titles];
  }
}
