import { NextResponse } from "next/server";
import { submitContentPageForReview } from "@/lib/automation/content-store";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  const { id } = await context.params;
  const result = await submitContentPageForReview(createServiceSupabaseClient(), id);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page });
}
