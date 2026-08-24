import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Cpu } from "lucide-react";
import { BrandModels } from "@/components/brands/BrandModels";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { brandHref, brandProfiles, getBrandBySlug } from "@/data/brands";
import { productsByBrand } from "@/lib/catalog";
import { site } from "@/lib/site";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return brandProfiles.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: "Hearing aids" };

  return {
    title: `${brand.name} hearing aids`,
    description: `Trial ${brand.name} hearing aids at Hearing Hope — ${brand.tagline}. Audiologist fitting, listed MRP, and models you can compare in clinic.`,
    openGraph: {
      title: `${brand.name} hearing aids | ${site.name}`,
      description: `Shop and trial ${brand.name} hearing aids with an audiologist.`,
    },
  };
}

export default async function BrandHearingAidsPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const models = await productsByBrand(brand.name);
  const others = brandProfiles.filter((item) => item.slug !== brand.slug);

  return (
    <main className="bg-brand-surface">
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
              Hearing aids
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {brand.name} hearing aids
            </h1>
            <p className="mt-3 max-w-xl text-lg font-medium text-slate-200">{brand.tagline}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{brand.intro}</p>
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Made in", value: brand.country },
                { label: "Line since", value: brand.founded },
                { label: "Engineering", value: brand.parent },
              ].map((item) => (
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
                Browse {brand.name} hearing aids
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
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.5)]">
              <div className="flex h-28 items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} hearing aids`}
                  width={280}
                  height={80}
                  className="h-16 w-auto object-contain sm:h-20"
                  unoptimized
                />
              </div>
              <p className="mt-4 text-center text-sm text-brand-muted">
                {brand.name} hearing aids fitted at Hearing Hope · {brand.headquarters} engineering
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductCatalog
        id="models"
        items={models}
        showFilters={false}
        className="bg-white"
        heading={`All ${brand.name} hearing aids`}
        subtitle="Scroll the full range we trial in clinic — then open any model for photos, features and listed MRP."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          Inside the devices
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          How {brand.name} hearing aids are built
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {brand.story.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="rounded-[1.5rem] bg-white p-6 text-sm leading-7 text-brand-muted shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              In the hearing aids
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
              What these hearing aids actually do
            </h2>
          </div>
          <Cpu className="hidden h-8 w-8 text-brand-teal sm:block" />
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {brand.technologies.map((item) => (
            <li key={item.title} className="rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
              <h3 className="text-lg font-bold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-2">
          {brand.highlights.map((item) => (
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

      <section className="scroll-mt-24 px-4 py-14 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Look closer
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            {brand.name} hearing aids, model by model
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
            Photos, who each hearing aid is for, and what it does in real rooms — not a one-line spec.
            Listed MRP. Remaining payment at the fitting.
          </p>
          <div className="mt-8">
            <BrandModels products={models} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            More hearing aids
          </p>
          <h2 className="mt-2 text-2xl font-bold text-brand-dark">Other hearing aids we fit</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={brandHref(item.name)}
                  className="flex h-full flex-col items-center justify-center rounded-[1.5rem] bg-white px-4 py-6 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Image
                    src={item.logo}
                    alt=""
                    width={160}
                    height={48}
                    className="h-8 w-auto object-contain"
                    unoptimized
                  />
                  <span className="mt-3 text-sm font-semibold text-brand-dark">
                    {item.name} hearing aids
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
