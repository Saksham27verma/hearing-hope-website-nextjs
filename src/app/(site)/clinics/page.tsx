import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Stethoscope,
  Truck,
} from "lucide-react";
import { ClinicCard } from "@/components/clinics/ClinicCard";
import { ClinicLocator } from "@/components/clinics/ClinicLocator";
import { ClinicGallery } from "@/components/sections/ClinicGallery";
import { ComingSoonNote } from "@/components/sections/LocationCenters";
import { ImageSlot } from "@/components/services/ImageSlot";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { clinicListSchema } from "@/lib/schema";
import { getPage, getSiteSettings, listComingSoonClinics, listHospitals, listOpenClinics } from "@/lib/site-cms";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("clinics"), getSiteSettings()]);
  return {
    title: page.metaTitle || "Our Clinics",
    description: page.metaDescription,
    openGraph: {
      title: `${page.metaTitle || "Our Clinics"} | ${settings.name}`,
      description: "Find a Hearing Hope clinic near you, get directions, or book a free home test.",
    },
  };
}

const perkIcons = [Stethoscope, Home, Truck, Clock];

export default async function ClinicsPage() {
  const [page, openClinics, comingSoonClinics, hospitals] = await Promise.all([
    getPage("clinics"),
    listOpenClinics(),
    listComingSoonClinics(),
    listHospitals(),
  ]);
  const fields = page.fields;
  return (
    <main className="bg-brand-surface">
      <SchemaScript id="clinic-list-schema" data={clinicListSchema(openClinics)} />
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6 lg:py-20">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
              {fields.eyebrow}
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08]">
              {fields.title}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              {fields.body}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-200">
              {fields.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#locator"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                <MapPin className="h-4 w-4" />
                {fields.ctaPrimary}
              </Link>
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                <CalendarDays className="h-4 w-4" />
                {fields.ctaSecondary}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {[
                { value: String(openClinics.length), label: "Open clinics" },
                { value: String(comingSoonClinics.length), label: "Coming soon" },
                { value: fields.homeVisitStat, label: "Home visits" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-slate-400">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:grid-rows-[minmax(220px,1fr)_minmax(160px,0.7fr)]">
            <ImageSlot
              src={fields.heroMain}
              alt={fields.heroMainAlt}
              label={fields.heroMainLabel}
              className="col-span-2 min-h-[220px] lg:min-h-[280px]"
              rounded="rounded-[1.75rem]"
            />
            <ImageSlot
              src={fields.heroSide1}
              alt={fields.heroSide1Alt}
              label={fields.heroSide1Label}
              className="min-h-[150px]"
            />
            <ImageSlot
              src={fields.heroSide2}
              alt={fields.heroSide2Alt}
              label={fields.heroSide2Label}
              className="min-h-[150px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{fields.perksEyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {fields.perksTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            {fields.perksBody}
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields.perks.map((perk, index) => {
            const Icon = perkIcons[index] ?? Stethoscope;
            return (
            <li
              key={perk.title}
              className="rounded-[1.5rem] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-surface text-brand-teal">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-brand-dark">{perk.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{perk.body}</p>
            </li>
          );
          })}
        </ul>
      </section>

      <section id="locator" className="scroll-mt-24 px-4 pb-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              {fields.locatorEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
              {fields.locatorTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
              {fields.locatorBody}
            </p>
          </div>
          <ClinicLocator clinics={openClinics.concat(comingSoonClinics)} />
        </div>
      </section>

      <section id="open-clinics" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{fields.openEyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {fields.openTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            {fields.openBody}
          </p>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {openClinics.map((clinic) => (
            <li key={clinic.slug}>
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>
      </section>

      <ClinicGallery findHref="#locator" />

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <ComingSoonNote clinics={comingSoonClinics} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {fields.hospitalEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">
            {fields.hospitalTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
            {fields.hospitalBody}
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {hospitals.map((hospital) => (
              <li
                key={hospital.name}
                className="flex items-center gap-3 rounded-2xl bg-brand-surface px-3 py-3 ring-1 ring-black/5"
              >
                <div className="flex h-14 w-[7.5rem] shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-brand-border">
                  <Image
                    src={hospital.logo}
                    alt={`${hospital.name} logo`}
                    width={180}
                    height={48}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-brand-dark">
                    {hospital.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-brand-muted">{hospital.location}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-brand-dark px-8 py-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{fields.homeCtaTitle}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              {fields.homeCtaBody}
            </p>
          </div>
          <Link
            href="/#book-test"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
          >
            <CalendarDays className="h-4 w-4" />
            {fields.homeCtaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
