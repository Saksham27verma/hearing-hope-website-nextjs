import { markdownContentHeaders } from "@/lib/agent/accept";
import { renderPathMarkdown } from "@/lib/agent/markdown";

type RouteContext = { params: Promise<{ slug?: string[] }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug = [] } = await context.params;
  const pathname = slug.length ? `/${slug.join("/")}` : "/";
  const result = await renderPathMarkdown(pathname);
  return new Response(result.body, {
    status: result.status,
    headers: markdownContentHeaders(),
  });
}
