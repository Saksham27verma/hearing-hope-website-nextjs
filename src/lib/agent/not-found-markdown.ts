import { site } from "@/lib/site";
import { originOf } from "@/lib/agent/urls";

export function renderNotFoundMarkdown(origin: string = site.url) {
  const base = originOf(origin);
  return `# Page not found

This path does not exist on Hearing Hope.

Where to look next:

- [llms.txt](${base}/llms.txt) — when to use Hearing Hope and curated markdown links
- [Sitemap](${base}/sitemap.xml) — every indexable HTML page
- [Home](${base}/) — free hearing test, hearing aids, clinics
- [About](${base}/about) — who we are
- [Contact](${base}/contact) — phone, email, WhatsApp, clinic addresses
- [Developer resources](${base}/developers) — markdown negotiation, OpenAPI, MCP
`;
}
