import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { SiteChromeProvider } from "@/components/layout/SiteChrome";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { getSiteChrome } from "@/lib/site-cms";

const recovery = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Hearing Hope" },
  { href: "/contact", label: "Contact" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/developers", label: "Developer resources" },
];

export default async function NotFound() {
  const chrome = await getSiteChrome();
  return (
    <SiteChromeProvider value={chrome}>
      <div className="flex min-h-dvh flex-col bg-white pb-20 md:pb-0">
        <Navbar />
        <main className="flex-1 bg-brand-surface">
          <section className="relative overflow-hidden bg-[#07111F] text-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-brand-orange/25 blur-3xl" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">404</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">This page is not on Hearing Hope</h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                The path you asked for does not exist. Agents should recover from the sitemap or llms.txt instead of
                treating this URL as a real page.
              </p>
            </div>
          </section>
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
            <h2 className="text-lg font-bold text-brand-dark">Where to look next</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {recovery.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl bg-white p-4 text-sm font-semibold text-brand-dark ring-1 ring-black/5 hover:border-brand-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <PromoStrip promo={chrome.settings.promo} />
        <Footer settings={chrome.settings} brands={chrome.brands} clinics={chrome.clinics} />
        <FloatingActions settings={chrome.settings} />
      </div>
    </SiteChromeProvider>
  );
}
