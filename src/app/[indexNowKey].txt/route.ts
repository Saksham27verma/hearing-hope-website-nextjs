import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ indexNowKey?: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { indexNowKey } = await context.params;
  const configured = process.env.INDEXNOW_KEY;
  if (!configured || indexNowKey !== configured) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(configured, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
