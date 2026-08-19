"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/sections/ProductCard";
import { LeadModal } from "@/components/ui/LeadModal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const filters = [
  "All",
  "Signia",
  "Phonak",
  "Widex",
  "Oticon",
  "Starkey",
  "Bluetooth",
] as const;

type Filter = (typeof filters)[number];

type ProductCatalogProps = {
  initialFilter?: string;
  initialType?: string;
  heading?: string;
  subtitle?: string;
};

function matchesFilter(product: Product, filter: Filter, type?: string) {
  if (type && product.type !== type) return false;
  if (filter === "All") return true;
  if (filter === "Bluetooth") return product.bluetooth;
  return product.brand === filter;
}

function resolveInitialFilter(value?: string): Filter {
  if (value && filters.includes(value as Filter)) return value as Filter;
  return "All";
}

function loopProducts(items: Product[]) {
  if (items.length === 0) return [];
  const copies = items.length >= 8 ? 2 : Math.max(4, Math.ceil(10 / items.length));
  return Array.from({ length: copies }, () => items).flat();
}

export function ProductCatalog({
  initialFilter,
  initialType,
  heading = "Explore Our Range of Digital Hearing Aids",
  subtitle = "Discover the latest models — from powerful BTE to discreet CIC.",
}: ProductCatalogProps) {
  const [filter, setFilter] = useState<Filter>(resolveInitialFilter(initialFilter));
  const [selected, setSelected] = useState<Product | null>(null);

  const visible = useMemo(
    () => products.filter((product) => matchesFilter(product, filter, initialType)),
    [filter, initialType],
  );
  const looped = useMemo(() => loopProducts(visible), [visible]);

  return (
    <section id="catalog" className="bg-white" aria-labelledby="catalog-heading">
      <div className="py-14">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h2 id="catalog-heading" className="text-3xl font-bold text-brand-dark sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-brand-muted">{subtitle}</p>
          <div className="mt-8 flex justify-center">
            <div
              className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-brand-dark p-1.5 text-white"
              role="group"
              aria-label="Filter hearing aids"
            >
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition",
                    filter === item ? "bg-white/15 text-white" : "text-white/75 hover:text-white",
                  )}
                  aria-pressed={filter === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-center text-sm text-brand-muted">No models match this filter yet.</p>
        ) : (
          <div className="relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-white to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-white to-transparent sm:w-16" />
            <div
              className="flex w-max animate-catalog-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
              style={{ animationDuration: `${Math.max(looped.length, 8) * 3.2}s` }}
            >
              {looped.map((product, index) => (
                <div key={`${product.slug}-${index}`} className="w-[270px] shrink-0 px-3">
                  <ProductCard product={product} onGetPrice={setSelected} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <LeadModal
        open={Boolean(selected)}
        productName={selected?.name}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
