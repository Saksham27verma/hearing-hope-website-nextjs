"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatInr } from "@/lib/utils";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  city: z.string().trim().min(2, "Enter your city"),
  date: z.string().optional(),
  address: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type CheckoutClientProps = {
  product?: Product;
};

export function CheckoutClient({ product }: CheckoutClientProps) {
  const [intent, setIntent] = useState<"trial" | "cod">("trial");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (_values: CheckoutValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-brand-surface p-2">
          <button
            type="button"
            onClick={() => setIntent("trial")}
            className={cn(
              "rounded-xl px-3 py-3 text-sm font-semibold",
              intent === "trial" ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted",
            )}
          >
            Book free home trial / clinic
          </button>
          <button
            type="button"
            onClick={() => setIntent("cod")}
            className={cn(
              "rounded-xl px-3 py-3 text-sm font-semibold",
              intent === "cod" ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted",
            )}
          >
            Reserve on COD / token
          </button>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-brand-border bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-brand-teal" />
            <p className="mt-3 text-lg font-semibold">We have your request</p>
            <p className="mt-1 text-sm text-brand-muted">
              {intent === "trial"
                ? "An audiologist will confirm your appointment shortly."
                : "We will call to confirm COD / advance token details."}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-brand-border bg-white p-6"
            noValidate
          >
            <div>
              <label htmlFor="checkout-name" className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="checkout-name"
                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-brand-orange">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="checkout-phone" className="mb-1 block text-sm font-medium">
                Phone
              </label>
              <input
                id="checkout-phone"
                type="tel"
                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-brand-orange">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="checkout-city" className="mb-1 block text-sm font-medium">
                City
              </label>
              <input
                id="checkout-city"
                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
                {...register("city")}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-brand-orange">{errors.city.message}</p>
              )}
            </div>
            {intent === "trial" && (
              <>
                <div>
                  <label htmlFor="checkout-date" className="mb-1 block text-sm font-medium">
                    Preferred date
                  </label>
                  <input
                    id="checkout-date"
                    type="date"
                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
                    {...register("date")}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-address" className="mb-1 block text-sm font-medium">
                    Address
                  </label>
                  <textarea
                    id="checkout-address"
                    rows={3}
                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
                    {...register("address")}
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting
                ? "Submitting..."
                : intent === "trial"
                  ? "Confirm free appointment"
                  : "Reserve on COD"}
            </button>
          </form>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-brand-border bg-brand-surface p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Order summary</h2>
        {product ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium text-brand-dark">{product.name}</p>
            <p className="text-brand-muted">
              {product.brand} · {product.type}
            </p>
            <p className="text-brand-muted">
              MRP <span className="line-through">{formatInr(product.mrp)}</span>
            </p>
            <p className="text-xl font-bold text-brand-dark">{formatInr(product.offerPrice)}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-brand-muted">
            No model selected yet. You can still book a test and choose a device after evaluation.
          </p>
        )}
        <p className="mt-4 flex items-start gap-2 text-sm text-brand-teal">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          4-year extended warranty available on eligible models. Confirmed after audiologist
          programming.
        </p>
      </aside>
    </div>
  );
}
