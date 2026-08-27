"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Bluetooth, CheckCircle2, Clock, Star } from "lucide-react";
import { checkoutHref, productHref } from "@/lib/urls";
import { productGallery } from "@/lib/product-media";
import { cn, formatInr } from "@/lib/utils";
import type { Product } from "@/types";

const styleLabel: Record<Product["type"], string> = {
  RIC: "Receiver in canal",
  BTE: "Behind the ear",
  ITC: "In the canal",
  CIC: "Completely in canal",
  IIC: "Invisible in canal",
  ITE: "In the ear",
};

export function ProductShowcase({
  product,
  onGetPrice,
  reverse = false,
}: {
  product: Product;
  onGetPrice: (product: Product) => void;
  reverse?: boolean;
}) {
  const shots = productGallery(product);
  const [active, setActive] = useState(0);
  const current = shots[active] ?? product.image;
  const isSvg = current.endsWith(".svg");

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.4)] ring-1 ring-black/5">
      <div className={cn("grid items-stretch lg:grid-cols-2", reverse && "lg:[&>div:first-child]:order-2")}>
        <div className="bg-linear-to-br from-[#F8FAFC] via-white to-[#FFF4ED] p-5 sm:p-8">
          <div className="relative aspect-4/5 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/5 sm:aspect-square">
            <Image
              src={current}
              alt={`${product.name} — view ${active + 1}`}
              fill
              className="object-contain p-6"
              sizes="(min-width: 1024px) 40vw, 100vw"
              unoptimized={isSvg}
            />
            <span className="absolute left-4 top-4 rounded-full bg-brand-dark px-3 py-1 text-[11px] font-semibold text-white">
              {product.badge}
            </span>
          </div>
          {shots.length > 1 ? (
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {shots.map((src, index) => (
                <li key={src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-20",
                      index === active ? "ring-brand-orange" : "ring-black/5 hover:ring-brand-teal/40",
                    )}
                    aria-label={`Show photo ${index + 1} of ${product.name}`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-contain p-1.5"
                      unoptimized={src.endsWith(".svg")}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
            {product.brand} · {styleLabel[product.type]}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            <Link href={productHref(product.slug)} className="hover:text-brand-orange">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-brand-muted">
            <span className="inline-flex" aria-label={`${product.rating} out of 5 stars`}>
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
            </span>
            {product.rating} · {product.reviewCount} reviews
          </p>
          <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">{product.overview}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {product.rechargeable ? (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F3] px-3 py-1 text-xs font-semibold text-brand-teal">
                <BatteryCharging className="h-3.5 w-3.5" />
                Rechargeable
              </li>
            ) : (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-muted">
                <Clock className="h-3.5 w-3.5" />
                Replaceable battery
              </li>
            )}
            {product.bluetooth ? (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4ED] px-3 py-1 text-xs font-semibold text-brand-orange">
                <Bluetooth className="h-3.5 w-3.5" />
                Bluetooth
              </li>
            ) : null}
          </ul>

          <ul className="mt-6 space-y-4">
            {product.features.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                <span>
                  <span className="block text-sm font-bold text-brand-dark">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-brand-muted">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-brand-border pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
              2026 MRP starting from
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {formatInr(product.mrp)}{" "}
              <span className="text-sm font-medium text-brand-muted">(per pair)</span>
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onGetPrice(product)}
                className="rounded-full border border-brand-dark py-3 text-sm font-semibold text-brand-dark hover:bg-brand-surface"
              >
                Get Best Price
              </button>
              <Link
                href={checkoutHref(product.slug)}
                className="inline-flex items-center justify-center rounded-full bg-brand-orange py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                Order now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
