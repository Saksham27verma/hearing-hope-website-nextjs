import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Ear,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { FeatureGlyph } from "@/components/hearing-aids/FeatureGlyph";
import { HearingAidsExplorer } from "@/components/hearing-aids/HearingAidsExplorer";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { brandHref } from "@/data/brands";
import { featureHref, typeHref } from "@/data/hearing-aids";
import { listPublishedProducts } from "@/lib/catalog";
import { productListSchema } from "@/lib/schema";
import { getPage, getSiteSettings, listBrandProfiles, listFaqs, listFeaturePages, listStylePages } from "@/lib/site-cms";
import { cn } from "@/lib/utils";

type HearingAidsPageProps = {
  searchParams: Promise<{ brand?: string | string[]; type?: string | string[]; feature?: string | string[] }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("hearing-aids"), getSiteSettings()]);
  return {
    title: page.metaTitle || "Hearing aids fitted to your audiogram",
    description: page.metaDescription,
    openGraph: {
      title: `Hearing aids | ${settings.name}`,
      description: "Premium hearing aids, selected after a real hearing test.",
    },
  };
}

const stepIcons = [ClipboardList, Activity, Ear, SlidersHorizontal];

export default async function HearingAidsPage({ searchParams }: HearingAidsPageProps) {
  const params = await searchParams;
  const type = first(params.type);
  const feature = first(params.feature);
  const brand = first(params.brand);
  if (feature) redirect(featureHref(feature));
  if (type) redirect(typeHref(type));
  if (brand) redirect(brandHref(brand));

  const [products, page, brands, types, features, faqs] = await Promise.all([
    listPublishedProducts(),
    getPage("hearing-aids"),
    listBrandProfiles(),
    listStylePages(),
    listFeaturePages(),
    listFaqs("hearing-aids"),
  ]);
  const fields = page.fields;
  const choosingFaqs = faqs.filter((item) =>
    /brand|rechargeable|cost|try|hearing aid/i.test(item.question),
  );

  return (
    <>
      <SchemaScript id="hearing-aids-products" data={productListSchema(products)} />
      <main className="bg-brand-surface">

      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6 lg:py-20">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
              <Sparkles className="h-3.5 w-3.5" />
              {fields.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              {fields.title}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              {fields.body}
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "Diagnostic test before any recommendation",
                "Filter by brand, type and features",
                "Free trial in clinic or at home",
                "Fine-tuning after you live with the sound",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
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
                Book the test that writes the fit
              </Link>
              <Link
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                Browse all hearing aids
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] bg-white/5 ring-1 ring-white/10">
                <Image
                  src={fields.heroImage}
                  alt="Rechargeable hearing aids ready for an audiologist trial"
                  width={960}
                  height={720}
                  priority
                  className="h-72 w-full object-cover object-center sm:h-[22rem]"
                />
              </div>
              <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-2 sm:left-6 sm:right-6">
                {[
                  { value: `${products.length}+`, label: "Models to trial" },
                  { value: "6", label: "Hearing-aid ranges" },
                  { value: "Your", label: "Audiogram decides" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white px-3 py-3 text-center shadow-[0_16px_40px_-24px_rgba(15,23,42,0.5)]"
                  >
                    <p className="text-lg font-bold text-brand-dark sm:text-xl">{stat.value}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-muted sm:text-[11px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-10 sm:h-12" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6" aria-labelledby="audiogram-heading">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Why Hearing Hope
            </p>
            <h2 id="audiogram-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              The best hearing aid is the one that fits your graph
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">
              A flagship Signia is the wrong aid if you need a power BTE. An invisible CIC is the
              wrong aid if your thresholds need more headroom than a canal can hold. We start with
              the audiogram so the shop floor does not choose for you.
            </p>
            <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-[#07111F] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
                Audiogram sketch
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Loudness by pitch — the map we program every hearing aid to.
              </p>
              <AudiogramMark />
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {fields.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? ClipboardList;
              return (
                <li
                  key={step.title}
                  className="rounded-[1.75rem] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-teal">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-brand-dark">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-white py-16" aria-labelledby="brands-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">By brand</p>
              <h2 id="brands-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                Hearing aids, grouped by the range we fit
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
                We are not a single-brand shop. Each range has a different sound and shell. Open a
                range for the full story — or filter the catalogue below.
              </p>
            </div>
            <Link href="#catalog" className="text-sm font-semibold text-brand-teal hover:underline">
              Jump to all models
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => {
              const count = products.filter((product) => product.brand === brand.name).length;
              return (
                <li key={brand.slug}>
                  <div className="flex h-full flex-col rounded-[1.75rem] bg-brand-surface p-5 ring-1 ring-black/5">
                    <Image
                      src={brand.logo}
                      alt=""
                      width={160}
                      height={44}
                      className="h-9 w-auto object-contain object-left"
                      unoptimized
                    />
                    <h3 className="mt-4 text-lg font-bold text-brand-dark">{brand.name} hearing aids</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{brand.tagline}</p>
                    <p className="mt-3 text-xs font-semibold text-brand-orange">
                      {count === 1 ? "1 model in clinic" : `${count} models in clinic`}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={brandHref(brand.name)}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-dark px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Open {brand.name} page
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6" aria-labelledby="types-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">By type</p>
        <h2 id="types-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
          Style is a fitting choice, not a fashion quiz
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
          RIC and BTE sit behind the ear. ITC, CIC, IIC and ITE live in the ear. We pick the style
          after we know your loss, canal, and whether you need streaming or raw power.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {types.map((type) => {
            const count = products.filter((product) => product.type === type.id).length;
            return (
              <li key={type.id}>
                <Link
                  href={typeHref(type.id)}
                  className={cn(
                    "group flex h-full flex-col rounded-[1.75rem] p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg",
                    type.wash,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold tracking-tight text-brand-dark">{type.shortName}</p>
                      <p className="text-xs text-brand-muted">{type.name}</p>
                    </div>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-brand-dark">
                      {count === 1 ? "1 model" : `${count} models`}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center py-4">
                    <Image
                      src={type.image}
                      alt={`${type.name} hearing aid`}
                      width={220}
                      height={180}
                      className="h-24 w-auto object-contain transition group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm leading-6 text-brand-muted">{type.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-white py-16" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">By feature</p>
          <h2 id="features-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
            Rechargeable, Bluetooth, invisible — pick how it should live
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
            Features are filters, not a ranking. Noise cancellation on the wrong prescription still
            sounds wrong. We enable what your ears and your day actually need.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <li key={item.id}>
                <Link
                  href={featureHref(item.id)}
                  className={cn(
                    "flex h-full flex-col rounded-[1.75rem] p-6 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg",
                    item.wash,
                  )}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-orange shadow-sm">
                    <FeatureGlyph icon={item.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-brand-dark">{item.label}</h3>
                  <p className="mt-1 text-sm font-medium text-brand-teal">{item.tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-brand-muted">{item.body}</p>
                  <p className="mt-4 text-xs font-semibold text-brand-dark">
                    {products.filter((product) => product.featureIds.includes(item.id)).length} hearing aids · {item.who}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6" aria-labelledby="paths-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          What we usually trial first
        </p>
        <h2 id="paths-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
          Three common starting points — still confirmed by your test
        </h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {fields.paths.map((path) => (
            <li key={path.title}>
              <Link
                href={path.href}
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-[1.75rem] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg",
                  path.wash,
                )}
              >
                <div className="flex justify-center px-6 pt-6">
                  <Image
                    src={path.image}
                    alt=""
                    width={240}
                    height={180}
                    className="h-28 w-auto object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-2">
                  <h3 className="text-lg font-bold text-brand-dark">{path.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{path.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
                    See matching hearing aids
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <HearingAidsExplorer products={products} brands={brands} types={types} features={features} />

      <section className="bg-[#07111F] py-16 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Honest next step
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Do not buy a hearing aid from this page alone
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Use the filters to learn the range. Then sit for a test. Hearing Hope will shortlist
              the hearing aids that suit your audiogram, let you trial them, and only then take an
              order — listed MRP, remaining payment at the fitting.
            </p>
            <Link
              href="/#book-test"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:brightness-105"
            >
              <CalendarDays className="h-4 w-4" />
              Book a free hearing test
            </Link>
          </div>
          <ul className="space-y-3">
            {choosingFaqs.slice(0, 4).map((item) => (
              <li key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold">{item.question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
    </>
  );
}

function AudiogramMark() {
  const frequencies = ["250", "500", "1k", "2k", "4k", "8k"];
  const left = [35, 40, 45, 55, 60, 65];
  const right = [30, 35, 42, 50, 58, 62];

  return (
    <svg viewBox="0 0 320 168" className="mt-4 h-36 w-full" role="img" aria-label="Stylised audiogram">
      {[0, 1, 2, 3].map((row) => (
        <line
          key={row}
          x1="36"
          x2="312"
          y1={28 + row * 32}
          y2={28 + row * 32}
          stroke="rgba(255,255,255,0.08)"
        />
      ))}
      {frequencies.map((label, index) => {
        const x = 48 + index * 48;
        return (
          <g key={label}>
            <text x={x} y="160" textAnchor="middle" fill="#94a3b8" fontSize="10">
              {label}
            </text>
            <circle cx={x} cy={28 + (left[index] / 90) * 100} r="5" fill="#FF6503" />
            <rect
              x={x - 4.5}
              y={24 + (right[index] / 90) * 100}
              width="9"
              height="9"
              fill="none"
              stroke="#18AD8D"
              strokeWidth="2"
            />
          </g>
        );
      })}
      <text x="8" y="34" fill="#64748b" fontSize="9">
        dB
      </text>
    </svg>
  );
}
