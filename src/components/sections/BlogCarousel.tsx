"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { blogs, formatBlogDate } from "@/data/blogs";

export function BlogCarousel() {
  const scroller = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 20 : 360;
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section id="blog" className="bg-brand-surface/75" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Blog
            </p>
            <h2 id="blog-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Hearing care, <span className="text-brand-teal">explained simply</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-muted">
              Practical guides on tests, device types, pricing and family care — written by Hearing Hope
              audiologists for Indian homes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="mr-1 text-sm font-semibold text-brand-dark hover:text-brand-orange"
            >
              View all
            </Link>
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white hover:border-brand-teal"
              aria-label="Previous articles"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark text-white hover:bg-slate-800"
              aria-label="Next articles"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ul
          ref={scroller}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {blogs.map((post, index) => (
            <li
              key={post.slug}
              className="w-[min(100%,320px)] shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(255,101,3,0.28)]">
                <Link href={`/blog/${post.slug}`} className="relative block h-48 overflow-hidden bg-brand-surface">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand-teal">
                    {post.category}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-brand-dark/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                    {String(index + 1).padStart(2, "0")} / {String(blogs.length).padStart(2, "0")}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-brand-muted">
                    By {post.author.name}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                    <span aria-hidden="true"> · </span>
                    {post.readTime} read
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-brand-dark">
                    <Link href={`/blog/${post.slug}`} className="hover:text-brand-orange">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline"
                  >
                    Read article
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
