"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Phone, Plus } from "lucide-react";
import { faqs } from "@/data/content";
import { site } from "@/lib/site";
import { cn, toTelHref } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-transparent" aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-12 lg:gap-16 lg:px-6">
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            FAQs
          </p>
          <h2 id="faq-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Questions, <span className="text-brand-teal">answered</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-brand-muted">
            Honest pricing, free tests, and clinic care — here are the answers families ask us most.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/#book-test"
              className="inline-flex rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105"
            >
              Book a free test
            </Link>
            <a
              href={toTelHref(site.phoneTel)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-5 py-2.5 text-sm font-semibold text-brand-dark hover:border-brand-teal hover:text-brand-teal"
            >
              <Phone className="h-4 w-4" />
              Call us
            </a>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-brand-border overflow-hidden rounded-3xl border border-brand-border bg-brand-surface/60">
            {faqs.map((item, index) => {
              const open = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;

              return (
                <li key={item.question} className={cn(open && "bg-white")}>
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? -1 : index)}
                      className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6"
                    >
                      <span
                        className={cn(
                          "mt-0.5 w-7 shrink-0 text-sm font-bold",
                          open ? "text-brand-orange" : "text-brand-muted",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 text-base font-semibold text-brand-dark">
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          open
                            ? "bg-brand-orange text-white"
                            : "bg-white text-brand-dark ring-1 ring-brand-border",
                        )}
                      >
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!open}
                    className="px-5 pb-5 pl-16 text-sm leading-6 text-brand-muted sm:px-6 sm:pl-[4.25rem]"
                  >
                    {item.answer}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
