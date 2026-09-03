import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/site/TrustPageShell";
import { developersPageCopy } from "@/lib/agent/trust-content";
import { getSiteSettings } from "@/lib/site-cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Hearing Hope developer resources",
    description:
      "llms.txt, markdown content negotiation, OpenAPI and the Hearing Hope MCP server for agents integrating with our clinic data.",
    alternates: { canonical: "/developers" },
    openGraph: {
      title: `Hearing Hope developer resources | ${settings.name}`,
      description: "Machine-readable endpoints for Hearing Hope clinics, hearing aids and booking channels.",
    },
  };
}

export default async function DevelopersPage() {
  const settings = await getSiteSettings();
  const copy = developersPageCopy(settings.url);
  return (
    <TrustPageShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body}>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark">What Hearing Hope publishes for agents</h2>
          <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">{copy.intro}</p>
          <ol className="mt-6 space-y-3">
            {copy.howTo.map((item, index) => (
              <li key={item} className="rounded-[1.5rem] bg-white p-5 text-sm leading-7 text-brand-muted ring-1 ring-black/5">
                <span className="font-semibold text-brand-orange">{index + 1}.</span> {item}
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Predictable URLs</h2>
          <ul className="mt-5 space-y-3">
            {copy.resources.map((item) => (
              <li key={item.href} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5">
                <Link href={item.href} className="text-sm font-bold text-brand-dark hover:text-brand-orange">
                  {item.name}
                </Link>
                <p className="mt-1 font-mono text-xs text-brand-teal">{item.href}</p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TrustPageShell>
  );
}
