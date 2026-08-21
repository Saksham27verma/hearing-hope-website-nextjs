"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, Navigation, Phone, Search } from "lucide-react";
import {
  clinics,
  distanceKm,
  mapsDirectionsHref,
  mapsEmbedSrc,
  mapsPlaceHref,
  openClinics,
} from "@/data/clinics";
import { cn, toTelHref } from "@/lib/utils";
import type { ClinicLocation } from "@/types";

const filters = [
  { id: "all", label: "All centres" },
  { id: "open", label: "Open now" },
  { id: "delhi", label: "Delhi" },
  { id: "ghaziabad", label: "Ghaziabad" },
  { id: "soon", label: "Coming soon" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function matchesFilter(clinic: ClinicLocation, filter: FilterId) {
  if (filter === "open") return !clinic.comingSoon;
  if (filter === "delhi") return clinic.city === "New Delhi";
  if (filter === "ghaziabad") return clinic.city === "Ghaziabad";
  if (filter === "soon") return Boolean(clinic.comingSoon);
  return true;
}

export function ClinicLocator() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("open");
  const [selectedSlug, setSelectedSlug] = useState(openClinics[0]?.slug ?? clinics[0].slug);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = clinics.filter((clinic) => {
      if (!matchesFilter(clinic, filter)) return false;
      if (!needle) return true;
      return [clinic.name, clinic.city, clinic.address, clinic.blurb]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    if (!origin) return list;
    return [...list].sort(
      (a, b) => distanceKm(origin, a) - distanceKm(origin, b),
    );
  }, [filter, query, origin]);

  const selected =
    filtered.find((clinic) => clinic.slug === selectedSlug) ?? filtered[0] ?? clinics[0];

  function locateMe() {
    if (!navigator.geolocation) {
      setGeoError("Location is not available in this browser.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = { lat: position.coords.latitude, lng: position.coords.longitude };
        setOrigin(here);
        setFilter("open");
        const nearest = [...openClinics].sort(
          (a, b) => distanceKm(here, a) - distanceKm(here, b),
        )[0];
        if (nearest) setSelectedSlug(nearest.slug);
        setLocating(false);
      },
      () => {
        setGeoError("Could not read your location. You can still search by area.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-32px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
      <div className="border-b border-brand-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search clinics</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by area, metro, hospital or city"
              className="w-full rounded-full border border-brand-border bg-brand-surface py-3 pl-10 pr-4 text-sm text-brand-dark outline-none ring-brand-orange/20 placeholder:text-brand-muted focus:border-brand-orange focus:ring-4"
            />
          </label>
          <button
            type="button"
            onClick={locateMe}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-dark px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LocateFixed className={cn("h-4 w-4", locating && "animate-pulse")} />
            {locating ? "Finding you…" : "Use my location"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                filter === item.id
                  ? "bg-brand-orange text-white"
                  : "bg-brand-surface text-brand-dark hover:bg-white hover:ring-1 hover:ring-black/5",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {geoError ? <p className="mt-2 text-xs text-brand-orange">{geoError}</p> : null}
        {origin ? (
          <p className="mt-2 text-xs text-brand-muted">
            Sorted by distance from you
            {filtered[0] && !filtered[0].comingSoon
              ? ` · closest is ${filtered[0].name} (${distanceKm(origin, filtered[0]).toFixed(1)} km)`
              : ""}
            .
          </p>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,22rem)_1fr]">
        <ul className="max-h-[28rem] space-y-1 overflow-y-auto p-3 lg:max-h-[34rem]">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-brand-muted">
              No clinic matches that search. Try Delhi, Ghaziabad or a metro station.
            </li>
          ) : (
            filtered.map((clinic) => {
              const active = clinic.slug === selected.slug;
              const km = origin ? distanceKm(origin, clinic) : null;
              return (
                <li key={clinic.slug}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(clinic.slug)}
                    className={cn(
                      "w-full rounded-2xl px-3 py-3 text-left transition",
                      active ? "bg-brand-orange/10 ring-1 ring-brand-orange/25" : "hover:bg-brand-surface",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span>
                        <span className="block text-sm font-bold text-brand-dark">{clinic.name}</span>
                        <span className="mt-0.5 block text-xs text-brand-muted">
                          {clinic.city}
                          {clinic.comingSoon ? " · Coming soon" : ` · ${clinic.certification}`}
                        </span>
                      </span>
                      {km !== null ? (
                        <span className="shrink-0 text-xs font-semibold text-brand-teal">
                          {km.toFixed(1)} km
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{clinic.address}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex min-h-[28rem] flex-col border-t border-brand-border lg:border-l lg:border-t-0">
          <iframe
            key={selected.slug}
            title={`Map of ${selected.name}`}
            src={mapsEmbedSrc(selected)}
            className="h-[22rem] w-full grow bg-slate-100 lg:h-auto"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-3 border-t border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-brand-dark">
                <MapPin className="h-4 w-4 text-brand-orange" />
                {selected.name}
              </p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-brand-muted">{selected.address}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={toTelHref(selected.phoneTel)}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-border px-3 py-2 text-xs font-semibold text-brand-dark hover:border-brand-teal"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <a
                href={selected.comingSoon ? mapsPlaceHref(selected) : mapsDirectionsHref(selected.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:brightness-105"
              >
                <Navigation className="h-3.5 w-3.5" />
                {selected.comingSoon ? "View city" : "Directions"}
              </a>
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-2 text-xs font-semibold text-white hover:brightness-105"
              >
                Book visit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
