import { handleMcpGetCard, handleMcpOptions, handleMcpPost } from "@/lib/agent/mcp";
import { getSiteSettings } from "@/lib/site-cms";

export async function GET() {
  const settings = await getSiteSettings();
  return handleMcpGetCard(settings.url);
}

export async function POST(request: Request) {
  return handleMcpPost(request);
}

export function OPTIONS() {
  return handleMcpOptions();
}
