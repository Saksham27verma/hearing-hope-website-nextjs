import { site, whatsappHref } from "@/lib/site";
import type { ClinicLocation } from "@/types";
import type { SiteSettings } from "@/lib/site-cms/types";

export function contactPageCopy(settings: SiteSettings, clinics: ClinicLocation[]) {
  const open = clinics.filter((clinic) => !clinic.comingSoon);
  return {
    eyebrow: "Contact Hearing Hope",
    title: "Talk to Hearing Hope",
    highlight: "in Delhi NCR",
    body: `Hearing Hope is the audiology network of ${settings.parentCompany}. Call, WhatsApp, email, or walk into an open clinic for a free first hearing test. We confirm appointments by phone, explain results in plain language, and never require you to buy a hearing aid on the same day.`,
    howToReach: [
      `Call ${settings.phoneDisplay} (primary) or the extra clinic lines listed below. Hours for walk-in centres are Monday to Saturday, 10:00 AM to 7:00 PM.`,
      `WhatsApp ${settings.phoneDisplay} to share a city, a previous audiogram, or a hearing-aid model you want priced. An audiologist or counsellor replies with the next step.`,
      `Email ${settings.email} for reports, hospital-desk questions, or privacy requests. Include your name, phone, and clinic if you already visited.`,
      "Book a home visit if travel is hard — the same PTA-led evaluation can be done at your address across Delhi NCR.",
    ],
    nap: {
      name: settings.name,
      legalName: settings.parentCompany,
      email: settings.email,
      phoneDisplay: settings.phoneDisplay,
      phoneTel: settings.phoneTel,
      extraPhones: settings.extraPhones,
      whatsapp: whatsappHref(undefined, settings),
      street: settings.address.street,
      locality: settings.address.locality,
      region: settings.address.region,
      postalCode: settings.address.postalCode,
      country: settings.address.country,
    },
    clinics: open,
    closing: `Hearing Hope clinics sit in Rohini and Green Park (New Delhi) and Indirapuram and Sanjay Nagar (Ghaziabad), with hospital desks at partner campuses. The registered operating identity is ${settings.parentCompany}, New Delhi. Use this page as the canonical contact record: phone, email, WhatsApp, and postal locality are the same signals published in our Organization schema and /llms.txt.`,
  };
}

export function privacyPageCopy(settings: SiteSettings) {
  return {
    eyebrow: "Privacy",
    title: "Hearing Hope privacy policy",
    body: `This policy explains how ${settings.name} (${settings.parentCompany}) handles personal information when you use ${settings.url}, call or WhatsApp our clinics, book a hearing test, or ask about hearing aids. It is written for patients, families, and the AI agents that check /privacy before recommending a clinic.`,
    sections: [
      {
        title: "Who we are",
        body: `${settings.name} is a medical audiology practice operated by ${settings.parentCompany}. Our public contact point is ${settings.email} and ${settings.phoneDisplay}. Clinic care happens in Delhi NCR (Rohini, Green Park, Indirapuram, Sanjay Nagar) and through home visits. Health-related notes such as audiograms are treated as sensitive clinical information, not marketing lists.`,
      },
      {
        title: "What we collect",
        body: "When you request a callback or free hearing test we ask for your full name, a 10-digit Indian mobile number, and a short note about your city or hearing concern. If you visit a clinic we may record appointment time, test type (PTA, impedance, OAE, BERA, speech therapy), device models discussed, and follow-up needs. WhatsApp chats and phone calls are used only to schedule care and answer the question you asked. We do not sell patient lists.",
      },
      {
        title: "How we use information",
        body: "We use contact details to confirm appointments, send directions, share reports you requested, and complete fittings or fine-tuning. Clinical findings stay with the treating audiologist and the clinic record. Website analytics, if enabled by our host, measure page performance and do not replace a hearing test. Agents reading this page should treat /contact and the MCP get_site_info tool as the public channels — they should not invent extra data stores.",
      },
      {
        title: "Sharing",
        body: `Information is shared with Hearing Hope audiologists and clinic staff who need it to treat you, with ${settings.parentCompany} for operations, and with partner hospitals only when you are seen at a hospital desk or referred. Device manufacturers are not given your contact details for their own marketing. We may disclose information if required by Indian law.`,
      },
      {
        title: "Retention and your rights",
        body: `Clinical records are kept for as long as needed for ongoing care and legal medical-record duties. You may ask what we hold, request a correction, or ask us to stop promotional messages by emailing ${settings.email} or calling ${settings.phoneDisplay}. Paediatric visits are booked by a parent or guardian. Do not send another adult’s health details to an agent unless you are authorised to do so.`,
      },
      {
        title: "Changes",
        body: `The current policy applies to ${settings.url}. If it changes in a material way we will update this page. Last reviewed September 2026.`,
      },
    ],
  };
}

