"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CalendarDays, ChevronDown, Menu, Phone, X } from "lucide-react";
import { hearingAidTypes } from "@/data/content";
import { brandHref, brandProfiles } from "@/data/brands";
import {
  hearingAidFeatures,
  hearingAidTypeVisuals,
  hearingAidsHref,
} from "@/data/hearing-aids";
import { clinicalServices } from "@/data/services";
import { serviceIcons } from "@/components/services/serviceIcons";
import { FeatureGlyph } from "@/components/hearing-aids/FeatureGlyph";
import { site } from "@/lib/site";
import { cn, toTelHref } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/clinics", label: "Clinics" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;

function pathMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
        className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(255,101,3,0.9)] animate-phone-glow hover:brightness-105"
      >
        <Phone className="h-4 w-4 animate-phone-icon" />
        <span className={cn(compact && "sr-only sm:not-sr-only")}>{site.phoneDisplay}</span>
      </a>
    </span>
  );
}

function NavItem({
  href,
  active,
  children,
  className,
  ...rest
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-orange/40 focus-visible:ring-offset-2",
        active
          ? "bg-white text-brand-dark shadow-[0_6px_16px_-10px_rgba(15,23,42,0.45)] ring-1 ring-black/5"
          : "text-brand-dark/75 hover:bg-white/80 hover:text-brand-dark",
        className,
      )}
      {...rest}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-linear-to-r from-brand-orange to-brand-teal" />
      ) : null}
    </Link>
  );
}

function NavDropdown({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const rootRef = useRef<HTMLDivElement>(null);
  const ignoreHoverRef = useRef(false);
  const [open, setOpen] = useState(false);

  function closeFromNavigate() {
    ignoreHoverRef.current = true;
    setOpen(false);
    const active = document.activeElement;
    if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
      active.blur();
    }
    requestAnimationFrame(() => {
      if (!rootRef.current?.matches(":hover")) {
        ignoreHoverRef.current = false;
      }
    });
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      ignoreHoverRef.current = true;
      setOpen(false);
      const active = document.activeElement;
      if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
        active.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("group/nav", open && "is-open")}
      onMouseEnter={() => {
        if (ignoreHoverRef.current) return;
        setOpen(true);
      }}
      onMouseLeave={() => {
        ignoreHoverRef.current = false;
        setOpen(false);
      }}
      onFocusCapture={() => {
        if (ignoreHoverRef.current) return;
        setOpen(true);
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a[href]")) {
          closeFromNavigate();
        }
      }}
    >
      {children}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = drawerOpen ? "hidden" : "";
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const aidsActive = pathMatches(pathname, "/hearing-aids");
  const servicesActive = pathMatches(pathname, "/services");

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-full backdrop-blur-2xl transition duration-300",
          scrolled ? "bg-white/88 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)]" : "bg-white/72",
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-orange/55 to-brand-teal/55"
      />

      <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 lg:gap-6 lg:px-6">
        <Link href="/" className="relative z-10 flex h-11 shrink-0 items-center sm:h-12">
          <BrandLogo className="h-11 sm:h-12" />
        </Link>

        <nav
          className="relative hidden min-w-0 items-center rounded-full bg-[#F4F7FB]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-black/5 lg:flex"
          aria-label="Primary"
        >
          <NavItem href="/" active={pathMatches(pathname, "/")}>
            Home
          </NavItem>

          <NavDropdown>
            <NavItem
              href="/hearing-aids"
              active={aidsActive}
              className="pr-2.5 group-[.is-open]/nav:bg-white group-[.is-open]/nav:shadow-[0_6px_16px_-10px_rgba(15,23,42,0.45)] group-[.is-open]/nav:ring-1 group-[.is-open]/nav:ring-black/5"
              aria-haspopup="true"
            >
              Hearing Aids
              <ChevronDown className="h-3.5 w-3.5 text-brand-muted transition duration-200 group-[.is-open]/nav:rotate-180 group-[.is-open]/nav:text-brand-orange" />
            </NavItem>
            <HearingAidsMegaMenu pathname={pathname} />
          </NavDropdown>

          <NavDropdown>
            <NavItem
              href="/services"
              active={servicesActive}
              className="pr-2.5 group-[.is-open]/nav:bg-white group-[.is-open]/nav:shadow-[0_6px_16px_-10px_rgba(15,23,42,0.45)] group-[.is-open]/nav:ring-1 group-[.is-open]/nav:ring-black/5"
              aria-haspopup="true"
            >
              Services
              <ChevronDown className="h-3.5 w-3.5 text-brand-muted transition duration-200 group-[.is-open]/nav:rotate-180 group-[.is-open]/nav:text-brand-orange" />
            </NavItem>
            <ServicesMegaMenu pathname={pathname} />
          </NavDropdown>

          {navLinks.slice(1).map((link) => (
            <NavItem key={link.href} href={link.href} active={pathMatches(pathname, link.href)}>
              {link.label}
            </NavItem>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/#book-test"
            className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.7)] transition hover:-translate-y-px hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 focus-visible:ring-offset-2 lg:inline-flex"
          >
            <CalendarDays className="h-4 w-4 text-brand-orange" />
            Book an appointment
          </Link>
          <PhoneCta compact />
          <button
            type="button"
            className="rounded-full p-2 text-brand-dark ring-1 ring-black/5 transition hover:bg-brand-surface lg:hidden"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {drawerOpen ? (
        <MobileDrawer pathname={pathname} onClose={() => setDrawerOpen(false)} />
      ) : null}
    </header>
  );
}

