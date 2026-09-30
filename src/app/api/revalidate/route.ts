import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/automation/content-rules";
import { revalidateContentSeo } from "@/lib/content-revalidate";

export async function POST(request: Request) {
  if (!bearerMatches(request.headers.get("authorization"), process.env.REVALIDATE_SECRET)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let slug: string | undefined;
  try {
    const body = (await request.json()) as { slug?: unknown };
    if (typeof body.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) slug = body.slug;
  } catch {
    // A request body is optional for revalidating shared SEO resources.
  }
  revalidateContentSeo(slug);
  return NextResponse.json({ ok: true, slug: slug ?? null });
}
