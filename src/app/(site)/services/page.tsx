import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Stethoscope,
} from "lucide-react";
import { serviceIcons } from "@/components/services/serviceIcons";
import { ImageSlot } from "@/components/services/ImageSlot";
import { getPage, getSiteSettings, listServices } from "@/lib/site-cms";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("services"), getSiteSettings()]);
  return {
    title: page.metaTitle || "Hearing Care Services",
    description: page.metaDescription,
    openGraph: {
      title: `${page.metaTitle || "Hearing Care Services"} | ${settings.name}`,
      description: "Diagnostic tests, hearing aids, implants and speech therapy — booked with an audiologist.",
    },
  };
}

const stepIcons = [ClipboardList, Stethoscope, HeartHandshake];

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPage("services"), listServices()]);
  const fields = page.fields;
  return (
    <main className="bg-brand-surface">
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
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
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                <CalendarDays className="h-4 w-4" />
                {fields.ctaPrimary}
              </Link>
              <Link
                href="#service-list"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                {fields.ctaSecondary}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {fields.stats.map((stat) => (
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{fields.pathwayEyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {fields.pathwayTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            {fields.pathwayBody}
          </p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {fields.pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-[1.5rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
            >
              <h3 className="text-lg font-bold text-brand-dark">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="service-list" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-6 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{fields.listEyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {fields.listTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            {fields.listBody}
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(255,101,3,0.28)]"
                >
                  <ImageSlot
                    src={service.image}
                    alt={`${service.shortName} at Hearing Hope`}
                    label={service.shortName}
                    className="h-44 w-full"
                    rounded="rounded-none"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl",
                          service.accent,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-muted">
                        {service.duration}
                      </span>
                    </div>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                      {service.category}
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-brand-dark">{service.shortName}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{service.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
                      Learn more
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:p-10 lg:grid-cols-2">
          <ImageSlot
            src={fields.visitImage}
            alt={fields.visitImageAlt}
            label={fields.visitImageLabel}
            className="min-h-[240px] lg:min-h-[320px]"
            rounded="rounded-[1.5rem]"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{fields.visitEyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">{fields.visitTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              {fields.visitBody}
            </p>
            <ol className="mt-6 space-y-5">
              {fields.steps.map((step, index) => {
                const Icon = stepIcons[index] ?? ClipboardList;
                return (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-surface text-brand-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-dark">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-brand-muted">{step.body}</p>
                  </div>
                </li>
              );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-brand-dark px-8 py-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{fields.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              {fields.ctaBody}
            </p>
          </div>
          <Link
            href="/#book-test"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
          >
            <CalendarDays className="h-4 w-4" />
            {fields.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
