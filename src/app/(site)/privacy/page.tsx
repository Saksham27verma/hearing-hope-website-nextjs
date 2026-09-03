import type { Metadata } from "next";
import { TrustPageShell } from "@/components/site/TrustPageShell";
import { privacyPageCopy } from "@/lib/agent/trust-content";
import { getSiteSettings } from "@/lib/site-cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Privacy policy",
    description: `How Hearing Hope and ${settings.parentCompany} handle names, phone numbers, clinical notes and website data.`,
    alternates: { canonical: "/privacy" },
    openGraph: {
      title: `Privacy policy | ${settings.name}`,
      description: "Privacy practices for Hearing Hope clinics, bookings and website visits.",
    },
  };
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const copy = privacyPageCopy(settings);
  return (
    <TrustPageShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body}>
      <div className="mx-auto max-w-3xl space-y-8">
        {copy.sections.map((section) => (
          <section key={section.title} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-brand-dark">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">{section.body}</p>
          </section>
        ))}
      </div>
    </TrustPageShell>
  );
}