function MegaPanel({
  children,
  className,
  caretClassName,
}: {
  children: ReactNode;
  className?: string;
  caretClassName?: string;
}) {
  return (
    <div
      className={cn(
        "invisible pointer-events-none absolute left-0 top-full z-30 w-[min(48rem,calc(100vw-2rem))] pt-3.5 opacity-0 transition duration-200 ease-out",
        "translate-y-1.5 group-[.is-open]/nav:visible group-[.is-open]/nav:pointer-events-auto group-[.is-open]/nav:translate-y-0 group-[.is-open]/nav:opacity-100",
        className,
      )}
    >
      <div className="relative origin-top">
        <div
          aria-hidden="true"
          className={cn(
            "absolute -top-1.5 h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-sm",
            caretClassName ?? "left-24",
          )}
        />
        <div className="overflow-hidden rounded-[1.75rem] bg-white/96 shadow-[0_32px_80px_-28px_rgba(15,23,42,0.5)] ring-1 ring-black/8 backdrop-blur-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function MegaRow({
  href,
  active,
  tone,
  children,
}: {
  href: string;
  active?: boolean;
  tone: "orange" | "teal" | "slate";
  children: ReactNode;
}) {
  const tones = {
    orange: "hover:bg-[#FFF4ED]",
    teal: "hover:bg-[#E7F7F3]",
    slate: "hover:bg-brand-surface",
  };
  const activeTones = {
    orange: "bg-[#FFF4ED] ring-1 ring-black/5",
    teal: "bg-[#E7F7F3] ring-1 ring-black/5",
    slate: "bg-brand-surface ring-1 ring-black/5",
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition duration-150",
        active ? activeTones[tone] : tones[tone],
      )}
    >
      {children}
    </Link>
  );
}

