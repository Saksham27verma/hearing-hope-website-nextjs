import Image from "next/image";
import { Award } from "lucide-react";
import { awards } from "@/data/media";

function AwardRow() {
  return (
    <ul className="flex min-w-max items-stretch gap-5 px-4">
      {awards.map((award) => (
        <li key={award.src} className="w-[200px] shrink-0 sm:w-[220px]">
          <figure className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
            <div className="relative aspect-3/4 bg-brand-surface">
              <Image
                src={award.src}
                alt={award.alt}
                fill
                sizes="220px"
                className="object-cover"
                unoptimized
              />
            </div>
            <figcaption className="px-3 py-2.5 text-center text-xs font-medium text-brand-muted">
              {award.label}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

export function AwardsCarousel() {
  return (
    <section className="overflow-hidden bg-brand-surface" aria-labelledby="awards-heading">
      <div className="mx-auto max-w-7xl px-4 pt-12 lg:px-6">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <Award className="h-3.5 w-3.5" />
            Awards &amp; recognition
          </p>
          <h2 id="awards-heading" className="mt-2 text-2xl font-bold text-brand-dark sm:text-3xl">
            Trophies &amp; certificates
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Honours that mark our care, training, and clinical excellence.
          </p>
        </div>
      </div>
      <div className="relative mt-8 pb-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-brand-surface to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-brand-surface to-transparent sm:w-20" />
        <div className="flex w-max animate-awards-marquee hover:[animation-play-state:paused]">
          <AwardRow />
          <AwardRow />
        </div>
      </div>
    </section>
  );
}
