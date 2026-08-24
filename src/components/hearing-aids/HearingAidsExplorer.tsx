"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/sections/ProductCard";
import { LeadModal } from "@/components/ui/LeadModal";
import { brands, hearingAidTypes } from "@/data/content";
import { brandHref } from "@/data/brands";
import { featureHref, hearingAidFeatures, typeHref } from "@/data/hearing-aids";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function HearingAidsExplorer({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <section id="catalog" className="scroll-mt-28 bg-white" aria-labelledby="catalog-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Every model</p>
          <h2 id="catalog-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            All hearing aids we trial
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            Open a brand, type or feature page for the full story. Listed MRP. The model we recommend
            is the one that matches your audiogram after a test.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <NavRow label="Brand">
            {brands.map((brand) => (
              <NavChip key={brand} href={brandHref(brand)}>
                {brand}
              </NavChip>
            ))}
          </NavRow>
          <NavRow label="Type">
            {hearingAidTypes.map((type) => (
              <NavChip key={type.id} href={typeHref(type.id)}>
                {type.shortName}
              </NavChip>
            ))}
          </NavRow>
          <NavRow label="Feature">
            {hearingAidFeatures.map((item) => (
              <NavChip key={item.id} href={featureHref(item.id)}>
                {item.navLabel}
              </NavChip>
            ))}
          </NavRow>
        </div>

        <p className="mt-6 text-sm font-medium text-brand-dark">
          {products.length} hearing aids in the trial range
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} onGetPrice={setSelected} />
            </li>
          ))}
        </ul>
      </div>
      <LeadModal
        open={Boolean(selected)}
        productName={selected?.name}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function NavRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function NavChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full bg-brand-surface px-3.5 py-1.5 text-sm font-medium text-brand-dark ring-1 ring-black/5 transition hover:bg-brand-dark hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
