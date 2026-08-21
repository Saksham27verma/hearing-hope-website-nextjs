import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandHref, brandProfiles } from "@/data/brands";
import { productsByBrand } from "@/data/products";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hearing aids by range",
    description:
      "Trial Signia, Phonak, Widex, Oticon, ReSound and Starkey hearing aids at Hearing Hope — listed MRP, audiologist fitting.",
    openGraph: {
      title: `Hearing aids | ${site.name}`,
      description: "Choose a hearing-aid range and compare models in clinic.",
    },
  };
}

export default async function HearingAidsIndexPage() {
  return (
    <main className="bg-brand-surface">
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Hearing aids</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-5xl">
          Choose a hearing-aid range
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-muted sm:text-base">
          We fit hearing aids, not logos. Pick a range to see every model we trial — photos, features
          and listed MRP — then book a fitting.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandProfiles.map((brand) => {
            const count = productsByBrand(brand.name).length;
            return (
              <li key={brand.slug}>
                <Link
                  href={brandHref(brand.name)}
                  className="flex h-full flex-col rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)]"
                >
                  <Image
                    src={brand.logo}
                    alt=""
                    width={180}
                    height={48}
                    className="h-10 w-auto object-contain object-left"
                    unoptimized
                  />
                  <h2 className="mt-5 text-xl font-bold text-brand-dark">{brand.name} hearing aids</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{brand.tagline}</p>
                  <p className="mt-4 text-xs font-semibold text-brand-orange">
                    {count} model{count === 1 ? "" : "s"} to trial
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
