"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { changedReviewFields, normalizeQuestion, parsePastedJson, shouldTrackReviewEdits, validateMetaLengths } from "@/lib/automation/content-rules";
import { planStaffQuestionWrite } from "@/lib/automation/questions";
import { approvePageAsReviewer, dismissPage, requestPageChanges } from "@/lib/automation/review";
import { validateJsonLd } from "@/lib/automation/schema-validate";

export type AutomationActionResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown): AutomationActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
}

function refreshQueue() {
  revalidatePath("/admin/automation");
  revalidatePath("/admin/automation/queue");
  revalidatePath("/admin/automation/tickets");
}

export async function saveContentDraft(input: {
  id: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  answerSummary: string;
  bodyMarkdown: string;
  faqItems: unknown;
  sources: unknown;
  internalLinks: unknown;
  jsonLd: unknown;
}): Promise<AutomationActionResult> {
  try {
    const metaError = validateMetaLengths(input.metaTitle, input.metaDescription);
    if (metaError) return { ok: false, error: metaError };
    const { supabase, user } = await requireAdmin();
    const { data: existing, error: loadError } = await supabase.from("content_pages").select("*").eq("id", input.id).maybeSingle();
    if (loadError || !existing) return { ok: false, error: loadError?.message ?? "Page not found." };
    const next = {
      title: input.title,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
      canonical_url: input.canonicalUrl,
      answer_summary: input.answerSummary,
      body_markdown: input.bodyMarkdown,
      faq_items: input.faqItems,
      sources: input.sources,
      internal_links: input.internalLinks,
      json_ld: input.jsonLd,
    };
    const generation = existing.generation_meta as { source?: string } | null;
    if (shouldTrackReviewEdits(generation)) {
      const { data: member } = await supabase.from("team_members").select("id").eq("auth_user_id", user.id).maybeSingle();
      const { data: ticket } = await supabase.from("content_tickets").select("id").eq("generated_page_id", input.id).maybeSingle();
      const changes = changedReviewFields(existing as Record<string, unknown>, next);
      if (changes.length) {
        const { error: editError } = await supabase.from("review_edits").insert(
          changes.map((change) => ({
            page_id: input.id,
            ticket_id: ticket?.id ?? null,
            reviewer_id: member?.id ?? null,
            field: change.field,
            ai_version: change.ai_version,
            human_version: change.human_version,
          })),
        );
        if (editError) return { ok: false, error: editError.message };
      }
    }
    const { error } = await supabase.from("content_pages").update(next).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function approveContentDraft(id: string): Promise<AutomationActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    const result = await approvePageAsReviewer(supabase, user.id, id);
    if (!result.ok) return { ok: false, error: result.error };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function requestContentChanges(id: string, notes: string): Promise<AutomationActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    const result = await requestPageChanges(supabase, user.id, id, notes);
    if (!result.ok) return { ok: false, error: result.error };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function dismissContentDraft(id: string): Promise<AutomationActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    const result = await dismissPage(supabase, user.id, id);
    if (!result.ok) return { ok: false, error: result.error };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function validateContentJsonLd(value: unknown) {
  return validateJsonLd(value);
}

export async function setTicketStatus(id: string, status: "open" | "dismissed"): Promise<AutomationActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const patch: Record<string, unknown> = { status, last_error: "" };
    if (status === "dismissed") patch.resolved_at = new Date().toISOString();
    if (status === "open") patch.resolved_at = null;
    const { error } = await supabase.from("content_tickets").update(patch).eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function pasteTicketResponse(id: string, raw: string): Promise<AutomationActionResult> {
  try {
    const parsed = parsePastedJson(raw);
    if (!parsed.ok) return parsed;
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("content_tickets")
      .update({ pasted_response: parsed.value, status: "draft_ready", last_error: "" })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshQueue();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function saveManualAiChecks(input: {
  rows: { question: string; engine: string; cited: boolean; competitors: string }[];
}): Promise<AutomationActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    const { data: member } = await supabase.from("team_members").select("id").eq("auth_user_id", user.id).maybeSingle();
    const today = new Date().toISOString().slice(0, 10);
    const payload = input.rows
      .filter((row) => row.cited || row.competitors.trim())
      .map((row) => ({
        date: today,
        engine: row.engine,
        source: "manual",
        question: row.question,
        our_domain_cited: row.cited,
        competitor_domains_cited: row.competitors
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        recorded_by_id: member?.id ?? null,
      }));
    if (!payload.length) return { ok: false, error: "Tick a citation or add a competitor domain before saving." };
    const { error } = await supabase.from("signals_ai_visibility").insert(payload);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/automation");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function submitPatientQuestion(input: {
  question: string;
  clinicId: string;
  note: string;
}): Promise<AutomationActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const normalized = normalizeQuestion(input.question);
    const { data: existing, error: loadError } = await supabase
      .from("signals_questions")
      .select("id, seen_count, clinic_id")
      .eq("normalized_question", normalized)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    const planned = planStaffQuestionWrite(input, existing);
    if (!planned.ok) return planned;
    const { error } = planned.mode === "insert"
      ? await supabase.from("signals_questions").insert(planned.row)
      : await supabase.from("signals_questions").update(planned.row).eq("id", planned.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
