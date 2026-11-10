import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/automation/content-rules";
import { revalidateContentSeo } from "@/lib/content-revalidate";
import { invalidateBlog } from "@/lib/blog";
import { invalidateSiteCms } from "@/lib/site-cms";

export async function POST(request: Request) {
  if (!bearerMatches(request.headers.get("authorization"), process.env.REVALIDATE_SECRET)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let slug: string | undefined;
  let cms = false;
  try {
    const body = (await request.json()) as { slug?: unknown; cms?: unknown };
    if (typeof body.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) slug = body.slug;
    cms = body.cms === true;
  } catch {
    // A request body is optional for revalidating shared SEO resources.
  }
  revalidateContentSeo(slug);
  // `cms: true` also expires the site CMS and blog caches, for edits made
  // straight in Supabase rather than through the admin.
  if (cms) {
    invalidateSiteCms();
    invalidateBlog();
  }
  return NextResponse.json({ ok: true, slug: slug ?? null, cms });
}
