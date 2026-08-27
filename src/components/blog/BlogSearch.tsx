"use client";

import { Search } from "lucide-react";

type BlogSearchProps = {
  defaultValue?: string;
};

export function BlogSearch({ defaultValue = "" }: BlogSearchProps) {
  return (
    <form action="/blog" method="get" role="search" className="relative w-full max-w-xl">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
      <input
        id="blog-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles, topics or authors"
        className="w-full rounded-full border border-brand-border bg-white py-3 pl-10 pr-28 text-sm text-brand-dark outline-none ring-brand-orange/20 placeholder:text-brand-muted focus:border-brand-orange focus:ring-4"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
      >
        Search
      </button>
    </form>
  );
}
