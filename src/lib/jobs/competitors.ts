import { createServiceSupabaseClient } from "@/lib/supabase/service";

type Fetcher = typeof fetch;
const USER_AGENT = "HearingHopeAutomation/1.0 (+https://www.hearinghope.in)";

export type CompetitorPage = { domain: string; url: string; title: string };
export interface CompetitorStore {
  knownUrls(domain: string): Promise<Set<string>>;
  upsert(page: CompetitorPage): Promise<void>;
}

export class SupabaseCompetitorStore implements CompetitorStore {
  private db() { return createServiceSupabaseClient(); }
  async knownUrls(domain: string) {
    const { data, error } = await this.db().from("signals_competitors").select("url").eq("competitor_domain", domain);
    if (error) throw new Error(error.message);
    return new Set((data ?? []).map((row) => String(row.url)));
  }
  async upsert(page: CompetitorPage) {
    const { error } = await this.db().from("signals_competitors").upsert({ competitor_domain: page.domain, url: page.url, title: page.title, last_seen_at: new Date().toISOString() }, { onConflict: "competitor_domain,url" });
    if (error) throw new Error(error.message);
  }
}

export function sitemapUrls(xml: string) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

export function robotsAllows(robots: string, target: URL) {
  const rules = robots.split(/\r?\n/).reduce<{ applies: boolean; disallow: string[] }>((state, line) => {
    const [rawKey, ...rawValue] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (key === "user-agent") return { ...state, applies: value === "*" || /hearinghopeautomation/i.test(value) };
    if (key === "disallow" && state.applies && value) return { ...state, disallow: [...state.disallow, value] };
    return state;
  }, { applies: false, disallow: [] });
  return !rules.disallow.some((path) => target.pathname.startsWith(path));
}

export class CompetitorCrawler {
  constructor(private readonly options: { fetcher?: Fetcher; sleep?: (ms: number) => Promise<void> } = {}) {}
  private get fetcher() { return this.options.fetcher ?? fetch; }
  private get sleep() { return this.options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))); }
  private async text(url: string) {
    const response = await this.fetcher(url, { headers: { "user-agent": USER_AGENT } });
    if (!response.ok) throw new Error(`Competitor fetch failed (${response.status}) for ${url}.`);
    return response.text();
  }
  async urls(domain: string) {
    const origin = new URL(domain.includes("://") ? domain : `https://${domain}`).origin;
    const seenSitemaps = new Set<string>();
    const pages = new Set<string>();
    const crawl = async (sitemap: string): Promise<void> => {
      if (seenSitemaps.has(sitemap)) return;
      seenSitemaps.add(sitemap);
      const xml = await this.text(sitemap);
      const urls = sitemapUrls(xml);
      if (/<sitemapindex/i.test(xml)) await Promise.all(urls.map(crawl));
      else urls.forEach((url) => pages.add(url));
    };
    await crawl(`${origin}/sitemap.xml`);
    return [...pages];
  }
  async title(url: string, robots: string) {
    const target = new URL(url);
    if (!robotsAllows(robots, target)) return "";
    await this.sleep(1_000);
    const html = await this.text(url);
    return html.match(/<title[^>]*>\s*([\s\S]*?)\s*<\/title>/i)?.[1].replace(/\s+/g, " ") ?? "";
  }
  async robots(domain: string) {
    const origin = new URL(domain.includes("://") ? domain : `https://${domain}`).origin;
    try { return await this.text(`${origin}/robots.txt`); } catch { return ""; }
  }
}

export async function syncCompetitors(domains: string[], store: CompetitorStore, crawler: CompetitorCrawler) {
  let inserted = 0;
  for (const rawDomain of domains) {
    const domain = new URL(rawDomain.includes("://") ? rawDomain : `https://${rawDomain}`).hostname;
    const [known, urls, robots] = await Promise.all([store.knownUrls(domain), crawler.urls(rawDomain), crawler.robots(rawDomain)]);
    for (const url of urls) {
      if (known.has(url)) continue;
      const title = await crawler.title(url, robots);
      if (!title && !robotsAllows(robots, new URL(url))) continue;
      await store.upsert({ domain, url, title });
      inserted += 1;
    }
  }
  return inserted;
}
