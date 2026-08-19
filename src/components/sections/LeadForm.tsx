"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  concernOrCity: z.string().trim().min(2, "Please share your city or hearing concern"),
});

type LeadValues = z.infer<typeof leadSchema>;

type LeadFormProps = {
  productName?: string;
  compact?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

export function LeadForm({
  productName,
  compact = false,
  variant = "light",
  className,
}: LeadFormProps) {
  const dark = variant === "dark";
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      concernOrCity: productName ? `Best price for ${productName}` : "",
    },
  });

  const onSubmit = async (_values: LeadValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
  };

  const fieldClass = dark
    ? "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white outline-none ring-brand-orange/30 placeholder:text-slate-400 focus:border-brand-orange focus:ring-4"
    : "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-dark outline-none ring-brand-orange/30 placeholder:text-brand-muted focus:border-brand-orange focus:ring-4";
  const labelClass = dark
    ? "sr-only"
    : "mb-1 block text-sm font-medium text-brand-dark";
  const errorClass = dark ? "mt-1 text-xs text-orange-300" : "mt-1 text-xs text-brand-orange";

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-xl p-6 text-center",
          dark ? "bg-white/5 text-white" : "bg-brand-surface",
          className,
        )}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-teal" />
        <p className={cn("mt-3 text-lg font-semibold", !dark && "text-brand-dark")}>
          Request received
        </p>
        <p className={cn("mt-1 text-sm", dark ? "text-slate-300" : "text-brand-muted")}>
          An audiologist will call you shortly to confirm your free hearing test.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-3", className)} noValidate>
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder={dark ? "Your Name" : "Your full name"}
          className={fieldClass}
          {...register("fullName")}
        />
        {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={dark ? "Your Phone Number" : "10-digit mobile number"}
          className={fieldClass}
          {...register("phone")}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>
      <div>
        <label htmlFor="concernOrCity" className={labelClass}>
          Hearing Concern / City
        </label>
        {dark ? (
          <textarea
            id="concernOrCity"
            rows={3}
            placeholder="Tell us about your hearing concern"
            className={cn(fieldClass, "resize-none")}
            {...register("concernOrCity")}
          />
        ) : (
          <input
            id="concernOrCity"
            type="text"
            placeholder="e.g. Delhi or trouble hearing in noise"
            className={fieldClass}
            {...register("concernOrCity")}
          />
        )}
        {errors.concernOrCity && <p className={errorClass}>{errors.concernOrCity.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-orange/25 transition hover:brightness-105 disabled:opacity-70"
      >
        {isSubmitting ? (
          "Booking..."
        ) : compact ? (
          "Get My Best Price"
        ) : (
          <>
            <CalendarDays className="h-4 w-4" />
            Book My Free Hearing Test
          </>
        )}
      </button>
    </form>
  );
}
