"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { brandHref } from "@/data/brands";
import type { Product } from "@/types";
import { checkoutHref, productHref } from "@/lib/urls";
import { cn, formatInr } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  onGetPrice: (product: Product) => void;
  className?: string;
};

export function ProductCard({ product, onGetPrice, className }: ProductCardProps) {
  const batteryBadge = /hour|battery/i.test(product.badge);

  return (
    <article
      className={cn(
        "flex h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <div className="relative h-44 shrink-0 bg-brand-surface">
        <Link
          href={productHref(product.slug)}
          className="flex h-full items-center justify-center"
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={480}
            className="h-32 w-full object-contain p-4"
            unoptimized={product.image.endsWith(".svg")}
          />
        </Link>
        <span
          className="absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-5.75rem)] items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1 pr-2.5 shadow-[0_10px_24px_-10px_rgba(255,101,3,0.9)] ring-1 ring-orange-200/80 backdrop-blur-sm"
          title={product.badge}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
              batteryBadge
                ? "bg-brand-teal"
                : "bg-linear-to-br from-brand-orange to-[#ff8a3d]",
            )}
          >
            {batteryBadge ? <Clock className="h-3 w-3" /> : <Sparkles className="h-3 w-3 fill-white" />}
          </span>
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-brand-dark">
            {product.badge}
          </span>
        </span>
        <Link
          href={brandHref(product.brandSlug || product.brand)}
          className="absolute right-3 top-3 z-10 flex h-9 w-[4.75rem] items-center justify-center rounded-xl bg-white/95 px-1.5 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:ring-brand-orange/40"
          aria-label={`${product.brand} hearing aids`}
        >
          <Image
            src={product.brandLogo}
            alt={product.brand}
            width={88}
            height={28}
            className="h-6 w-auto max-w-full object-contain"
            unoptimized
          />
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="min-h-10 text-[15px] font-bold leading-snug text-brand-dark">
          <Link href={productHref(product.slug)} className="line-clamp-2 hover:text-brand-orange">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-brand-muted">{product.feature}</p>
        <div className="mt-auto pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
            2026 MRP starting from
          </p>
          <p className="mt-1 text-lg font-bold text-brand-dark no-underline">
            {formatInr(product.mrp)}{" "}
            <span className="text-sm font-medium text-brand-muted no-underline">(per pair)</span>
          </p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => onGetPrice(product)}
              className="w-full rounded-lg border border-brand-dark bg-white py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-surface"
            >
              Get Best Price
            </button>
            <Link
              href={checkoutHref(product.slug)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Order now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
