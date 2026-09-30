import { NextResponse } from "next/server";
import { listTickets } from "@/lib/automation/content-store";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  const result = await listTickets(createServiceSupabaseClient());
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, tickets: result.tickets });
}
