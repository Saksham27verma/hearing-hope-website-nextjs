import { describe, expect, it } from "vitest";
import { applyPastedManualResponse, runGeneration, type GenerationStore, type GenerationTicket } from "@/lib/generation/run";
import { ManualProvider } from "@/lib/generation/providers/manual";
import type { LlmProvider } from "@/lib/generation/types";
import { approvePageAsReviewer } from "./review";

const generated = { slug: "hearing-aid-cost", page_type: "guide", title: "Hearing aid cost in India", meta_title: "Hearing aid cost in India", meta_description: "A practical guide to hearing aid costs in India and factors that affect them.", answer_summary: "Hearing aid costs in India vary by technology level, fitting needs, and after-care, so an audiologist should explain a suitable option before a decision is made.", body_markdown: "## Costs\n\nA reviewer must check this draft before it can be published, explain pricing carefully, and confirm suitability after an appropriate hearing assessment. ".repeat(3), faq_items: Array.from({ length: 5 }, (_, index) => ({ question: `Question ${index + 1}?`, answer: "A clear answer with enough detail to help a patient understand the next suitable step." })), sources: [{ title: "WHO", url: "https://www.who.int/health-topics/hearing-loss", publisher: "WHO" }], internal_links: ["bera-test", "hearing-aids", "contact"], target_keywords: ["hearing aid cost india"] };
const ticket: GenerationTicket = { id: "ticket-1", type: "new_page", status: "open", priorityScore: 1, reason: "Missing page", evidence: {}, suggestedSlug: generated.slug, suggestedPageType: "guide", targetKeywords: generated.target_keywords, targetPageId: null, reviewNotes: "", attempts: 0 };
class DraftStore implements GenerationStore { drafts: unknown[] = []; async listReady() { return [ticket]; } async publishedLinks() { return []; } async existingPage() { return null; } async updateTicket() {} async createDraft(_ticket: GenerationTicket, page: unknown) { this.drafts.push(page); return "page-1"; } async attachProposal() {} }

function reviewerDb() {
  const page = { id: "page-1", slug: generated.slug, page_type: "guide", status: "draft", reviewed_by_id: null, reviewed_at: null };
  const chain = (table: string) => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => table === "team_members" ? { data: { id: "reviewer-1", is_reviewer: true }, error: null } : { data: page, error: null } }) }),
    update: (patch: Record<string, unknown>) => ({ eq: () => ({ select: () => ({ single: async () => { Object.assign(page, patch); return { data: page, error: null }; } }) }) }),
  });
  return { from: (table: string) => chain(table) };
}

describe("ticket → draft → human approval → publish", () => {
  it("Gemini path creates a draft, then an explicit reviewer approval publishes it with audit fields", async () => {
    const store = new DraftStore(); const gemini: LlmProvider = { name: "gemini", generateJson: async () => ({ data: generated as never, usage: { inputTokens: 1, outputTokens: 1 } }) };
    await runGeneration(store, gemini); expect(store.drafts).toHaveLength(1);
    const result = await approvePageAsReviewer(reviewerDb() as never, "auth-user", "page-1", { publish: async () => [] });
    expect(result).toMatchObject({ ok: true, page: { status: "published", reviewed_by_id: "reviewer-1" } }); expect(result.ok && result.page.reviewed_at).toBeTruthy();
  });

  it("manual copy/paste follows the same draft-only path until the same explicit approval", async () => {
    const store = new DraftStore(); const manual = new ManualProvider({ markBriefReady: async () => {} });
    await runGeneration(store, manual); expect(store.drafts).toEqual([]); // a manual ticket cannot publish or draft itself
    await expect(applyPastedManualResponse({ ...ticket, status: "brief_ready" }, JSON.stringify(generated), store)).resolves.toEqual({ ok: true });
    expect(store.drafts).toHaveLength(1);
    await expect(approvePageAsReviewer(reviewerDb() as never, "auth-user", "page-1", { publish: async () => [] })).resolves.toMatchObject({ ok: true, page: { status: "published" } });
  });
});
