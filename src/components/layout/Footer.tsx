import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { brands } from "@/data/content";
import { brandHref } from "@/data/brands";
import { clinics } from "@/data/clinics";
import { site, whatsappHref } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M14.5 8.5V6.8c0-.7.5-1.3 1.6-1.3H17V3h-1.9C12.6 3 11 4.6 11 7.1v1.4H9v2.6h2V21h3.5v-9.9h2.3l.4-2.6h-2.7Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm9.2 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2a1.8 1.8 0 1 0 1.8 1.8A1.8 1.8 0 0 0 12 10.2Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.7 12 4.7 12 4.7s-6.6 0-8.4.4A3 3 0 0 0 1.5 7.2 31 31 0 0 0 1.1 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.4 8.4.4 8.4.4s6.6 0 8.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.9 12a31 31 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z" />
    </svg>
  );
}

const explore = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/hearing-aids", label: "Hearing aids" },
  { href: "/pricing", label: "Price list" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About us" },
  { href: "/clinics", label: "Our clinics" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#07111F] text-white">
      <svg
        className="absolute inset-x-0 top-0 h-16 w-full text-[#F8FAFC]"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0 0h1440v28C1180 64 980 64 720 40 460 16 260 16 0 48V0Z" />
      </svg>
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brand-teal/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-20 lg:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-white to-slate-50 p-6 text-brand-dark shadow-[0_30px_80px_-40px_rgba(255,101,3,0.55)] sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-orange/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                Ready when you are
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Book a free 30-minute hearing test
                <span className="text-brand-teal"> — clinic or home.</span>
              </p>
              <p className="mt-2 text-sm text-brand-muted">
                Rohini, Green Park, Indirapuram and Sanjay Nagar. No obligation to buy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                Book a free test
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappHref()}
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={toTelHref(site.phoneTel)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-dark hover:border-brand-teal"
              >
                <Phone className="h-4 w-4 text-brand-orange" />
                {site.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BrandLogo inverted className="h-12" />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              {site.tagline}. Premium hearing aids, honest prices and audiologist-led care across
              Delhi NCR — plus hospital desks at Aggarsain, RGCIRC and Vardhman.
            </p>
            <div className="mt-6 inline-flex max-w-full flex-col rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-teal">
                A company of
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-white">
                {site.parentCompany}
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <a
                href={site.social.facebook}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:border-brand-orange hover:bg-brand-orange"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={site.social.instagram}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:border-brand-orange hover:bg-brand-orange"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={site.social.youtube}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:border-brand-orange hover:bg-brand-orange"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Explore
              </h2>
              <ul className="mt-4 space-y-2.5">
                {explore.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-300 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Hearing aids
              </h2>
              <ul className="mt-4 space-y-2.5">
                {brands.map((brand) => (
                  <li key={brand}>
                    <Link
                      href={brandHref(brand)}
                      className="text-sm text-slate-300 transition hover:text-white"
                    >
                      {brand} hearing aids
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Talk to us
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <a href={toTelHref(site.phoneTel)} className="hover:text-white">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <a href={`mailto:${site.email}`} className="hover:text-white">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <span>Delhi NCR · 4 open clinics · 4 coming soon</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Walk-in clinics
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {clinics.map((clinic) => (
              <li key={clinic.slug}>
                <Link
                  href="/#locations"
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-brand-teal/50 hover:bg-white/10"
                >
                  <p className="font-semibold text-white">{clinic.name.replace(" Branch", "")}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {clinic.comingSoon ? "Coming soon" : clinic.hours}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>
            Parent company ·{" "}
            <span className="font-semibold text-white">{site.parentCompany}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
