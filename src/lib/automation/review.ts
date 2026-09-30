import type { SupabaseClient } from "@supabase/supabase-js";
import { publishAutomationEvent } from "@/lib/automation/events";

type Db = SupabaseClient;

async function reviewerForUser(supabase: Db, userId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("id, is_reviewer")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message, status: 500 };
  if (!data?.is_reviewer) {
    return { ok: false as const, error: "Only a reviewer can take this action.", status: 403 };
  }
  return { ok: true as const, reviewerId: String(data.id) };
}

async function syncTicket(supabase: Db, pageId: string, status: string, resolved: boolean) {
  const patch: Record<string, unknown> = { status };
  if (resolved) patch.resolved_at = new Date().toISOString();
  await supabase.from("content_tickets").update(patch).eq("generated_page_id", pageId);
}

export async function approvePageAsReviewer(supabase: Db, userId: string, pageId: string) {
  const reviewer = await reviewerForUser(supabase, userId);
  if (!reviewer.ok) return reviewer;
  const { data: page, error } = await supabase.from("content_pages").select("id, status, slug, page_type").eq("id", pageId).maybeSingle();
  if (error) return { ok: false as const, error: error.message, status: 500 };
  if (!page) return { ok: false as const, error: "Page not found.", status: 404 };
  if (!["draft", "in_review", "changes_requested"].includes(String(page.status))) {
    return { ok: false as const, error: "This page is not waiting for review.", status: 400 };
  }

  const reviewedAt = new Date().toISOString();
  const approved = await supabase
    .from("content_pages")
    .update({ status: "approved", reviewed_by_id: reviewer.reviewerId, reviewed_at: reviewedAt })
    .eq("id", pageId)
    .select("id")
    .single();
  if (approved.error) return { ok: false as const, error: approved.error.message, status: 400 };

  const published = await supabase.from("content_pages").update({ status: "published" }).eq("id", pageId).select("*").single();
  if (published.error) return { ok: false as const, error: published.error.message, status: 400 };
  await syncTicket(supabase, pageId, "published", true);
  await publishAutomationEvent("page.published", {
    pageId,
    slug: published.data.slug,
    pageType: published.data.page_type,
  });
  return { ok: true as const, page: published.data };
}

export async function requestPageChanges(supabase: Db, userId: string, pageId: string, notes: string) {
  const reviewer = await reviewerForUser(supabase, userId);
  if (!reviewer.ok) return reviewer;
  const trimmed = notes.trim();
  if (!trimmed) return { ok: false as const, error: "Add a note describing the changes.", status: 400 };
  const { data, error } = await supabase
    .from("content_pages")
    .update({ status: "changes_requested", review_notes: trimmed })
    .eq("id", pageId)
    .select("*")
    .single();
  if (error) return { ok: false as const, error: error.message, status: 400 };
  await syncTicket(supabase, pageId, "changes_requested", false);
  return { ok: true as const, page: data };
}

export async function dismissPage(supabase: Db, userId: string, pageId: string) {
  const reviewer = await reviewerForUser(supabase, userId);
  if (!reviewer.ok) return reviewer;
  const { data, error } = await supabase.from("content_pages").update({ status: "archived" }).eq("id", pageId).select("*").single();
  if (error) return { ok: false as const, error: error.message, status: 400 };
  await syncTicket(supabase, pageId, "dismissed", true);
  await publishAutomationEvent("page.archived", { pageId });
  return { ok: true as const, page: data };
}
