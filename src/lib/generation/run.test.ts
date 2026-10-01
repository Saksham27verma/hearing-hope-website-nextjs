import { describe, expect, it } from "vitest";
import { ManualProvider } from "./providers/manual";
import { applyPastedManualResponse, runGeneration, type GenerationStore, type GenerationTicket } from "./run";
import type { LlmProvider } from "./types";
import { subscribeAutomationEvent } from "@/lib/automation/events";

const output = { slug: "hearing-aid-cost", page_type: "guide", title: "Hearing aid cost in India", meta_title: "Hearing aid cost in India", meta_description: "A practical guide to hearing aid costs in India and the factors that affect them.", answer_summary: "Hearing aid prices in India vary by technology level, fitting needs, and after-care. A hearing test and consultation help an audiologist suggest suitable options and explain the full cost clearly before you decide.", body_markdown: "## What affects hearing aid cost?\n\nPrices vary by technology level and fitting support. [REVIEWER: verify] Book a consultation for a quote.", faq_items: Array.from({ length: 5 }, (_, index) => ({ question: `Question number ${index + 1}?`, answer: "This is a clear answer with enough detail for a patient and their family to understand the next step." })), sources: [{ title: "WHO hearing care", url: "https://www.who.int/health-topics/hearing-loss", publisher: "WHO" }], internal_links: ["bera-test", "hearing-aids", "contact"], target_keywords: ["hearing aid cost india"] };
const ticket = (changes: Partial<GenerationTicket> = {}): GenerationTicket => ({ id: "ticket-1", type: "new_page", status: "open", priorityScore: 10, reason: "Missing answer", evidence: {}, suggestedSlug: "hearing-aid-cost", suggestedPageType: "guide", targetKeywords: ["hearing aid cost india"], targetPageId: null, reviewNotes: "", attempts: 0, ...changes });
class MemoryStore implements GenerationStore {
  tickets: GenerationTicket[]; patches: Array<Record<string, unknown>> = []; drafts: unknown[] = []; proposals: unknown[] = [];
  constructor(tickets = [ticket()]) { this.tickets = tickets; }
  async listReady(limit: number) { return this.tickets.filter((row) => row.status === "open" || row.status === "changes_requested").sort((a, b) => b.priorityScore - a.priorityScore).slice(0, limit); }
  async publishedLinks() { return [{ slug: "bera-test", title: "BERA test" }, { slug: "hearing-aids", title: "Hearing aids" }, { slug: "contact", title: "Contact" }]; }
  async existingPage(ticket: GenerationTicket) { return ticket.type === "fix_schema" ? { slug: "bera-test", pageType: "test", title: "BERA test", answerSummary: "A hearing test that helps an audiologist understand auditory pathways.", faqItems: [] } : null; }
  async updateTicket(_id: string, patch: Record<string, unknown>) { this.patches.push(patch); }
  async createDraft(_ticket: GenerationTicket, page: unknown) { this.drafts.push(page); return "draft-1"; }
  async attachProposal(_ticket: GenerationTicket, proposal: unknown) { this.proposals.push(proposal); }
}

describe("run-generation", () => {
  it("retries once after invalid output, then creates a draft rather than publishing", async () => {
    const store = new MemoryStore([ticket({ reviewNotes: "Please clarify what happens after the test." })]); let calls = 0; let capturedPrompt = "";
    const provider: LlmProvider = { name: "gemini", generateJson: async (args) => { capturedPrompt = args.userPrompt; calls += 1; return { data: (calls === 1 ? { nope: true } : output) as never, usage: { inputTokens: 1, outputTokens: 2 } }; } };
    await expect(runGeneration(store, provider)).resolves.toMatchObject({ processed: 1, completed: 1 });
    expect(calls).toBe(2); expect(capturedPrompt).toContain("Please clarify what happens after the test."); expect(store.drafts).toHaveLength(1); expect(store.patches).toContainEqual(expect.objectContaining({ status: "draft_ready", generated_page_id: "draft-1" }));
  });

  it("uses a manual brief then validates pasted JSON through the same draft path", async () => {
    const store = new MemoryStore(); const briefs: unknown[] = []; const manual = new ManualProvider({ markBriefReady: async (id, prompts) => { briefs.push({ id, ...prompts }); } });
    await expect(runGeneration(store, manual)).resolves.toMatchObject({ briefed: 1 }); expect(briefs).toHaveLength(1);
    await expect(applyPastedManualResponse(ticket({ status: "brief_ready" }), `\`\`\`json\n${JSON.stringify(output)}\n\`\`\``, store)).resolves.toEqual({ ok: true });
    expect(store.drafts).toHaveLength(1); expect(store.patches).toContainEqual(expect.objectContaining({ status: "draft_ready" }));
  });

  it("stops after two automatic revisions and does not call the provider", async () => {
    const store = new MemoryStore([ticket({ attempts: 2, status: "changes_requested" })]); let calls = 0;
    const provider: LlmProvider = { name: "gemini", generateJson: async () => { calls += 1; return { data: output as never, usage: { inputTokens: 0, outputTokens: 0 } }; } };
    await runGeneration(store, provider); expect(calls).toBe(0); expect(store.patches).toContainEqual(expect.objectContaining({ status: "brief_ready" }));
  });

  it("repairs schema without making an LLM call", async () => {
    const store = new MemoryStore([ticket({ type: "fix_schema", targetPageId: "page-1" })]); let calls = 0;
    const provider: LlmProvider = { name: "gemini", generateJson: async () => { calls += 1; return { data: output as never, usage: { inputTokens: 0, outputTokens: 0 } }; } };
    await runGeneration(store, provider); expect(calls).toBe(0); expect(store.proposals).toHaveLength(1); expect(store.patches).toContainEqual(expect.objectContaining({ status: "draft_ready" }));
  });

  it("dry-run writes a draft but suppresses the notification-capable draft event", async () => {
    const store = new MemoryStore(); const seen: unknown[] = []; const stop = subscribeAutomationEvent("ticket.draft_ready", (event) => { seen.push(event); });
    const provider: LlmProvider = { name: "gemini", generateJson: async () => ({ data: output as never, usage: { inputTokens: 0, outputTokens: 0 } }) };
    await runGeneration(store, provider, 5, { dryRun: true }); stop();
    expect(store.drafts).toHaveLength(1); expect(seen).toEqual([]);
  });
});
