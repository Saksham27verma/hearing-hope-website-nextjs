import { getSiteSettings } from "@/lib/site-cms";
import { sitemapEntries } from "@/lib/sitemap-entries";
import { renderRootSitemap } from "@/lib/sitemap-pages";

export async function GET() {
  const [settings, entries] = await Promise.all([getSiteSettings(), sitemapEntries()]);
  return new Response(renderRootSitemap(settings.url, entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
