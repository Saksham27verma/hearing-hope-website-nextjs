import { homeOverview } from "@/lib/agent/trust-content";

export function HomeOverview() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-4 pt-2 lg:px-6" aria-labelledby="home-overview-heading">
      <div className="rounded-[1.75rem] bg-white/80 p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:p-8">
        <h2 id="home-overview-heading" className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          {homeOverview.title}
        </h2>
        <div className="mt-4 max-w-4xl space-y-3 text-sm leading-7 text-brand-muted sm:text-base">
          {homeOverview.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
