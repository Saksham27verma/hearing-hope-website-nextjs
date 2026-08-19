import Image from "next/image";
import { brandLogos } from "@/data/media";

function LogoRow() {
  return (
    <ul className="flex min-w-max items-center gap-10 px-6">
      {brandLogos.map((logo) => (
        <li key={logo.src} className="flex h-16 w-40 shrink-0 items-center justify-center">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={220}
            height={64}
            className="h-10 w-auto object-contain"
            unoptimized
          />
        </li>
      ))}
    </ul>
  );
}

export function BrandMarquee() {
  return (
    <section className="border-y border-brand-border bg-white py-10" aria-label="Partner brands">
      <h2 className="px-4 text-center text-lg font-semibold text-brand-dark sm:text-xl">
        Trusted Provider of Hearing Aids from India&apos;s Leading Brands
      </h2>
      <div className="relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          <LogoRow />
          <LogoRow />
        </div>
      </div>
    </section>
  );
}
