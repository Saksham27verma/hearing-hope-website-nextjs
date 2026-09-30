import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAutomationPatch,
  buildCreateRow,
  decodeCursor,
  encodeCursor,
  type ContentPageInput,
  type ContentPageRow,
  type GenerationSource,
  ticketPatchAllowed,
} from "@/lib/automation/content-rules";

type Db = SupabaseClient;

function messageOf(error: { message?: string; code?: string } | null) {
  if (!error) return "Request failed.";
  if (error.code === "23505") return "That slug is already in use.";
  if (error.code === "23514" && /slug is immutable/i.test(error.message ?? "")) return "slug is immutable after publish.";
  if (error.code === "P0001") return error.message ?? "Request failed.";
  return error.message ?? "Request failed.";
}

export async function listContentPages(
  supabase: Db,
  filters: { status?: string; pageType?: string; updatedBefore?: string; limit?: number; cursor?: string },
) {
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  let query = supabase.from("content_pages").select("*").order("created_at", { ascending: false }).order("id", { ascending: false }).limit(limit + 1);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.pageType) query = query.eq("page_type", filters.pageType);
  if (filters.updatedBefore) query = query.lt("updated_at", filters.updatedBefore);
  if (filters.cursor) {
    const decoded = decodeCursor(filters.cursor);
    if (!decoded) return { ok: false as const, error: "cursor is invalid.", status: 400 };
    query = query.or(`created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`);
  }
  const { data, error } = await query;
  if (error) return { ok: false as const, error: messageOf(error), status: 500 };
  const rows = data ?? [];
  const page = rows.slice(0, limit);
  const last = page[page.length - 1] as { created_at?: string; id?: string } | undefined;
  const nextCursor = rows.length > limit && last?.created_at && last.id ? encodeCursor(last.created_at, last.id) : null;
  return { ok: true as const, pages: page, nextCursor };
}

export async function getContentPage(supabase: Db, id: string) {
  const { data, error } = await supabase.from("content_pages").select("*").eq("id", id).maybeSingle();
  if (error) return { ok: false as const, error: messageOf(error), status: 500 };
  if (!data) return { ok: false as const, error: "Page not found.", status: 404 };
  return { ok: true as const, page: data };
}

export async function createContentPage(supabase: Db, input: ContentPageInput, source: GenerationSource) {
  const built = buildCreateRow(input, source);
  if (!built.ok) return { ok: false as const, error: built.error, status: 400 };
  const { data, error } = await supabase.from("content_pages").insert(built.row).select("*").single();
  if (error) return { ok: false as const, error: messageOf(error), status: error.code === "23505" ? 409 : 500 };
  return { ok: true as const, page: data };
}

export async function patchContentPage(supabase: Db, id: string, input: ContentPageInput) {
  const current = await getContentPage(supabase, id);
  if (!current.ok) return current;
  const built = buildAutomationPatch(current.page as ContentPageRow, input);
  if (!built.ok) return { ok: false as const, error: built.error, status: 400 };
  if (!Object.keys(built.patch).length) return { ok: true as const, page: current.page };
  const { data, error } = await supabase.from("content_pages").update(built.patch).eq("id", id).select("*").single();
  if (error) return { ok: false as const, error: messageOf(error), status: 400 };
  return { ok: true as const, page: data };
}

export async function submitContentPageForReview(supabase: Db, id: string) {
  const current = await getContentPage(supabase, id);
  if (!current.ok) return current;
  const status = String((current.page as { status?: string }).status);
  if (!["draft", "changes_requested"].includes(status)) {
    return { ok: false as const, error: "Only a draft can be submitted for review.", status: 400 };
  }
  const { data, error } = await supabase.from("content_pages").update({ status: "in_review" }).eq("id", id).select("*").single();
  if (error) return { ok: false as const, error: messageOf(error), status: 500 };
  return { ok: true as const, page: data };
}

export async function listTickets(supabase: Db) {
  const { data, error } = await supabase.from("content_tickets").select("*").order("priority_score", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  if (error) return { ok: false as const, error: messageOf(error), status: 500 };
  return { ok: true as const, tickets: data ?? [] };
}

export async function patchTicket(supabase: Db, id: string, input: Record<string, unknown>) {
  const statusCheck = ticketPatchAllowed(typeof input.status === "string" ? input.status : undefined);
  if (!statusCheck.ok) return { ok: false as const, error: statusCheck.error, status: 400 };
  const allowed = [
    "status",
    "priority_score",
    "reason",
    "evidence",
    "target_page_id",
    "target_clinic_id",
    "suggested_slug",
    "suggested_page_type",
    "target_keywords",
    "assigned_reviewer_id",
    "generated_page_id",
    "brief_system_prompt",
    "brief_user_prompt",
    "last_error",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  const { data, error } = await supabase.from("content_tickets").update(patch).eq("id", id).select("*").single();
  if (error) return { ok: false as const, error: messageOf(error), status: 400 };
  return { ok: true as const, ticket: data };
}
