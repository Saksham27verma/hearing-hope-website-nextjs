import { NextResponse } from "next/server";
import { getContentPage, patchContentPage } from "@/lib/automation/content-store";
import type { ContentPageInput } from "@/lib/automation/content-rules";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

function serviceOr503() {
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  return createServiceSupabaseClient();
}

export async function GET(request: Request, context: RouteContext) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const supabase = serviceOr503();
  if (supabase instanceof NextResponse) return supabase;
  const { id } = await context.params;
  const result = await getContentPage(supabase, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page });
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const supabase = serviceOr503();
  if (supabase instanceof NextResponse) return supabase;
  const { id } = await context.params;
  let body: ContentPageInput;
  try {
    body = (await request.json()) as ContentPageInput;
  } catch {
    return jsonError("Invalid JSON.", 400);
  }
  const result = await patchContentPage(supabase, id, body);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page });
}
