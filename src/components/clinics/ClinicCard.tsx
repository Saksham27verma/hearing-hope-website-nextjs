import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bell, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { mapsDirectionsHref } from "@/data/clinics";
import { cn, toTelHref } from "@/lib/utils";
import type { ClinicLocation } from "@/types";

export function ClinicCard({ clinic }: { clinic: ClinicLocation }) {
  const cover = clinic.images[0];
  const thumbs = clinic.images.slice(1, 3);
  const comingSoon = Boolean(clinic.comingSoon);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(255,101,3,0.28)]",
        comingSoon && "ring-brand-orange/20",
      )}
    >
      <div className="relative h-44 overflow-hidden bg-brand-surface">
        <Image
          src={cover}
          alt={`${clinic.name} exterior`}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
          className={cn(
            "object-cover transition duration-500 group-hover:scale-105",
            comingSoon && "scale-105 saturate-75",
          )}
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/70 via-brand-dark/10 to-transparent" />
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur",
            comingSoon ? "bg-brand-orange text-white" : "bg-white/90 text-brand-teal",
          )}
        >
          {comingSoon ? "Coming soon" : clinic.certification}
        </span>
        {!comingSoon && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {thumbs.map((src) => (
              <div key={src} className="relative h-11 w-14 overflow-hidden rounded-lg ring-2 ring-white/80">
                <Image src={src} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">{clinic.city}</p>
            <h3 className="mt-0.5 text-xl font-bold tracking-tight text-brand-dark">{clinic.name}</h3>
          </div>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md",
              comingSoon ? "bg-brand-teal shadow-brand-teal/25" : "bg-brand-orange shadow-brand-orange/30",
            )}
          >
            {comingSoon ? <Bell className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-muted">{clinic.blurb}</p>

        <ul className="mt-4 space-y-3 text-sm text-brand-muted">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="leading-6">{clinic.address}</span>
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

        <div className={cn("mt-auto grid gap-2 pt-5", comingSoon ? "grid-cols-1" : "grid-cols-2")}>
          <Link
            href="/#book-test"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-brand-orange px-3 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {comingSoon ? "Join waitlist" : "Book visit"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {!comingSoon && (
            <a
              href={mapsDirectionsHref(clinic.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-brand-border bg-brand-surface px-3 py-3 text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
            >
              <Navigation className="h-3.5 w-3.5" />
              Directions
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
