import { GoogleGenAI } from "@google/genai";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { getLlmQuota, type LlmQuota } from "@/lib/generation/quota";
import { DEFAULT_GEMINI_MODEL } from "@/lib/generation/providers/gemini";

export type AiProbeQuestion = { id: string; question: string };
export type AiVisibilityRow = { question: string; responseText: string; citedUrls: string[]; citedDomains: string[]; ourDomainCited: boolean; ourUrlsCited: string[]; competitorDomainsCited: string[] };
export interface AiVisibilityStore { activeQuestions(): Promise<AiProbeQuestion[]>; upsert(row: AiVisibilityRow): Promise<void>; }
type GeminiClient = Pick<GoogleGenAI, "models">;

export function groundingCitations(response: unknown) {
  const candidates = (response as { candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string } }> } }> }).candidates ?? [];
  return [...new Set(candidates.flatMap((candidate) => candidate.groundingMetadata?.groundingChunks?.flatMap((chunk) => chunk.web?.uri ? [chunk.web.uri] : []) ?? []))];
}

function domain(url: string) { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } }
function matchesDomain(host: string, ourDomain: string) { const normalized = ourDomain.toLowerCase().replace(/^www\./, ""); const candidate = host.replace(/^www\./, ""); return candidate === normalized || candidate.endsWith(`.${normalized}`); }

export class GeminiGroundingClient {
  private readonly client: GeminiClient;
  private readonly model: string;
  private readonly quota: LlmQuota;
  constructor(options: { apiKey?: string; model?: string; quota?: LlmQuota; client?: GeminiClient } = {}) {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey && !options.client) throw new Error("GEMINI_API_KEY is required for AI visibility probes.");
    this.client = options.client ?? new GoogleGenAI({ apiKey: apiKey! });
    this.model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    this.quota = options.quota ?? getLlmQuota();
  }
  async probe(question: string) {
    const result = await this.quota.run({ provider: "gemini", model: this.model, request: async () => {
      const response = await this.client.models.generateContent({ model: this.model, contents: question, config: { tools: [{ googleSearch: {} }] } });
      return { value: response, usage: { inputTokens: response.usageMetadata?.promptTokenCount ?? 0, outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0 } };
    } });
    return { responseText: result.value.text ?? "", citedUrls: groundingCitations(result.value) };
  }
}

export class SupabaseAiVisibilityStore implements AiVisibilityStore {
  private db() { return createServiceSupabaseClient(); }
  async activeQuestions() {
    const { data, error } = await this.db().from("ai_probe_questions").select("id,question").eq("is_active", true);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ id: String(row.id), question: String(row.question) }));
  }
  async upsert(row: AiVisibilityRow) {
    const { error } = await this.db().from("signals_ai_visibility").insert({ date: new Date().toISOString().slice(0, 10), engine: "gemini", source: "auto", question: row.question, response_text: row.responseText, cited_domains: row.citedDomains, our_domain_cited: row.ourDomainCited, our_urls_cited: row.ourUrlsCited, competitor_domains_cited: row.competitorDomainsCited });
    if (error) throw new Error(error.message);
  }
}

export async function probeAiVisibility(store: AiVisibilityStore, client: Pick<GeminiGroundingClient, "probe">, ourDomain = process.env.SITE_DOMAIN ?? "hearinghope.in") {
  let written = 0;
  for (const probe of await store.activeQuestions()) {
    const result = await client.probe(probe.question);
    const citedDomains = [...new Set(result.citedUrls.map(domain).filter(Boolean))];
    const ourUrlsCited = result.citedUrls.filter((url) => matchesDomain(domain(url), ourDomain));
    await store.upsert({ question: probe.question, responseText: result.responseText, citedUrls: result.citedUrls, citedDomains, ourDomainCited: ourUrlsCited.length > 0, ourUrlsCited, competitorDomainsCited: citedDomains.filter((candidate) => !matchesDomain(candidate, ourDomain)) });
    written += 1;
  }
  return written;
}
