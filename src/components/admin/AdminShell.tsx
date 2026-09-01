"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Building2,
  Ear,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Images,
  LayoutGrid,
  LogOut,
  MapPin,
  MessageSquareQuote,
  Newspaper,
  Plus,
  Settings,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Settings;
  match: "prefix" | "exact" | "products" | "blog";
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Website",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, match: "prefix" as const },
      { href: "/admin/pages", label: "Pages", icon: FileText, match: "prefix" as const },
      { href: "/admin/photos", label: "Gallery photos", icon: Images, match: "prefix" as const },
    ],
  },
  {
    label: "Clinic",
    items: [
      { href: "/admin/clinics", label: "Clinics", icon: MapPin, match: "prefix" as const },
      { href: "/admin/services", label: "Services", icon: Stethoscope, match: "prefix" as const },
      { href: "/admin/team", label: "Team", icon: Users, match: "prefix" as const },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/faqs", label: "FAQs", icon: MessageSquareQuote, match: "prefix" as const },
      { href: "/admin/reviews", label: "Reviews", icon: Newspaper, match: "prefix" as const },
      { href: "/admin/awards", label: "Awards", icon: Award, match: "prefix" as const },
    ],
  },
  {
    label: "Hearing aids",
    items: [
      { href: "/admin/brands", label: "Brands", icon: Tags, match: "prefix" as const },
      { href: "/admin/types", label: "Types", icon: Building2, match: "prefix" as const },
      { href: "/admin/features", label: "Features", icon: Award, match: "prefix" as const },
      { href: "/admin/products", label: "All models", icon: LayoutGrid, match: "products" as const },
      { href: "/admin/products/new", label: "Add a model", icon: Plus, match: "exact" as const },
      { href: "/admin/products/import", label: "CSV import", icon: FileSpreadsheet, match: "exact" as const },
    ],
  },
  {
    label: "Blog",
    items: [
      { href: "/admin/blog", label: "Articles", icon: Newspaper, match: "blog" as const },
      { href: "/admin/blog/new", label: "New article", icon: Plus, match: "exact" as const },
    ],
  },
];

const nav = groups.flatMap((group) => group.items);

function isActive(pathname: string, item: NavItem) {
  if (item.match === "products") {
    return (
      pathname === "/admin/products" ||
      (pathname.startsWith("/admin/products/") && pathname !== "/admin/products/new" && pathname !== "/admin/products/import")
    );
  }
  if (item.match === "blog") {
    return pathname === "/admin/blog" || (pathname.startsWith("/admin/blog/") && pathname !== "/admin/blog/new");
  }
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminShell({ email, children }: { email?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-[#F4F6F8]">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-black/5 bg-[#07111F] text-white md:flex">
        <Link href="/admin/pages" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-orange">
            <Ear className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight">Hearing Hope</span>
            <span className="text-[11px] font-medium tracking-wide text-white/50">CMS</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </Link>
          {email ? <p className="truncate px-3 pb-1 text-[11px] text-white/40">{email}</p> : null}
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/admin/pages" className="inline-flex items-center gap-2 text-sm font-bold">
            <Ear className="h-4 w-4 text-brand-orange" />
            CMS
          </Link>
          <nav className="flex gap-1 overflow-x-auto text-xs font-semibold">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-brand-surface px-3 py-1.5 text-brand-dark">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
