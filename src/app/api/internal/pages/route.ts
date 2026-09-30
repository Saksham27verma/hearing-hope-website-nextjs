import { NextResponse } from "next/server";
import { listContentPages, createContentPage } from "@/lib/automation/content-store";
import type { ContentPageInput } from "@/lib/automation/content-rules";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

function serviceOr503() {
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  return createServiceSupabaseClient();
}

export async function GET(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const supabase = serviceOr503();
  if (supabase instanceof NextResponse) return supabase;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const result = await listContentPages(supabase, {
    status: url.searchParams.get("status") ?? undefined,
    pageType: url.searchParams.get("page_type") ?? undefined,
    updatedBefore: url.searchParams.get("updated_before") ?? undefined,
    limit: Number.isFinite(limit) ? limit : 20,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, pages: result.pages, next_cursor: result.nextCursor });
}

export async function POST(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const supabase = serviceOr503();
  if (supabase instanceof NextResponse) return supabase;
  let body: ContentPageInput;
  try {
    body = (await request.json()) as ContentPageInput;
  } catch {
    return jsonError("Invalid JSON.", 400);
  }
  const result = await createContentPage(supabase, body, "ai");
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page }, { status: 201 });
}
