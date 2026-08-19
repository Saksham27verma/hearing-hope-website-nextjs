"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { Product } from "@/types";
import { checkoutHref } from "@/data/products";
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
        "flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <div className="relative flex h-48 items-center justify-center bg-brand-surface">
        <Image
          src={product.image}
          alt={product.name}
          width={640}
          height={480}
          className="h-40 w-full object-contain p-4"
          unoptimized
        />
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
            batteryBadge ? "bg-brand-dark" : "bg-brand-orange",
          )}
        >
          {batteryBadge && <Clock className="h-3 w-3" />}
          {product.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-[15px] font-bold leading-snug text-brand-dark">{product.name}</h3>
        <p className="mt-2 flex items-center gap-0.5" aria-label={`${product.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn(
                "h-3.5 w-3.5",
                index < Math.round(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-brand-border text-brand-border",
              )}
            />
          ))}
        </p>
        <p className="mt-2 flex-1 text-sm leading-5 text-brand-muted">{product.feature}</p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
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
    </article>
  );
}
