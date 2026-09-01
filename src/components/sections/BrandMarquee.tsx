import Image from "next/image";
import Link from "next/link";
import { brandHref } from "@/data/brands";
import type { BrandProfile } from "@/types";

function LogoRow({ brands }: { brands: BrandProfile[] }) {
  return (
    <ul className="flex min-w-max items-center gap-10 px-6">
      {brands.map((brand) => (
        <li key={brand.slug} className="flex h-16 w-40 shrink-0 items-center justify-center">
          <Link href={brandHref(brand.name)} className="flex h-full w-full items-center justify-center">
            <Image
              src={brand.logo}
              alt={brand.name}
              width={220}
              height={64}
              className="h-10 w-auto object-contain"
              unoptimized
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function BrandMarquee({ brands }: { brands: BrandProfile[] }) {
  if (!brands.length) return null;
  return (
    <section className="border-y border-brand-border/80 bg-white/40 py-10 backdrop-blur-[2px]" aria-label="Partner brands">
      <h2 className="px-4 text-center text-lg font-semibold text-brand-dark sm:text-xl">
        Trusted Provider of Hearing Aids from India&apos;s Leading Brands
      </h2>
      <div className="relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          <LogoRow brands={brands} />
          <LogoRow brands={brands} />
        </div>
      </div>
    </section>
  );
}
