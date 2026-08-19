"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { searchProducts } from "@/data/products";
import { brands, hearingAidTypes } from "@/data/content";
import { site } from "@/lib/site";
import { cn, toTelHref } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Our Clinics" },
  { href: "/pricing", label: "Hearing Aid Price" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About Us" },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aidsOpen, setAidsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const results = searchProducts(query).slice(0, 6);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
        <Link href="/" className="relative z-10 flex h-12 shrink-0 items-center sm:h-14">
          <BrandLogo className="h-12 sm:h-14" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-surface"
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
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-surface"
              aria-expanded={aidsOpen}
              aria-haspopup="true"
              onClick={() => setAidsOpen((open) => !open)}
            >
              Hearing Aids
              <ChevronDown className={cn("h-4 w-4 transition", aidsOpen && "rotate-180")} />
            </button>
            {aidsOpen && (
              <div className="absolute left-0 top-full z-30 w-[420px] rounded-2xl border border-brand-border bg-white p-4 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Brands
                    </p>
                    <ul className="space-y-1">
                      {brands.map((brand) => (
                        <li key={brand}>
                          <Link
                            href={`/products?brand=${brand}`}
                            className="block rounded-lg px-2 py-1.5 text-sm text-brand-dark hover:bg-brand-surface"
                          >
                            {brand}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Types
                    </p>
                    <ul className="space-y-1">
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
            )}
          </div>
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-surface"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div ref={searchRef} className="relative hidden md:block">
            <label htmlFor="site-search" className="sr-only">
              Search hearing aid models and brands
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search hearing aids..."
              className="w-48 rounded-full border border-brand-border bg-brand-surface py-2 pl-9 pr-3 text-sm outline-none ring-brand-orange/20 focus:w-64 focus:border-brand-orange focus:ring-4 xl:w-64"
            />
            {searchOpen && query.trim() && (
              <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-brand-border bg-white p-2 shadow-xl">
                {results.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-brand-muted">No matching models.</p>
                ) : (
                  <ul>
                    {results.map((product) => (
                      <li key={product.slug}>
                        <Link
                          href="/products"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-surface"
                          onClick={() => setSearchOpen(false)}
                        >
                          <span className="font-medium text-brand-dark">{product.name}</span>
                          <span className="mt-0.5 block text-xs text-brand-muted">
                            {product.brand} · {product.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <a
            href={toTelHref(site.phoneTel)}
            className="hidden items-center gap-2 rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {site.phoneDisplay}
          </a>

          <button
            type="button"
            className="rounded-lg p-2 text-brand-dark hover:bg-brand-surface lg:hidden"
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
            className="absolute inset-0 bg-brand-dark/40"
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
                className="rounded-lg p-2 hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <label htmlFor="mobile-search" className="sr-only">
                Search models
              </label>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <input
                  id="mobile-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search hearing aids..."
                  className="w-full rounded-full border border-brand-border bg-brand-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-orange"
                />
              </div>
              {query.trim() && (
                <ul className="mb-4 space-y-1">
                  {searchProducts(query)
                    .slice(0, 5)
                    .map((product) => (
                      <li key={product.slug}>
                        <Link
                          href="/products"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-surface"
                          onClick={() => setDrawerOpen(false)}
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-surface"
                onClick={() => setDrawerOpen(false)}
              >
                Home
              </Link>
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Hearing Aids · Brands
              </p>
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/products?brand=${brand}`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {brand}
                </Link>
              ))}
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Types
              </p>
              {hearingAidTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/products?type=${type.id}`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {type.name}
                </Link>
              ))}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-surface"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-brand-border p-4">
              <a
                href={toTelHref(site.phoneTel)}
                className="flex items-center justify-center gap-2 rounded-full bg-brand-orange px-4 py-3 text-sm font-semibold text-white"
              >
                <Phone className="h-4 w-4" />
                {site.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
