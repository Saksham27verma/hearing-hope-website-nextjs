import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { hearingAidTypes } from "@/data/content";
import { cn } from "@/lib/utils";

const visuals: Record<
  (typeof hearingAidTypes)[number]["id"],
  { image: string; wash: string }
> = {
  RIC: { image: "/images/products/ric.svg", wash: "bg-[#FFF4ED]" },
  BTE: { image: "/images/products/bte.svg", wash: "bg-[#E7F7F3]" },
  ITC: { image: "/images/products/itc.svg", wash: "bg-brand-surface" },
  CIC: { image: "/images/products/cic.svg", wash: "bg-[#FFF4ED]" },
  IIC: { image: "/images/products/iic.svg", wash: "bg-[#E7F7F3]" },
  ITE: { image: "/images/products/ite.svg", wash: "bg-brand-surface" },
};

export function HearingAidTypes() {
  return (
    <section className="relative overflow-hidden bg-transparent" aria-labelledby="types-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-24 hidden h-40 lg:block"
      >
        <svg viewBox="0 0 1200 160" className="h-full w-full text-brand-orange/20" preserveAspectRatio="none">
          <path
            d="M0 100 C 200 20, 400 180, 600 80 S 1000 20, 1200 110"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 10"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Find your fit
          </p>
          <h2 id="types-heading" className="mt-2 text-3xl font-bold text-brand-dark sm:text-4xl">
            Types of Hearing Aids
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-muted">
            From nearly invisible custom shells to powerful behind-the-ear devices — pick the style
            that matches your loss, lifestyle and budget.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {hearingAidTypes.map((type, index) => {
            const visual = visuals[type.id];
            const raised = index % 2 === 1;

            return (
              <li
                key={type.id}
                className={cn(
                  "transition-transform duration-300",
                  raised ? "lg:-translate-y-8" : "lg:translate-y-8",
                )}
              >
                <Link
                  href={`/products?type=${type.id}`}
                  className={cn(
                    "group flex h-full flex-col rounded-[1.75rem] p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl hover:ring-brand-orange/30",
                    visual.wash,
                  )}
                >
                  <span className="text-[11px] font-bold tracking-[0.2em] text-brand-orange/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-1 items-center justify-center py-5">
                    <Image
                      src={visual.image}
                      alt=""
                      width={220}
                      height={220}
                      className="h-28 w-auto object-contain transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="mt-auto border-t border-black/5 pt-3">
                    <p className="flex items-center justify-between text-xl font-bold tracking-tight text-brand-dark">
                      {type.shortName}
                      <ArrowUpRight className="h-4 w-4 text-brand-orange opacity-0 transition group-hover:opacity-100" />
                    </p>
                    <p className="mt-0.5 text-xs leading-4 text-brand-muted">{type.name}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
