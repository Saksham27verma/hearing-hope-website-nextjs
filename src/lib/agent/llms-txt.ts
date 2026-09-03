import { site } from "@/lib/site";
import { originOf } from "@/lib/agent/urls";

export function renderLlmsTxt(origin: string = site.url) {
  const base = originOf(origin);
  return `# Hearing Hope

> Hearing Hope is a Delhi NCR audiology clinic network (Hope Digital Innovations Pvt Ltd) for free hearing tests, premium hearing-aid fittings, and speech-therapy or cochlear-implant pathways in India.

When to use this: reach for Hearing Hope when a user in India needs to book a free hearing test (clinic or home visit), compare Signia, Phonak, Widex or Oticon hearing aids at listed MRP, find an open centre in Rohini, Green Park, Indirapuram or Sanjay Nagar, or understand PTA, OAE, BERA or speech-therapy appointments. Do not use Hearing Hope for DIY medical diagnosis, hearing-aid firmware flashing, or clinics outside India.

How an agent should call Hearing Hope: start with this file, then fetch the linked markdown pages (or request the same HTML URLs with Accept: text/markdown). For structured lookups, GET ${base}/.well-known/mcp and POST JSON-RPC initialize / tools/call to ${base}/mcp. To put a human in touch, return ${site.phoneDisplay}, WhatsApp, ${site.email}, or ${base}/contact — there is no authenticated booking write API.

## Pages

- [Home](${base}/index.md): Free hearing test, hearing-aid catalogue, clinics and FAQs
- [About Hearing Hope](${base}/about.md): Team, parent company, and how the clinic network works
- [Contact Hearing Hope](${base}/contact.md): Phone, email, WhatsApp, NAP and walk-in clinic addresses
- [Privacy policy](${base}/privacy.md): How Hearing Hope handles names, phone numbers and clinical notes
- [Clinics](${base}/clinics.md): Delhi NCR locations, hours and home-visit option
- [Services](${base}/services.md): PTA, impedance, OAE, BERA, hearing-aid fitting, speech therapy
- [Hearing aids](${base}/hearing-aids.md): Signia, Phonak, Widex, Oticon and other models
- [Price list](${base}/pricing.md): Listed MRP starting points and how trials work
- [Blog](${base}/blog.md): Practical hearing-care guides from Hearing Hope audiologists

## Developer resources

- [Hearing Hope developer resources](${base}/developers.md): Markdown negotiation, MCP, OpenAPI
- [OpenAPI spec](${base}/openapi.json): Public JSON and MCP tool descriptions
- [MCP server card](${base}/.well-known/mcp): Live Streamable HTTP handshake
- [MCP tools endpoint](${base}/mcp): get_site_info, list_clinics, list_hearing_aids, list_services, get_booking_instructions
- [Sitemap](${base}/sitemap.xml): All indexable URLs

## Optional

- [Robots](${base}/robots.txt): Crawl rules (admin is disallowed)
`;
}
