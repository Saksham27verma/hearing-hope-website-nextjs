"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Bluetooth, CheckCircle2, Clock, Star } from "lucide-react";
import { LeadModal } from "@/components/ui/LeadModal";
import { productGallery } from "@/lib/product-media";
import { checkoutHref } from "@/lib/urls";
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

export function ProductDetail({ product }: { product: Product }) {
  const defaultColor = product.colors.find((color) => color.isDefault) ?? product.colors[0];
  const [colorId, setColorId] = useState<string | null>(defaultColor?.id ?? null);
  const [active, setActive] = useState(0);
  const [leadOpen, setLeadOpen] = useState(false);
  const shots = useMemo(() => productGallery(product, colorId), [product, colorId]);
  const current = shots[active] ?? product.image;
  const isSvg = current.endsWith(".svg");
  const selectedColor = product.colors.find((color) => color.id === colorId);

  return (
    <>
      <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.4)] ring-1 ring-black/5">
        <div className="grid items-stretch lg:grid-cols-2">
          <div className="bg-linear-to-br from-[#F8FAFC] via-white to-[#FFF4ED] p-5 sm:p-8">
            <div className="relative aspect-4/5 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/5 sm:aspect-square">
              <Image
                src={current}
                alt={`${product.name}${selectedColor ? ` in ${selectedColor.name}` : ""}`}
                fill
                className={cn("object-contain p-6", !isSvg && "object-cover p-0")}
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
                  <li key={`${src}-${index}`} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      className={cn(
                        "relative h-16 w-16 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-20",
                        index === active ? "ring-brand-orange" : "ring-black/5 hover:ring-brand-teal/40",
                      )}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className={cn("object-contain p-1.5", !src.endsWith(".svg") && "object-cover p-0")}
                        unoptimized={src.endsWith(".svg")}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {product.colors.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <li key={color.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setColorId(color.id);
                        setActive(0);
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1",
                        color.id === colorId
                          ? "bg-brand-dark text-white ring-brand-dark"
                          : "bg-white text-brand-dark ring-black/10",
                      )}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: color.hex || "#cbd5e1" }}
                      />
                      {color.name}
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
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-4xl">{product.name}</h1>
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
                  onClick={() => setLeadOpen(true)}
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
      <LeadModal open={leadOpen} productName={product.name} onClose={() => setLeadOpen(false)} />
    </>
  );
}
