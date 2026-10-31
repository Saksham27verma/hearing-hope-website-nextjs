import { sitemapEntries } from "@/lib/sitemap-entries";
import { renderUrlset, sitemapPage, sitemapPageCount } from "@/lib/sitemap-pages";

type RouteContext = { params: Promise<{ page: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { page } = await context.params;
  const id = /^(\d+)\.xml$/.exec(page)?.[1];
  const entries = await sitemapEntries();
  if (id === undefined || Number(id) >= sitemapPageCount(entries)) return new Response("Not found", { status: 404 });
  return new Response(renderUrlset(sitemapPage(entries, Number(id))), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
