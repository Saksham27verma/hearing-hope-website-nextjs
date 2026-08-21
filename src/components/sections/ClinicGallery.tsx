import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { clinicPhotos } from "@/data/media";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const areaClass: Record<(typeof clinicPhotos)[number]["area"], string> = {
  one: "[grid-area:one]",
  two: "[grid-area:two]",
  three: "[grid-area:three]",
  four: "[grid-area:four]",
  five: "[grid-area:five]",
  six: "[grid-area:six]",
  seven: "[grid-area:seven]",
};

export function ClinicGallery({ findHref = "#locations" }: { findHref?: string }) {
  return (
    <section className="bg-transparent" aria-labelledby="clinics-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Our clinics
            </p>
            <h2 id="clinics-heading" className="mt-2 text-3xl font-bold text-brand-dark sm:text-4xl">
              Care you can walk into
            </h2>
            <p className="mt-3 max-w-xl text-brand-muted">
              Bright rooms, expert audiologists, and families hearing clearly again — across our
              pan-India clinic network.
            </p>
          </div>
          <Link
            href={findHref}
            className="inline-flex rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105"
          >
            Find a clinic
          </Link>
        </div>

        <div
          className={cn(
            "grid gap-3 sm:gap-3.5",
            "grid-cols-2 [grid-template-areas:'one_one'_'two_two'_'three_four'_'five_seven'_'six_six']",
            "[grid-template-rows:minmax(220px,28vw)_minmax(140px,18vw)_minmax(180px,24vw)_minmax(180px,24vw)_minmax(160px,22vw)]",
            "lg:grid-cols-4 lg:[grid-template-areas:'one_three_four_five'_'one_six_six_seven'_'two_six_six_seven']",
            "lg:[grid-template-rows:minmax(200px,22vw)_minmax(150px,16vw)_minmax(190px,20vw)]",
          )}
        >
          {clinicPhotos.map((photo) => (
            <figure
              key={photo.src}
              className={cn(
                "relative min-h-[140px] overflow-hidden rounded-[1.25rem] bg-brand-surface shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)]",
                areaClass[photo.area],
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 28vw, 50vw"
                className="object-cover"
                unoptimized
              />
              {photo.area === "one" && (
                <figcaption className="absolute bottom-3 right-3 flex items-start gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-md sm:bottom-4 sm:right-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-brand-dark">Clinic 1</span>
                    <span className="block text-xs text-brand-muted">
                      {site.address.locality} · {site.address.street}
                    </span>
                  </span>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