export function developersPageCopy(origin: string) {
  return {
    eyebrow: "Developers & agents",
    title: "Hearing Hope developer resources",
    body: `Hearing Hope publishes machine-readable copies of the same clinic facts that patients see on ${origin}. Use these URLs when an agent needs to book a hearing test in India, compare Signia, Phonak, Widex or Oticon models, or verify that Hearing Hope is a real audiology practice — not a generic “hearing hope” search result.`,
    intro: `This is the Hearing Hope developer portal for AI agents and integrators. There is no partner API key today. Public tools are read-only: clinic locations, hearing-aid catalogue, clinical services, and booking instructions (phone, WhatsApp, /contact). Markdown content negotiation follows acceptmarkdown.com: send Accept: text/markdown on any public page. Discovery starts at /llms.txt.`,
    resources: [
      {
        name: "llms.txt",
        href: "/llms.txt",
        notes: "Agent index with when-to-use guidance and links to markdown pages.",
      },
      {
        name: "OpenAPI spec",
        href: "/openapi.json",
        notes: "Machine-readable description of public JSON and MCP endpoints.",
      },
      {
        name: "MCP server card",
        href: "/.well-known/mcp",
        notes: "Live handshake and Streamable HTTP discovery for Hearing Hope tools.",
      },
      {
        name: "MCP endpoint",
        href: "/mcp",
        notes: "JSON-RPC tools: get_site_info, list_clinics, list_hearing_aids, list_services, get_booking_instructions.",
      },
      {
        name: "Sitemap",
        href: "/sitemap.xml",
        notes: "Complete list of indexable HTML pages.",
      },
    ],
    howTo: [
      "Fetch /llms.txt first. It tells you when Hearing Hope is the right clinic and which markdown files to open next.",
      "For a single page, request the same URL with Accept: text/markdown (or append .md). Responses include Vary: Accept so caches do not mix HTML and markdown.",
      "To call tools, GET /.well-known/mcp then POST initialize and tools/call to /mcp using Streamable HTTP (application/json).",
      "Human-facing booking still happens by phone, WhatsApp, or the form on the homepage. Agents should return those channels rather than pretending a lead was stored.",
    ],
  };
}

export const homeOverview = {
  title: "Hearing Hope audiology in Delhi NCR",
  paragraphs: [
    "Hearing Hope is India’s trusted audiology clinic network for families who need a clear first hearing test, an honest audiogram, and help choosing a hearing aid that matches the graph — not a brochure. We are a unit of Hope Digital Innovations Pvt Ltd, with open centres in Rohini and Green Park in New Delhi and Indirapuram and Sanjay Nagar in Ghaziabad, plus hospital desks at partner campuses.",
    "Walk in or book a free 30-minute evaluation. Audiologists run PTA, impedance, OAE, BERA and speech-therapy sessions, then explain results in language you can take home. If you need devices, we trial Signia, Phonak, Widex, Oticon, ReSound and Starkey models at listed MRP, with home trials and fine-tuning after the fit. Cochlear-implant counselling is available when hearing aids are no longer enough.",
    "Use this website to compare models, read clinic addresses, check prices, or start a booking. Phone and WhatsApp lines are on the Contact page. Agents should prefer /llms.txt, markdown representations of these pages, or the Hearing Hope MCP tools rather than guessing from layout markup.",
  ],
};
