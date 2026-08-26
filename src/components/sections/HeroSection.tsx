import Link from "next/link";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Baby,
  Brain,
  CalendarDays,
  FileText,
  Headphones,
  Lock,
  ShieldCheck,
  Speech,
  Star,
} from "lucide-react";
import { heroServices, heroStats } from "@/data/content";
import { site } from "@/lib/site";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { LeadForm } from "@/components/sections/LeadForm";

const serviceIcons = {
  "hearing-aids": Headphones,
  "cochlear-implant": Brain,
  "pta-test": Activity,
  "oae-test": Baby,
  "bera-test": AudioLines,
  "speech-therapy": Speech,
} as const;

export function HeroSection() {
  return (
    <section id="book-test" className="relative overflow-hidden bg-transparent" aria-labelledby="hero-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-orange/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-40 top-64 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 pb-10 pt-4 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-6 lg:pb-12 lg:pt-5">
        <div className="lg:col-span-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-brand-dark shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <Star className="h-3 w-3 fill-white" />
              {site.googleRating}
            </span>
            Google rated · 15+ years of clinical care
          </p>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-teal">
            Diagnostics · Devices · Therapy
          </p>

          <h1
            id="hero-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.7rem] lg:leading-[1.12]"
          >
            India&apos;s most trusted name in{" "}
            <span className="relative inline-block text-brand-orange">
              Hearing Care
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-brand-orange/15"
              />
            </span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-7 text-brand-muted">
            From a first hearing test to premium aids, cochlear-implant support and speech therapy —
            one audiologist-led team for{" "}
            <span className="font-semibold text-brand-dark">2 Lakh+ families</span>.
          </p>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Our services</p>
            <ul className="mt-2.5 grid grid-cols-2 gap-2">
              {heroServices.map((service, index) => {
                const Icon = serviceIcons[service.slug];
                const teal = index % 2 === 1;
                return (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="group flex items-center gap-2.5 rounded-2xl border border-brand-border/80 bg-white/80 px-2.5 py-2 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-orange/35 hover:bg-white hover:shadow-[0_12px_28px_-16px_rgba(255,101,3,0.45)]"
                    >
                      <span
                        className={
                          teal
                            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition group-hover:bg-brand-teal group-hover:text-white"
                            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition group-hover:bg-brand-orange group-hover:text-white"
                        }
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-tight text-brand-dark">
                          {service.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-tight text-brand-muted">
                          {service.hint}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <dl className="mt-5 flex gap-5 border-l-2 border-brand-orange/70 pl-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dd className="text-lg font-bold tracking-tight text-brand-dark">{stat.value}</dd>
                <dt className="mt-0.5 text-[11px] leading-4 text-brand-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
            >
              <FileText className="h-4 w-4 text-brand-orange" />
              Get Full Price List
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark transition hover:text-brand-orange"
            >
              All clinical services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <HeroCarousel />
        </div>

        <div className="lg:col-span-4">
          <article className="rounded-3xl bg-brand-dark p-6 text-white shadow-2xl shadow-slate-900/20">
            <h2 className="text-2xl font-bold">Book Your Free Hearing Test</h2>
            <p className="mt-1 text-sm text-slate-300">Free • No obligation • Results in 30 min</p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-200">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-teal" />
                No hidden fees
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-brand-teal" />
                Completely confidential
              </li>
            </ul>
            <LeadForm variant="dark" className="mt-5" />
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-300">
              <CalendarDays className="h-3.5 w-3.5 text-brand-orange" />
              Limited slots available this week — book early to confirm yours.
            </p>
            <p className="mt-3 flex items-center gap-1 text-xs text-slate-300">
              {Array.from({ length: 5 }).map((_, star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
              ))}
              Rated {site.googleRating} by {site.googleReviewCount} patients
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="h-3 w-3" />
              Your number is only shared with our certified audiologist.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