function HearingAidsMegaMenu({ pathname }: { pathname: string }) {
  return (
    <MegaPanel caretClassName="left-24">
      <Link
        href="/hearing-aids"
        className="group/cta relative flex items-center justify-between gap-4 overflow-hidden bg-linear-to-r from-[#07111F] via-[#0F1C2E] to-[#163024] px-5 py-4 text-white"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand-orange/25 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-brand-teal/20 blur-2xl"
        />
        <span className="relative">
          <span className="block text-sm font-semibold tracking-tight">All hearing aids</span>
          <span className="mt-0.5 block text-xs text-white/65">Matched to your audiogram — not a brochure</span>
        </span>
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_8px_18px_-8px_rgba(255,101,3,0.9)] transition duration-200 group-hover/cta:scale-105">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>
      <div className="grid grid-cols-3 gap-0 p-3">
        <div className="px-2 py-1">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
            By brand
          </p>
          <ul className="space-y-0.5">
            {brandProfiles.map((brand) => {
              const href = brandHref(brand.name);
              return (
                <li key={brand.slug}>
                  <MegaRow href={href} active={pathMatches(pathname, href)} tone="orange">
                    <span className="flex h-8 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-black/5">
                      <Image
                        src={brand.logo}
                        alt=""
                        width={40}
                        height={20}
                        className="h-4 w-auto object-contain"
                        unoptimized
                      />
                    </span>
                    <span className="text-[13px] font-medium text-brand-dark">{brand.name}</span>
                  </MegaRow>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-x border-black/5 px-2 py-1">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
            By type
          </p>
          <ul className="space-y-0.5">
            {hearingAidTypes.map((type) => {
              const visual = hearingAidTypeVisuals[type.id];
              const href = hearingAidsHref({ type: type.id });
              return (
                <li key={type.id}>
                  <MegaRow href={href} active={pathMatches(pathname, href)} tone="teal">
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", visual.wash)}>
                      <Image
                        src={visual.image}
                        alt=""
                        width={28}
                        height={28}
                        className="h-5 w-auto object-contain"
                        unoptimized
                      />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-brand-dark">{type.shortName}</span>
                      <span className="block text-[11px] text-brand-muted">{type.name}</span>
                    </span>
                  </MegaRow>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="px-2 py-1">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
            By feature
          </p>
          <ul className="space-y-0.5">
            {hearingAidFeatures.map((feature) => {
              const href = hearingAidsHref({ feature: feature.id });
              return (
                <li key={feature.id}>
                  <MegaRow href={href} active={pathMatches(pathname, href)} tone="slate">
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-orange",
                        feature.wash,
                      )}
                    >
                      <FeatureGlyph icon={feature.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[13px] font-medium text-brand-dark">{feature.navLabel}</span>
                  </MegaRow>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Link
        href="/#book-test"
        className="flex items-center justify-between gap-3 border-t border-black/5 bg-brand-surface/70 px-5 py-3 text-[13px] transition hover:bg-[#FFF4ED]"
      >
        <span>
          <span className="font-semibold text-brand-dark">Not sure which aid?</span>
          <span className="ml-1.5 text-brand-muted"> Book a hearing test and we’ll match it live.</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
          Book
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </MegaPanel>
  );
}

function ServicesMegaMenu({ pathname }: { pathname: string }) {
  return (
    <MegaPanel className="w-[min(36rem,calc(100vw-2rem))]" caretClassName="left-44">
      <div className="flex items-center justify-between border-b border-black/5 bg-brand-surface/50 px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Our services</p>
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal transition hover:text-brand-dark"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-1 p-3">
        {clinicalServices.map((service) => {
          const Icon = serviceIcons[service.icon];
          const href = `/services/${service.slug}`;
          const active = pathMatches(pathname, href);
          return (
            <li key={service.slug}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-2.5 py-2 transition duration-150",
                  active ? "bg-brand-surface ring-1 ring-black/5" : "hover:bg-brand-surface",
                )}
              >
                <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", service.accent)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold tracking-tight text-brand-dark">
                    {service.shortName}
                  </span>
                  <span className="block text-[11px] text-brand-muted">{service.duration}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </MegaPanel>
  );
}

function MobileDrawer({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-brand-dark/45 backdrop-blur-sm animate-nav-overlay"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        id="mobile-drawer"
        className="absolute right-0 top-0 flex h-full w-[min(100%,22.5rem)] flex-col bg-white shadow-2xl animate-nav-drawer"
      >
        <div className="flex items-center justify-between border-b border-brand-border bg-linear-to-r from-white to-[#FFF8F3] px-4 py-3">
          <BrandLogo className="h-10" />
          <button type="button" className="rounded-full p-2 hover:bg-brand-surface" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Link
            href="/"
            className={cn(
              "block rounded-2xl px-3 py-2.5 text-sm font-semibold",
              pathMatches(pathname, "/") ? "bg-[#FFF4ED] text-brand-orange" : "hover:bg-brand-surface",
            )}
            onClick={onClose}
          >
            Home
          </Link>

          <details open className="group mt-3 rounded-2xl bg-brand-surface/80 p-2 ring-1 ring-black/5">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange [&::-webkit-details-marker]:hidden">
              Hearing aids
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <Link
              href="/hearing-aids"
              className="mt-1 flex items-center justify-between rounded-xl bg-[#07111F] px-3 py-2.5 text-sm font-semibold text-white"
              onClick={onClose}
            >
              All hearing aids
              <ArrowUpRight className="h-4 w-4 text-brand-orange" />
            </Link>
            <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Brands</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {brandProfiles.map((brand) => (
                <Link
                  key={brand.slug}
                  href={brandHref(brand.name)}
                  className="flex items-center gap-2 rounded-xl bg-white px-2 py-2 text-xs font-medium ring-1 ring-black/5"
                  onClick={onClose}
                >
                  <Image src={brand.logo} alt="" width={36} height={16} className="h-3.5 w-auto object-contain" unoptimized />
                  {brand.name}
                </Link>
              ))}
            </div>
            <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Types</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {hearingAidTypes.map((type) => {
                const visual = hearingAidTypeVisuals[type.id];
                return (
                  <Link
                    key={type.id}
                    href={hearingAidsHref({ type: type.id })}
                    className="flex items-center gap-2 rounded-xl bg-white px-2 py-2 text-xs font-semibold ring-1 ring-black/5"
                    onClick={onClose}
                  >
                    <Image src={visual.image} alt="" width={20} height={20} className="h-4 w-auto object-contain" unoptimized />
                    {type.shortName}
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Features</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {hearingAidFeatures.map((feature) => (
                <Link
                  key={feature.id}
                  href={hearingAidsHref({ feature: feature.id })}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-2 text-xs font-medium ring-1 ring-black/5"
                  onClick={onClose}
                >
                  <FeatureGlyph icon={feature.icon} className="h-3.5 w-3.5 text-brand-orange" />
                  {feature.navLabel}
                </Link>
              ))}
            </div>
          </details>

          <details className="group mt-3 rounded-2xl bg-brand-surface/80 p-2 ring-1 ring-black/5">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange [&::-webkit-details-marker]:hidden">
              Services
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <Link
              href="/services"
              className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-brand-teal"
              onClick={onClose}
            >
              All services
            </Link>
            <ul className="mt-1 space-y-0.5">
              {clinicalServices.map((service) => {
                const Icon = serviceIcons[service.icon];
                return (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-white"
                      onClick={onClose}
                    >
                      <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", service.accent)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {service.shortName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>

          <div className="mt-3 space-y-0.5">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-2xl px-3 py-2.5 text-sm font-medium",
                  pathMatches(pathname, link.href) ? "bg-[#FFF4ED] font-semibold text-brand-orange" : "hover:bg-brand-surface",
                )}
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3 border-t border-brand-border p-4">
          <Link
            href="/#book-test"
            className="flex items-center justify-center gap-2 rounded-full bg-brand-dark px-4 py-3 text-sm font-semibold text-white"
            onClick={onClose}
          >
            <CalendarDays className="h-4 w-4 text-brand-orange" />
            Book an appointment
          </Link>
          <PhoneCta className="flex w-full justify-center [&>a]:w-full [&>a]:justify-center" />
        </div>
      </div>
    </div>
  );
}
