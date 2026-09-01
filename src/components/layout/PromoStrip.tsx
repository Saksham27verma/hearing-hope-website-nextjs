import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BatteryCharging } from "lucide-react";
import type { SiteSettings } from "@/lib/site-cms/types";

export function PromoStrip({ promo }: { promo: SiteSettings["promo"] }) {
  return (
    <section
      className="relative z-20 overflow-x-clip bg-transparent pt-20 pb-8 sm:pt-24 sm:pb-10"
      aria-label={promo.eyebrow || "Promotion"}
    >
      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <div className="relative rounded-[1.75rem] bg-linear-to-r from-[#07111F] via-[#122033] to-brand-orange shadow-[0_24px_60px_-28px_rgba(255,101,3,0.45)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 top-0 h-full w-40 rounded-full bg-brand-teal/20 blur-3xl"
          />

          <div className="relative flex min-h-[8.5rem] items-center gap-6 px-5 py-7 pr-36 sm:min-h-[10rem] sm:px-8 sm:pr-64 lg:pr-80">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                <BatteryCharging className="h-3.5 w-3.5" />
                {promo.eyebrow}
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-white sm:text-2xl">
                {promo.title}
              </p>
              <p className="mt-1 hidden text-sm text-slate-300 sm:block">{promo.body}</p>
              <Link href={promo.href || "/hearing-aids"} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-brand-orange">
                {promo.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Image
            src={promo.image || "/images/hero/slide-01.webp"}
            alt={promo.title}
            width={720}
            height={900}
            className="pointer-events-none absolute -top-16 right-0 h-52 w-auto max-w-[min(16rem,42vw)] origin-bottom object-contain drop-shadow-[0_24px_40px_rgba(15,23,42,0.45)] sm:-top-20 sm:h-72 sm:max-w-[22rem] lg:-top-24 lg:h-[22rem] lg:max-w-[26rem]"
          />
        </div>
      </div>
    </section>
  );
}
