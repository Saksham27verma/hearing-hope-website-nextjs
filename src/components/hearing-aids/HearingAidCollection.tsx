import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { BrandModels } from "@/components/brands/BrandModels";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { CollectionFact, CollectionPoint } from "@/data/hearing-aid-collections";

type RelatedItem = {
  href: string;
  label: string;
  image?: string;
  logo?: string;
};

type HearingAidCollectionProps = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
  image: string;
  imageAlt: string;
  wash: string;
  facts: CollectionFact[];
  points: CollectionPoint[];
  highlights: string[];
  products: Product[];
  catalogHeading: string;
  relatedEyebrow: string;
  relatedTitle: string;
  related: RelatedItem[];
};

export function HearingAidCollection({
  eyebrow,
  title,
  tagline,
  intro,
  image,
  imageAlt,
  wash,
  facts,
  points,
  highlights,
  products,
  catalogHeading,
  relatedEyebrow,
  relatedTitle,
  related,
}: HearingAidCollectionProps) {
  return (
    <main className="bg-brand-surface">
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-lg font-medium text-slate-200">{tagline}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{intro}</p>
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#models"
                className="inline-flex rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                Browse these hearing aids
              </Link>
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                <CalendarDays className="h-4 w-4" />
                Book a hearing-aid trial
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className={cn("rounded-[2rem] p-8 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.5)]", wash)}>
              <div className="flex h-48 items-center justify-center sm:h-56">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={360}
                  height={280}
                  className="h-44 w-auto object-contain sm:h-52"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">On this page only</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          Fitted to your audiogram — not picked from a filter
        </h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {points.map((item) => (
            <li
              key={item.title}
              className="rounded-[1.5rem] bg-white p-6 text-sm leading-7 text-brand-muted shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
            >
              <h3 className="text-lg font-bold text-brand-dark">{item.title}</h3>
              <p className="mt-2">{item.body}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-dark ring-1 ring-black/5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-teal" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <ProductCatalog
        id="models"
        items={products}
        showFilters={false}
        className="bg-white"
        heading={catalogHeading}
        subtitle="Listed MRP. The one we recommend is still the one that matches your hearing graph after a test."
      />

      <section className="scroll-mt-24 px-4 py-14 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Look closer</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {title}, model by model
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
            Photos, who each hearing aid is for, and what it does in real rooms. Remaining payment at
            the fitting.
          </p>
          <div className="mt-8">
            <BrandModels products={products} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{relatedEyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-dark">{relatedTitle}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col items-center justify-center rounded-[1.5rem] bg-white px-4 py-6 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt=""
                      width={140}
                      height={40}
                      className="h-7 w-auto object-contain"
                      unoptimized
                    />
                  ) : null}
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      width={120}
                      height={80}
                      className="h-12 w-auto object-contain"
                      unoptimized
                    />
                  ) : null}
                  <span className="mt-3 text-sm font-semibold text-brand-dark">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
