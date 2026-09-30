import { renderLlmsTxt } from "@/lib/agent/llms-txt";
import { getSiteSettings } from "@/lib/site-cms";
import { listPublishedContentPages } from "@/lib/content-pages";

export async function GET() {
  const [settings, contentPages] = await Promise.all([getSiteSettings(), listPublishedContentPages()]);
  return new Response(renderLlmsTxt(settings.url, contentPages), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
