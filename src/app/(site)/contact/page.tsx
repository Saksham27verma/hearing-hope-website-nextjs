import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { TrustPageShell } from "@/components/site/TrustPageShell";
import { contactPageCopy } from "@/lib/agent/trust-content";
import { getSiteSettings, listOpenClinics } from "@/lib/site-cms";
import { toTelHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Contact Hearing Hope",
    description: `Call, WhatsApp or visit Hearing Hope in Delhi NCR. ${settings.phoneDisplay} · ${settings.email}.`,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `Contact Hearing Hope | ${settings.name}`,
      description: "Phone, email, WhatsApp and walk-in clinic addresses for Hearing Hope.",
    },
  };
}

export default async function ContactPage() {
  const [settings, clinics] = await Promise.all([getSiteSettings(), listOpenClinics()]);
  const copy = contactPageCopy(settings, clinics);

  return (
    <TrustPageShell eyebrow={copy.eyebrow} title={copy.title} highlight={copy.highlight} body={copy.body}>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark">How to reach Hearing Hope</h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-brand-muted">
            {copy.howToReach.map((item) => (
              <li key={item.slice(0, 24)}>{item}</li>
            ))}
          </ul>
          <dl className="mt-8 space-y-3 rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
            <div className="flex items-start gap-3 text-sm">
              <Phone className="mt-0.5 h-4 w-4 text-brand-orange" />
              <div>
                <dt className="font-semibold text-brand-dark">Phone</dt>
                <dd>
                  <a href={toTelHref(copy.nap.phoneTel)} className="text-brand-muted hover:text-brand-dark">
                    {copy.nap.phoneDisplay}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Mail className="mt-0.5 h-4 w-4 text-brand-orange" />
              <div>
                <dt className="font-semibold text-brand-dark">Email</dt>
                <dd>
                  <a href={`mailto:${copy.nap.email}`} className="text-brand-muted hover:text-brand-dark">
                    {copy.nap.email}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 text-brand-orange" />
              <div>
                <dt className="font-semibold text-brand-dark">WhatsApp</dt>
                <dd>
                  <a href={copy.nap.whatsapp} className="text-brand-muted hover:text-brand-dark">
                    Message Hearing Hope
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-orange" />
              <div>
                <dt className="font-semibold text-brand-dark">Registered locality</dt>
                <dd className="text-brand-muted">
                  {copy.nap.street}, {copy.nap.locality}, {copy.nap.region} {copy.nap.postalCode}, {copy.nap.country}
                </dd>
                <dd className="mt-1 text-brand-muted">Legal name: {copy.nap.legalName}</dd>
              </div>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Walk-in clinics</h2>
          <ul className="mt-5 grid gap-4">
            {copy.clinics.map((clinic) => (
              <li key={clinic.slug} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
                <h3 className="text-lg font-bold text-brand-dark">{clinic.name}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{clinic.address}</p>
                <p className="mt-2 text-sm text-brand-dark">
                  {clinic.phoneDisplay} · {clinic.hours}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{clinic.blurb}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-7 text-brand-muted">{copy.closing}</p>
        </div>
      </div>
    </TrustPageShell>
  );
}
