import { NextResponse } from "next/server";
import { jsonError, requireInternalToken } from "@/lib/automation/http";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  if (!isServiceRoleConfigured()) return jsonError("Service role is not configured.", 503);
  const { data, error } = await createServiceSupabaseClient()
    .from("clinics")
    .select("*")
    .order("sort_order");
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true, clinics: data ?? [] });
}
