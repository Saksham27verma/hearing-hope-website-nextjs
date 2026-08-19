"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { clinics, mapsDirectionsHref } from "@/data/clinics";
import { toTelHref } from "@/lib/utils";
import type { ClinicLocation } from "@/types";

function ClinicCard({ clinic }: { clinic: ClinicLocation }) {
  const cover = clinic.images[0];
  const thumbs = clinic.images.slice(1, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(255,101,3,0.28)]">
      <div className="relative h-44 overflow-hidden bg-brand-surface">
        <Image
          src={cover}
          alt={`${clinic.name} exterior`}
          fill
          sizes="(min-width: 1024px) 33vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/70 via-brand-dark/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-teal backdrop-blur">
          {clinic.certification}
        </span>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {thumbs.map((src) => (
            <div key={src} className="relative h-11 w-14 overflow-hidden rounded-lg ring-2 ring-white/80">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight text-brand-dark">{clinic.name}</h3>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-md shadow-brand-orange/30">
            <MapPin className="h-4 w-4" />
          </span>
        </div>

        <ul className="mt-4 space-y-3 text-sm text-brand-muted">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="min-h-[4.5rem] leading-6">{clinic.address}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <a href={toTelHref(clinic.phoneTel)} className="font-medium text-brand-dark hover:text-brand-orange">
              {clinic.phoneDisplay}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span>{clinic.hours}</span>
          </li>
        </ul>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href="/#book-test"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-brand-orange px-3 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Book visit
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a
            href={mapsDirectionsHref(clinic.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-brand-border bg-brand-surface px-3 py-3 text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
          >
            <Navigation className="h-3.5 w-3.5" />
            Directions
          </a>
        </div>
      </div>
    </article>
  );
}

export function LocationCenters() {
  const scroller = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 20 : 360;
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section id="locations" className="relative overflow-hidden bg-white" aria-labelledby="locations-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-teal/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-orange/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Our care centers
            </p>
            <h2 id="locations-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
              <span className="italic text-brand-teal">Locations</span>{" "}
              <span className="text-brand-dark">We Serve</span>
            </h2>
            <p className="mt-3 text-brand-muted">
              Four certified clinics across Delhi NCR. Walk in, or book a slot with an audiologist.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark shadow-sm hover:border-brand-teal hover:text-brand-teal"
              aria-label="Previous clinics"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark text-white shadow-sm hover:bg-slate-800"
              aria-label="Next clinics"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ul
          ref={scroller}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {clinics.map((clinic) => (
            <li
              key={clinic.slug}
              className="flex w-[min(100%,340px)] shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
