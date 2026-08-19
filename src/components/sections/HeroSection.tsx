import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  FileText,
  IndianRupee,
  Lock,
  MapPinned,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import { heroStats, trustBullets } from "@/data/content";
import { site } from "@/lib/site";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { LeadForm } from "@/components/sections/LeadForm";

const trustIcons = [Stethoscope, Award, IndianRupee, MapPinned];

export function HeroSection() {
  return (
    <section id="book-test" className="relative overflow-hidden bg-white" aria-labelledby="hero-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-orange/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-40 top-64 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-6 lg:py-14">
        <div className="lg:col-span-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-brand-dark shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <Star className="h-3 w-3 fill-white" />
              {site.googleRating}
            </span>
            India&apos;s trusted hearing care brand · Google rated
          </p>

          <h1
            id="hero-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]"
          >
            India&apos;s Trusted Name in{" "}
            <span className="relative inline-block text-brand-orange">
              Hearing Care
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-brand-orange/15"
              />
            </span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-7 text-brand-muted">
            Trusted by{" "}
            <span className="font-semibold text-brand-dark">2 Lakh+ families</span> across India —
            expert audiologists, premium brands, honest prices.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {trustBullets.map((bullet, index) => {
              const Icon = trustIcons[index] ?? Award;
              return (
                <li
                  key={bullet}
                  className="flex items-center gap-3 rounded-2xl border border-brand-border/80 bg-white/90 p-3 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-brand-dark">{bullet}</span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 grid grid-cols-3 divide-x divide-brand-border overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/80">
            {heroStats.map((stat) => (
              <div key={stat.label} className="px-3 py-3.5 text-center sm:px-4">
                <dd className="text-lg font-bold tracking-tight text-brand-dark sm:text-xl">
                  {stat.value}
                </dd>
                <dt className="mt-0.5 text-[11px] leading-4 text-brand-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <Link
            href="/pricing"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
          >
            <FileText className="h-4 w-4 text-brand-orange" />
            Get Full Price List
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
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
