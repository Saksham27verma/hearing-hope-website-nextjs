import { renderLlmsTxt } from "@/lib/agent/llms-txt";
import { getSiteSettings } from "@/lib/site-cms";

export async function GET() {
  const settings = await getSiteSettings();
  return new Response(renderLlmsTxt(settings.url), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
