import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/automation/content-rules";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function requireInternalToken(request: Request) {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!bearerMatches(request.headers.get("authorization"), expected)) {
    return jsonError("Unauthorized.", 401);
  }
  return null;
}
