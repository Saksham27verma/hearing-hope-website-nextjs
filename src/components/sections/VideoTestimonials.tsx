"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { testimonials } from "@/data/content";

export function VideoTestimonials() {
  const scroller = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  return (
    <section className="bg-brand-surface" aria-labelledby="stories-heading">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal">
              Patient stories
            </p>
            <h2 id="stories-heading" className="mt-2 text-3xl font-bold text-brand-dark">
              Unboxing &amp; fitting testimonials
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="rounded-full border border-brand-border bg-white p-2 hover:border-brand-teal"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="rounded-full border border-brand-border bg-white p-2 hover:border-brand-teal"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <ul
          ref={scroller}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {testimonials.map((item) => (
            <li
              key={item.id}
              className="w-[220px] shrink-0 snap-start overflow-hidden rounded-3xl bg-brand-dark text-white shadow-lg"
            >
              <article className="relative aspect-9/16">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${item.accent} 0%, #0F172A 70%)`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col p-4">
                  <span className="self-start rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                    Patient reel
                  </span>
                  <button
                    type="button"
                    className="mx-auto mt-16 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
                    aria-label={`Play ${item.name} testimonial`}
                  >
                    <Play className="ml-0.5 h-6 w-6 fill-white" />
                  </button>
                  <blockquote className="mt-auto">
                    <p className="text-sm leading-5">&ldquo;{item.quote}&rdquo;</p>
                    <footer className="mt-3 text-xs text-white/80">
                      {item.name} · {item.city}
                      <span className="mt-1 block text-white/60">{item.product}</span>
                    </footer>
                  </blockquote>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
