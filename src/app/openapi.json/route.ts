import { openApiSpec } from "@/lib/agent/openapi";
import { getSiteSettings } from "@/lib/site-cms";

export async function GET() {
  const settings = await getSiteSettings();
  return Response.json(openApiSpec(settings.url), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
