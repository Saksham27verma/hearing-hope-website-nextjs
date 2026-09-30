import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { approvalAuthDecision } from "@/lib/automation/content-rules";
import { jsonError } from "@/lib/automation/http";
import { approvePageAsReviewer } from "@/lib/automation/review";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (approvalAuthDecision(request.headers.get("authorization")) === "reject-bearer") {
    return jsonError("Approval requires a signed-in reviewer.", 403);
  }
  const session = await getAdminSession();
  if (!session) return jsonError("Approval requires a signed-in reviewer.", 401);
  const { id } = await context.params;
  const result = await approvePageAsReviewer(session.supabase, session.user.id, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ ok: true, page: result.page });
}
