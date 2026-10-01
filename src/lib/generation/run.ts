import { articleSchema, medicalConditionSchema, medicalTestSchema, productSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { parsePastedJson } from "@/lib/automation/content-rules";
import { publishAutomationEvent } from "@/lib/automation/events";
import { ManualProvider } from "./providers/manual";
import type { LlmProvider } from "./types";
import { outputSchemas, type GenerationTicketType } from "./schemas";
import { promptFor } from "./prompts";
import { buildSystemPrompt } from "./prompts/shared";

export type GenerationTicket = { id: string; type: GenerationTicketType; status: "open" | "changes_requested" | "brief_ready"; priorityScore: number; reason: string; evidence: Record<string, unknown>; suggestedSlug: string; suggestedPageType: string; targetKeywords: string[]; targetPageId: string | null; reviewNotes: string; attempts: number; pastedResponse?: unknown };
export type DraftPage = { slug: string; pageType: string; title: string; metaTitle: string; metaDescription: string; answerSummary: string; bodyMarkdown: string; faqItems: unknown; sources: unknown; internalLinks: unknown; jsonLd: unknown; generationMeta: Record<string, unknown> };
export interface GenerationStore { listReady(limit: number): Promise<GenerationTicket[]>; publishedLinks(): Promise<Array<{ slug: string; title: string }>>; existingPage(ticket: GenerationTicket): Promise<Partial<DraftPage> | null>; updateTicket(id: string, patch: Record<string, unknown>): Promise<void>; createDraft(ticket: GenerationTicket, page: DraftPage): Promise<string>; attachProposal(ticket: GenerationTicket, proposal: unknown): Promise<void>; }

function outputContext(ticket: GenerationTicket, links: Array<{ slug: string; title: string }>, existing: Partial<DraftPage> | null) { return JSON.stringify({ ticket: { reason: ticket.reason, evidence: ticket.evidence, targetKeywords: ticket.targetKeywords, suggestedSlug: ticket.suggestedSlug, suggestedPageType: ticket.suggestedPageType, reviewNotes: ticket.reviewNotes || String((existing as { reviewNotes?: string } | null)?.reviewNotes ?? "") }, existingPage: existing, publishedSlugs: links }, null, 2); }
function jsonLdFor(page: { title: string; answerSummary: string; slug: string; pageType: string; faqItems: unknown }) { const input = { name: page.title, description: page.answerSummary, url: `${site.url}/${page.slug}` }; if (page.pageType === "product") return productSchema(input); if (page.pageType === "test") return medicalTestSchema(input); if (page.pageType === "condition") return medicalConditionSchema(input); return articleSchema(input); }
function pageDraft(ticket: GenerationTicket, result: Record<string, unknown>, provider: string, promptVersion: string): DraftPage { const value = result as { slug: string; page_type: string; title: string; meta_title: string; meta_description: string; answer_summary: string; body_markdown: string; faq_items: unknown; sources: unknown; internal_links: unknown }; const page = { slug: value.slug, pageType: value.page_type, title: value.title, metaTitle: value.meta_title, metaDescription: value.meta_description, answerSummary: value.answer_summary, bodyMarkdown: value.body_markdown, faqItems: value.faq_items, sources: value.sources, internalLinks: value.internal_links }; return { ...page, jsonLd: jsonLdFor(page), generationMeta: { source: provider === "manual" ? "manual" : "ai", provider, trigger_ticket_id: ticket.id, prompt_version: promptVersion, generated_at: new Date().toISOString() } }; }

async function finish(ticket: GenerationTicket, result: unknown, store: GenerationStore, provider: string, version: string) {
  const schema = outputSchemas[ticket.type]; const parsed = schema.safeParse(result);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
  if (ticket.type === "review_reply" && Number(ticket.evidence.rating ?? 5) <= 3 && !(parsed.data as { escalate?: boolean }).escalate) throw new Error("Reviews rated 3 stars or below must escalate.");
  if (ticket.type === "new_page" || ticket.type === "refresh") { const pageId = await store.createDraft(ticket, pageDraft(ticket, parsed.data, provider, version)); await store.updateTicket(ticket.id, { status: "draft_ready", generated_page_id: pageId, last_error: "" }); await publishAutomationEvent("ticket.draft_ready", { ticketId: ticket.id, pageId }); return; }
  if (ticket.type === "fix_schema") { const existing = await store.existingPage(ticket); if (!existing) throw new Error("Schema repair needs an existing page."); const proposal = { json_ld: jsonLdFor({ title: String(existing.title), answerSummary: String(existing.answerSummary), slug: String(existing.slug), pageType: String(existing.pageType), faqItems: existing.faqItems }) }; await store.attachProposal(ticket, proposal); await store.updateTicket(ticket.id, { status: "draft_ready", pasted_response: proposal, last_error: "" }); await publishAutomationEvent("ticket.draft_ready", { ticketId: ticket.id }); return; }
  await store.attachProposal(ticket, parsed.data); await store.updateTicket(ticket.id, { status: "draft_ready", pasted_response: parsed.data, last_error: "" }); await publishAutomationEvent("ticket.draft_ready", { ticketId: ticket.id });
}

export async function runGeneration(store: GenerationStore, provider: LlmProvider, limit = 5) {
  const tickets = (await store.listReady(Math.min(limit, 5))).slice(0, 5); const links = await store.publishedLinks(); let completed = 0; let briefed = 0;
  for (const ticket of tickets) {
    const prompt = promptFor(ticket.type, outputContext(ticket, links, await store.existingPage(ticket))); const systemPrompt = buildSystemPrompt();
    if (ticket.attempts >= 2) { await store.updateTicket(ticket.id, { status: "brief_ready", last_error: "Automatic revision limit reached; a human draft is required." }); await publishAutomationEvent("ticket.brief_ready", { ticketId: ticket.id }); briefed += 1; continue; }
    if (ticket.type === "fix_schema") { await finish(ticket, {}, store, "schema-builder", prompt.version); await store.updateTicket(ticket.id, { attempts: ticket.attempts + 1 }); completed += 1; continue; }
    if (provider.name === "manual") { await (provider as ManualProvider).prepareBrief(ticket.id, { systemPrompt, userPrompt: prompt.userPrompt }); await store.updateTicket(ticket.id, { status: "brief_ready", brief_system_prompt: systemPrompt, brief_user_prompt: prompt.userPrompt }); await publishAutomationEvent("ticket.brief_ready", { ticketId: ticket.id }); briefed += 1; continue; }
    let lastError = "";
    for (let attempt = 0; attempt < 2; attempt += 1) { try { const response = await provider.generateJson({ systemPrompt, userPrompt: `${prompt.userPrompt}${lastError ? `\n\nValidation errors from the prior response: ${lastError}` : ""}`, schema: outputSchemas[ticket.type] }); await finish(ticket, response.data, store, provider.name, prompt.version); await store.updateTicket(ticket.id, { attempts: ticket.attempts + attempt + 1 }); completed += 1; lastError = ""; break; } catch (error) { lastError = error instanceof Error ? error.message : "Generation failed."; } }
    if (lastError) await store.updateTicket(ticket.id, { status: "failed", attempts: ticket.attempts + 2, last_error: lastError });
  }
  return { processed: tickets.length, completed, briefed };
}

export async function applyPastedManualResponse(ticket: GenerationTicket, raw: string, store: GenerationStore) { const parsed = parsePastedJson(raw); if (!parsed.ok) return parsed; try { const prompt = promptFor(ticket.type, ""); await finish(ticket, parsed.value, store, "manual", prompt.version); return { ok: true as const }; } catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : "Pasted response is invalid." }; } }
