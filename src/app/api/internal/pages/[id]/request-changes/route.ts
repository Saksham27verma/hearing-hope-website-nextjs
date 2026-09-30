import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { approvalAuthDecision } from "@/lib/automation/content-rules";
import { jsonError } from "@/lib/automation/http";
import { requestPageChanges } from "@/lib/automation/review";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (approvalAuthDecision(request.headers.get("authorization")) === "reject-bearer") {
    return jsonError("Requesting changes requires a signed-in reviewer.", 403);
  }
  const { id } = await context.params;
  let notes = "";
  try {
    const body = (await request.json()) as { review_notes?: string };
    notes = body.review_notes ?? "";
  } catch {
    return jsonError("Invalid JSON.", 400);
  }
  const session = await getAdminSession();
  if (!session) return jsonError("Requesting changes requires a signed-in reviewer.", 401);
  const result = await requestPageChanges(session.supabase, session.user.id, id, notes);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page });
}
