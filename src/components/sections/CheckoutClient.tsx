"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Banknote, CheckCircle2, Phone, Stethoscope } from "lucide-react";
import { checkoutHref } from "@/lib/urls";
import { site, whatsappHref } from "@/lib/site";
import { cn, formatInr, toTelHref } from "@/lib/utils";
import type { Product } from "@/types";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z.string().trim().min(8, "Enter your full address"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type CheckoutClientProps = {
  product?: Product;
  products: Product[];
};

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20";

export function CheckoutClient({ product, products }: CheckoutClientProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
    },
  });

  const mrp = Number(product?.mrp);

  const onSubmit = async (_values: CheckoutValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setOrderId(`HH${Date.now().toString(36).toUpperCase()}`);
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
          <div className="bg-linear-to-r from-brand-teal to-[#12967a] px-6 py-10 text-center text-white">
            <CheckCircle2 className="mx-auto h-12 w-12" />
            <h1 className="mt-3 text-2xl font-bold">Order placed</h1>
            <p className="mt-2 text-sm text-white/90">
              Our team will contact you and confirm your hearing-test appointment.
            </p>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <div className="rounded-2xl bg-brand-surface px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-brand-muted">Order ID</p>
              <p className="font-mono text-lg font-bold text-brand-dark">{orderId}</p>
            </div>
            {product && (
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-surface">
                  <Image src={product.image} alt="" fill className="object-contain p-2" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{product.name}</p>
                  <p className="text-sm text-brand-muted">
                    {product.brand} · {formatInr(mrp)}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-brand-dark">What happens next</p>
              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
                    1
                  </span>
                  <p className="text-sm leading-6 text-brand-muted">
                    Our team will contact you on your phone number to understand your hearing concern.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark text-sm font-bold text-white">
                    2
                  </span>
                  <p className="text-sm leading-6 text-brand-muted">
                    We will confirm your appointment for a hearing test — at home or at a Hearing Hope clinic.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal text-sm font-bold text-white">
                    3
                  </span>
                  <p className="text-sm leading-6 text-brand-muted">
                    An audiologist will fit the hearing aid during that appointment. Pay the rest at
                    the fitting — cash, UPI, card or any other method that works for you.
                  </p>
                </li>
              </ol>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref(`Hi Hearing Hope, I placed order ${orderId}. Please contact me.`)}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
              >
                WhatsApp us
              </a>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-border px-5 py-3 text-sm font-semibold text-brand-dark"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
      <Link
        href="/#catalog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to models
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Reserve your device</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Place your order</h1>
      <p className="mt-2 max-w-xl text-sm text-brand-muted">
        Share your details. We will call you, confirm a hearing-test appointment, and fit the device in person.
        Pay the rest at the fitting, in any form you prefer.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.4)] ring-1 ring-black/5 sm:p-8 lg:col-span-7"
          noValidate
        >
          {!product && (
            <div className="rounded-2xl border border-dashed border-brand-orange/40 bg-brand-orange/5 p-4 text-sm text-brand-dark">
              Pick a hearing aid from the list on the right, then continue.
            </div>
          )}
          <div>
            <label htmlFor="cod-name" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <input id="cod-name" autoComplete="name" className={fieldClass} {...register("fullName")} />
            {errors.fullName && <p className="mt-1 text-xs text-brand-orange">{errors.fullName.message}</p>}
          </div>
          <div>
            <label htmlFor="cod-phone" className="mb-1 block text-sm font-medium">
              Phone number
            </label>
            <input
              id="cod-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className={fieldClass}
              {...register("phone")}
            />
            {errors.phone && <p className="mt-1 text-xs text-brand-orange">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="cod-address" className="mb-1 block text-sm font-medium">
              Address
            </label>
            <textarea
              id="cod-address"
              rows={4}
              autoComplete="street-address"
              placeholder="House / flat, street, landmark, city, PIN code"
              className={cn(fieldClass, "resize-none")}
              {...register("address")}
            />
            {errors.address && <p className="mt-1 text-xs text-brand-orange">{errors.address.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !product}
            className="w-full rounded-xl bg-brand-orange py-3.5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="overflow-hidden rounded-[1.75rem] bg-brand-dark p-6 text-white">
            {product ? (
              <>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-2" unoptimized />
                  </div>
                  <div>
                    <p className="text-xs text-brand-teal">{product.brand}</p>
                    <h2 className="font-semibold leading-snug">{product.name}</h2>
                    <p className="mt-1 text-sm text-slate-300">{product.type} · 1 pair</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-sm text-slate-300">Listed price</p>
                  <p className="text-2xl font-bold no-underline">{formatInr(mrp)}</p>
                </div>
              </>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {products.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={checkoutHref(item.slug)}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm hover:bg-white/10"
                    >
                      <span>{item.name}</span>
                      <span className="text-slate-400">{formatInr(item.mrp)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <Banknote className="h-4 w-4 shrink-0 text-brand-teal" />
                Pay the rest at the fitting — cash, UPI, card or any method you prefer
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-teal" />
                Our team calls you to confirm the hearing test
              </li>
              <li className="flex gap-2">
                <Stethoscope className="h-4 w-4 shrink-0 text-brand-teal" />
                Fitting happens at the appointment, not online
              </li>
            </ul>
            <a href={toTelHref(site.phoneTel)} className="mt-5 inline-flex text-xs text-slate-400 hover:text-white">
              Need help? {site.phoneDisplay}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
