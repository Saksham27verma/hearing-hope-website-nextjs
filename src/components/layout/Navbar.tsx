"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Menu, Phone, X } from "lucide-react";
import { brands, hearingAidTypes } from "@/data/content";
import { brandHref } from "@/data/brands";
import { clinicalServices } from "@/data/services";
import { site } from "@/lib/site";
import { cn, toTelHref } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/clinics", label: "Clinics" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

function PhoneCta({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-full border-2 border-brand-orange/50 animate-phone-ring"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-full border-2 border-brand-orange/35 animate-phone-ring [animation-delay:1.2s]"
      />
      <a
        href={toTelHref(site.phoneTel)}
        className="relative z-10 inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white animate-phone-glow hover:brightness-105"
      >
        <Phone className="h-4 w-4 animate-phone-icon" />
        <span className={cn(compact && "sr-only sm:not-sr-only")}>{site.phoneDisplay}</span>
      </a>
    </span>
  );
}

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aidsOpen, setAidsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:px-6">
        <Link href="/" className="relative z-10 flex h-11 shrink-0 items-center sm:h-12">
          <BrandLogo className="h-11 sm:h-12" />
        </Link>

        <nav
          className="mx-auto hidden items-center rounded-full bg-brand-surface/80 p-1 ring-1 ring-black/5 lg:flex"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-brand-dark transition hover:bg-white hover:shadow-sm"
          >
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setAidsOpen(true)}
            onMouseLeave={() => setAidsOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-brand-dark transition hover:bg-white hover:shadow-sm"
              aria-expanded={aidsOpen}
              aria-haspopup="true"
              onClick={() => setAidsOpen((open) => !open)}
            >
              Hearing Aids
              <ChevronDown className={cn("h-3.5 w-3.5 transition", aidsOpen && "rotate-180")} />
            </button>
            {aidsOpen && (
              <div className="absolute left-1/2 top-full z-30 w-[420px] -translate-x-1/2 pt-3">
                <div className="rounded-2xl border border-black/5 bg-white/95 p-4 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                        Hearing aids
                      </p>
                      <ul className="space-y-0.5">
                        {brands.map((brand) => (
                          <li key={brand}>
                            <Link
                              href={brandHref(brand)}
                              className="block rounded-lg px-2 py-1.5 text-sm text-brand-dark hover:bg-brand-surface"
                            >
                              {brand}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/products"
                        className="mt-2 block px-2 text-xs font-semibold text-brand-teal hover:underline"
                      >
                        All models
                      </Link>
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                        Types
                      </p>
                      <ul className="space-y-0.5">
                        {hearingAidTypes.map((type) => (
                          <li key={type.id}>
                            <Link
                              href={`/products?type=${type.id}`}
                              className="block rounded-lg px-2 py-1.5 text-sm text-brand-dark hover:bg-brand-surface"
                            >
                              {type.shortName} · {type.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-brand-dark transition hover:bg-white hover:shadow-sm"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Services
              <ChevronDown className={cn("h-3.5 w-3.5 transition", servicesOpen && "rotate-180")} />
            </Link>
            {servicesOpen && (
              <div className="absolute left-1/2 top-full z-30 w-[440px] -translate-x-1/2 pt-3">
                <div className="rounded-2xl border border-black/5 bg-white/95 p-3 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                      Our services
                    </p>
                    <Link
                      href="/services"
                      className="text-xs font-semibold text-brand-teal hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-0.5">
                    {clinicalServices.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="block rounded-lg px-2 py-2 text-sm text-brand-dark hover:bg-brand-surface"
                        >
                          {service.shortName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-brand-dark transition hover:bg-white hover:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/#book-test"
            className="hidden items-center gap-2 rounded-full border border-brand-dark/10 bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:inline-flex"
          >
            <CalendarDays className="h-4 w-4" />
            Book an appointment
          </Link>
          <PhoneCta compact />
          <button
            type="button"
            className="rounded-full p-2 text-brand-dark hover:bg-brand-surface lg:hidden"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            id="mobile-drawer"
            className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <p className="font-semibold text-brand-dark">Menu</p>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Link
                href="/"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
              >
                Home
              </Link>
              <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Hearing aids
              </p>
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={brandHref(brand)}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {brand}
                </Link>
              ))}
              <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Types
              </p>
              {hearingAidTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/products?type=${type.id}`}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {type.name}
                </Link>
              ))}
              <Link
                href="/services"
                className="mt-4 block rounded-xl px-3 py-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-orange hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/services"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
              >
                All services
              </Link>
              {clinicalServices.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {service.shortName}
                </Link>
              ))}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="space-y-3 border-t border-brand-border p-4">
              <Link
                href="/#book-test"
                className="flex items-center justify-center gap-2 rounded-full bg-brand-dark px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setDrawerOpen(false)}
              >
                <CalendarDays className="h-4 w-4" />
                Book an appointment
              </Link>
              <PhoneCta className="flex w-full justify-center [&>a]:w-full [&>a]:justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
