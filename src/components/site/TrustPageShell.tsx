import type { ReactNode } from "react";

export function TrustPageShell({
  eyebrow,
  title,
  highlight,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-brand-surface">
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-orange/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08]">
            {title}
            {highlight ? (
              <>
                {" "}
                <span className="text-brand-orange">{highlight}</span>
              </>
            ) : null}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{body}</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">{children}</div>
    </main>
  );
}
