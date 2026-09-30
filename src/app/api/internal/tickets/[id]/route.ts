import { NextResponse } from "next/server";
import { patchTicket } from "@/lib/automation/content-store";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON.", 400);
  }
  const result = await patchTicket(createServiceSupabaseClient(), id, body);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, ticket: result.ticket });
}
