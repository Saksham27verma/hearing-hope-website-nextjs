import Image from "next/image";
import {
  Award,
  Building2,
  Headphones,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { hospitalPartners, trustStats as fallbackStats } from "@/data/content";
import { cn } from "@/lib/utils";
import type { CmsHospital } from "@/lib/site-cms/types";
import type { TrustStat } from "@/types";

const statStyles = [
  { icon: Users, className: "bg-brand-orange text-white", muted: "text-white/80" },
  { icon: MapPin, className: "bg-[#E7F7F3] text-brand-dark", muted: "text-brand-muted" },
  { icon: Award, className: "bg-brand-dark text-white", muted: "text-slate-300" },
  { icon: Building2, className: "bg-[#FFF4ED] text-brand-dark", muted: "text-brand-muted" },
  { icon: Headphones, className: "bg-white text-brand-dark ring-1 ring-brand-border", muted: "text-brand-muted" },
  { icon: ShieldCheck, className: "bg-brand-teal text-white", muted: "text-white/85" },
];

export function TrustStats({
  stats,
  hospitals,
}: {
  stats?: TrustStat[];
  hospitals?: CmsHospital[];
}) {
  const resolvedStats = stats?.length ? stats : fallbackStats;
  const partners = hospitals?.length ? hospitals : hospitalPartners;
  return (
    <section className="bg-transparent" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Proven care
            </p>
            <h2 id="trust-heading" className="mt-1 text-2xl font-bold text-brand-dark sm:text-3xl">
              Trust you can <span className="text-brand-teal">count</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-brand-muted">
            15+ years of care, plus audiology desks inside partner hospitals.
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {resolvedStats.map((stat, index) => {
            const style = statStyles[index] ?? statStyles[4];
            const Icon = style.icon;
            return (
              <li
                key={stat.label}
                className={cn("flex items-center gap-2.5 rounded-2xl px-3 py-3", style.className)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
                <span>
                  <span className="block text-lg font-bold leading-none">{stat.value}</span>
                  <span className={cn("mt-1 block text-[11px] leading-tight", style.muted)}>
                    {stat.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Hospital tie-ups
          </p>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {partners.map((hospital) => {
              const darkLogo = hospital.name === "Vardhman Hospital";
              const inner = (
                <>
                  <div
                    className={cn(
                      "flex h-14 w-[7.5rem] shrink-0 items-center justify-center rounded-xl px-2",
                      darkLogo ? "bg-[#111111]" : "bg-white ring-1 ring-brand-border",
                    )}
                  >
                    <Image
                      src={hospital.logo}
                      alt={`${hospital.name} logo`}
                      width={180}
                      height={48}
                      className="max-h-10 w-auto object-contain"
                    />
                  </div>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-brand-dark">
                      {hospital.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                      <MapPin className="h-3 w-3 shrink-0 text-brand-orange" />
                      {hospital.location}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={hospital.name}>
                  {hospital.url ? (
                    <a
                      href={hospital.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-brand-surface px-3 py-2.5 ring-1 ring-black/5 transition hover:ring-brand-orange/40"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-brand-surface px-3 py-2.5 ring-1 ring-black/5">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
