"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Lock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { openClinics } from "@/data/clinics";
import { checkoutHref, products } from "@/data/products";
import { site, whatsappHref } from "@/lib/site";
import { bookingTokenAmount, cn, formatInr, remainingBalance, toTelHref } from "@/lib/utils";
import type { Product } from "@/types";

const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name"),
    phone: z
      .string()
      .trim()
      .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("")),
    fulfillment: z.enum(["home", "clinic"]),
    city: z.string().trim().min(2, "Enter your city"),
    pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
    address: z.string().optional(),
    clinicSlug: z.string().optional(),
    notes: z.string().optional(),
    payment: z.enum(["upi", "card", "netbanking"]),
    upiId: z.string().optional(),
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    bank: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "home" && (!data.address || data.address.trim().length < 8)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Enter your full address for home delivery",
      });
    }
    if (data.fulfillment === "clinic" && !data.clinicSlug) {
      ctx.addIssue({
        code: "custom",
        path: ["clinicSlug"],
        message: "Choose a clinic for pickup",
      });
    }
  });

const paymentSchema = checkoutSchema.superRefine((data, ctx) => {
  if (data.payment === "upi" && !/^[\w.-]{2,}@[\w]{2,}$/.test(data.upiId?.trim() ?? "")) {
    ctx.addIssue({
      code: "custom",
      path: ["upiId"],
      message: "Enter a valid UPI ID, e.g. name@oksbi",
    });
  }
  if (data.payment === "card") {
    if (!data.cardName || data.cardName.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["cardName"], message: "Enter the name on the card" });
    }
    if (!/^\d{16}$/.test((data.cardNumber ?? "").replace(/[\s-]/g, ""))) {
      ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a 16-digit card number" });
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry?.trim() ?? "")) {
      ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Use MM/YY" });
    }
    if (!/^\d{3,4}$/.test(data.cardCvv?.trim() ?? "")) {
      ctx.addIssue({ code: "custom", path: ["cardCvv"], message: "Enter CVV" });
    }
  }
  if (data.payment === "netbanking" && !data.bank) {
    ctx.addIssue({ code: "custom", path: ["bank"], message: "Choose your bank" });
  }
});

type CheckoutValues = z.infer<typeof checkoutSchema>;
type EarFit = "pair" | "left" | "right";
type Step = 1 | 2 | 3;

type CheckoutClientProps = {
  product?: Product;
};

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20";

const banks = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "PNB", "Bank of Baroda"];

export function CheckoutClient({ product }: CheckoutClientProps) {
  const [step, setStep] = useState<Step>(1);
  const [ears, setEars] = useState<EarFit>("pair");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<CheckoutValues | null>(null);
  const stepRef = useRef<Step>(1);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      fulfillment: "home",
      city: "",
      pincode: "",
      address: "",
      clinicSlug: "",
      notes: "",
      payment: "upi",
      upiId: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      bank: "",
    },
  });

  const fulfillment = watch("fulfillment");
  const payment = watch("payment");
  const clinicSlug = watch("clinicSlug");
  const selectedClinic = openClinics.find((clinic) => clinic.slug === clinicSlug);

  const unitMrp = product ? (ears === "pair" ? product.mrp : Math.round(product.mrp * 0.55)) : 0;
  const tokenDue = bookingTokenAmount(unitMrp);
  const balanceDue = remainingBalance(unitMrp);
  const showBookingPayment = step === 3;
  stepRef.current = step;

  const goNext = async () => {
    const fields: (keyof CheckoutValues)[] =
      stepRef.current === 1
        ? ["fullName", "phone", "email"]
        : ["fulfillment", "city", "pincode", "address", "clinicSlug"];
    const valid = await trigger(fields);
    if (valid) {
      setStep((current) => (current === 3 ? 3 : ((current + 1) as Step)));
    }
  };

  const placeBooking = async (values: CheckoutValues) => {
    if (stepRef.current !== 3) {
      await goNext();
      return;
    }
    const paid = paymentSchema.safeParse(values);
    if (!paid.success) {
      for (const issue of paid.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          setError(path as keyof CheckoutValues, { type: "manual", message: issue.message });
        }
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 650));
    setOrderId(`HH${Date.now().toString(36).toUpperCase()}`);
    setSubmitted({
      ...values,
      cardName: undefined,
      cardNumber: undefined,
      cardExpiry: undefined,
      cardCvv: undefined,
    });
  };

  const steps = useMemo(
    () => [
      { id: 1 as const, label: "Your details" },
      { id: 2 as const, label: "Delivery" },
      { id: 3 as const, label: "Payment" },
    ],
    [],
  );

  if (submitted && orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
          <div className="bg-linear-to-r from-brand-teal to-[#12967a] px-6 py-8 text-center text-white">
            <CheckCircle2 className="mx-auto h-12 w-12" />
            <h1 className="mt-3 text-2xl font-bold">Device reserved</h1>
            <p className="mt-1 text-sm text-white/90">
              Booking amount of {formatInr(tokenDue)} received. Everything else happens offline
              with your audiologist.
            </p>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-muted">Order ID</p>
                <p className="font-mono text-lg font-bold text-brand-dark">{orderId}</p>
              </div>
              <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                10% paid · {submitted.payment === "upi" ? "UPI" : submitted.payment === "card" ? "Card" : "Net banking"}
              </span>
            </div>
            {product && (
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-surface">
                  <Image src={product.image} alt="" fill className="object-contain p-2" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">{product.name}</p>
                  <p className="text-sm text-brand-muted">
                    {ears === "pair" ? "1 pair" : ears === "left" ? "Left ear" : "Right ear"} · MRP{" "}
                    {formatInr(unitMrp)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-teal">
                    Paid now {formatInr(tokenDue)} · due offline {formatInr(balanceDue)}
                  </p>
                </div>
              </div>
            )}
            <ol className="space-y-3 text-sm text-brand-muted">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[11px] font-bold text-white">
                  1
                </span>
                An audiologist calls within 2 hours to confirm your hearing test.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-dark text-[11px] font-bold text-white">
                  2
                </span>
                The device is delivered. Fitting, programming and the remaining {formatInr(balanceDue)}{" "}
                happen in person — not online.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-teal text-[11px] font-bold text-white">
                  3
                </span>
                {submitted.fulfillment === "home"
                  ? "An audiologist visits your home for the test, fit and offline payment."
                  : `Visit ${selectedClinic?.name.replace(" Branch", "") ?? "the clinic"} for the test, fit and remaining payment.`}
              </li>
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref(
                  `Hi Hearing Hope, I reserved order ${orderId} with a 10% booking amount. Please confirm the home/clinic visit.`,
                )}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
              >
                WhatsApp us
              </a>
              <Link
                href="/products"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-border px-5 py-3 text-sm font-semibold text-brand-dark"
              >
                Browse more models
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/#catalog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to models
        </Link>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-teal">
          <Lock className="h-3.5 w-3.5" />
          Secure checkout
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          Book your device
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
          Checkout
        </h1>
        <ol className="mt-5 flex gap-2" aria-label="Checkout progress">
          {steps.map((item) => (
            <li key={item.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  step >= item.id ? "bg-brand-orange text-white" : "bg-white text-brand-muted ring-1 ring-brand-border",
                )}
              >
                {item.id}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  step >= item.id ? "text-brand-dark" : "text-brand-muted",
                )}
              >
                {item.label}
              </span>
              {item.id < 3 && (
                <span className={cn("h-px flex-1", step > item.id ? "bg-brand-orange" : "bg-brand-border")} />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (stepRef.current < 3) {
              void goNext();
              return;
            }
            void handleSubmit(placeBooking)(event);
          }}
          className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.4)] ring-1 ring-black/5 sm:p-8 lg:col-span-7"
          noValidate
        >
          {!product && (
            <div className="rounded-2xl border border-dashed border-brand-orange/40 bg-brand-orange/5 p-4 text-sm text-brand-dark">
              Pick a hearing aid from the list on the right, then continue checkout.
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-brand-dark">Who is this for?</h2>
              <div>
                <label htmlFor="checkout-name" className="mb-1 block text-sm font-medium">
                  Full name
                </label>
                <input id="checkout-name" autoComplete="name" className={fieldClass} {...register("fullName")} />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-brand-orange">{errors.fullName.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-phone" className="mb-1 block text-sm font-medium">
                    Mobile number
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit number"
                    className={fieldClass}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-brand-orange">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-email" className="mb-1 block text-sm font-medium">
                    Email <span className="font-normal text-brand-muted">(optional)</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    className={fieldClass}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-brand-orange">{errors.email.message}</p>
                  )}
                </div>
              </div>
              {product && (
                <div>
                  <p className="mb-2 text-sm font-medium">Fit</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "pair", label: "Pair" },
                        { id: "left", label: "Left ear" },
                        { id: "right", label: "Right ear" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setEars(option.id)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                          ears === option.id
                            ? "border-brand-orange bg-brand-orange/10 text-brand-dark"
                            : "border-brand-border text-brand-muted hover:border-brand-teal",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-brand-dark">How should we send it?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setValue("fulfillment", "home", { shouldValidate: true })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    fulfillment === "home"
                      ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20"
                      : "border-brand-border hover:border-brand-teal",
                  )}
                >
                  <Truck className="h-5 w-5 text-brand-orange" />
                  <p className="mt-2 font-semibold text-brand-dark">Home visit</p>
                  <p className="mt-1 text-xs leading-5 text-brand-muted">
                    Device is delivered, then an audiologist visits for testing and fitting. Remaining
                    payment is collected in person.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("fulfillment", "clinic", { shouldValidate: true })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    fulfillment === "clinic"
                      ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20"
                      : "border-brand-border hover:border-brand-teal",
                  )}
                >
                  <Store className="h-5 w-5 text-brand-teal" />
                  <p className="mt-2 font-semibold text-brand-dark">Visit a clinic</p>
                  <p className="mt-1 text-xs leading-5 text-brand-muted">
                    Collect at Rohini, Green Park, Indirapuram or Sanjay Nagar. Test, fit and
                    remaining payment happen at the branch.
                  </p>
                </button>
              </div>
              <input type="hidden" {...register("fulfillment")} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-city" className="mb-1 block text-sm font-medium">
                    City
                  </label>
                  <input id="checkout-city" autoComplete="address-level2" className={fieldClass} {...register("city")} />
                  {errors.city && <p className="mt-1 text-xs text-brand-orange">{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-pin" className="mb-1 block text-sm font-medium">
                    PIN code
                  </label>
                  <input
                    id="checkout-pin"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={fieldClass}
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs text-brand-orange">{errors.pincode.message}</p>
                  )}
                </div>
              </div>

              {fulfillment === "home" ? (
                <div>
                  <label htmlFor="checkout-address" className="mb-1 block text-sm font-medium">
                    Delivery address
                  </label>
                  <textarea
                    id="checkout-address"
                    rows={3}
                    placeholder="House / flat, street, landmark"
                    className={cn(fieldClass, "resize-none")}
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-brand-orange">{errors.address.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium">Pickup clinic</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {openClinics.map((clinic) => (
                      <button
                        key={clinic.slug}
                        type="button"
                        onClick={() => setValue("clinicSlug", clinic.slug, { shouldValidate: true })}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left",
                          clinicSlug === clinic.slug
                            ? "border-brand-teal bg-[#E7F7F3]"
                            : "border-brand-border hover:border-brand-teal",
                        )}
                      >
                        <p className="text-sm font-semibold text-brand-dark">
                          {clinic.name.replace(" Branch", "")}
                        </p>
                        <p className="mt-1 text-[11px] text-brand-muted">{clinic.hours}</p>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register("clinicSlug")} />
                  {errors.clinicSlug && (
                    <p className="mt-1 text-xs text-brand-orange">{errors.clinicSlug.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-brand-dark">Pay 10% to reserve</h2>
              <div className="rounded-2xl bg-[#E7F7F3] p-4 text-sm leading-6 text-brand-dark">
                Pay <span className="font-bold">{formatInr(tokenDue)}</span> now to book this device.
                The remaining <span className="font-bold">{formatInr(balanceDue)}</span> is paid
                offline after delivery — at a home visit or in clinic — when an audiologist tests
                and fits you. No more online payments after this.
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "upi" as const, label: "UPI", icon: Smartphone },
                    { id: "card" as const, label: "Card", icon: CreditCard },
                    { id: "netbanking" as const, label: "Net banking", icon: Building2 },
                  ] as const
                ).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setValue("payment", method.id, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold",
                      payment === method.id
                        ? "border-brand-orange bg-brand-orange/10 text-brand-dark"
                        : "border-brand-border text-brand-muted hover:border-brand-teal",
                    )}
                  >
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("payment")} />

              {payment === "upi" && (
                <div>
                  <label htmlFor="checkout-upi" className="mb-1 block text-sm font-medium">
                    UPI ID
                  </label>
                  <input
                    id="checkout-upi"
                    placeholder="yourname@oksbi"
                    autoComplete="off"
                    className={fieldClass}
                    {...register("upiId")}
                  />
                  {errors.upiId && <p className="mt-1 text-xs text-brand-orange">{errors.upiId.message}</p>}
                </div>
              )}

              {payment === "card" && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="checkout-card-name" className="mb-1 block text-sm font-medium">
                      Name on card
                    </label>
                    <input
                      id="checkout-card-name"
                      autoComplete="cc-name"
                      className={fieldClass}
                      {...register("cardName")}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-xs text-brand-orange">{errors.cardName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="checkout-card-number" className="mb-1 block text-sm font-medium">
                      Card number
                    </label>
                    <input
                      id="checkout-card-number"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="ACCT-000015"
                      maxLength={19}
                      className={fieldClass}
                      {...register("cardNumber")}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-xs text-brand-orange">{errors.cardNumber.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-card-expiry" className="mb-1 block text-sm font-medium">
                        Expiry
                      </label>
                      <input
                        id="checkout-card-expiry"
                        placeholder="MM/YY"
                        autoComplete="cc-exp"
                        className={fieldClass}
                        {...register("cardExpiry")}
                      />
                      {errors.cardExpiry && (
                        <p className="mt-1 text-xs text-brand-orange">{errors.cardExpiry.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkout-card-cvv" className="mb-1 block text-sm font-medium">
                        CVV
                      </label>
                      <input
                        id="checkout-card-cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        className={fieldClass}
                        {...register("cardCvv")}
                      />
                      {errors.cardCvv && (
                        <p className="mt-1 text-xs text-brand-orange">{errors.cardCvv.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {payment === "netbanking" && (
                <div>
                  <label htmlFor="checkout-bank" className="mb-1 block text-sm font-medium">
                    Choose bank
                  </label>
                  <select id="checkout-bank" className={fieldClass} {...register("bank")}>
                    <option value="">Select</option>
                    {banks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  {errors.bank && <p className="mt-1 text-xs text-brand-orange">{errors.bank.message}</p>}
                </div>
              )}

              <div>
                <label htmlFor="checkout-notes" className="mb-1 block text-sm font-medium">
                  Note for the audiologist{" "}
                  <span className="font-normal text-brand-muted">(optional)</span>
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  placeholder="e.g. elderly parent, preferred time, existing hearing aid"
                  className={cn(fieldClass, "resize-none")}
                  {...register("notes")}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((current) => (current === 1 ? 1 : ((current - 1) as Step)))}
                className="rounded-xl border border-brand-border px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-surface"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit(placeBooking)()}
                disabled={isSubmitting || !product}
                className="flex-1 rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
              >
                {isSubmitting ? "Paying booking amount..." : `Pay ${formatInr(tokenDue)} to book`}
              </button>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="overflow-hidden rounded-[1.75rem] bg-brand-dark text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Order summary
              </p>
            </div>
            {product ? (
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-xs text-brand-teal">{product.brand}</p>
                    <h2 className="mt-0.5 font-semibold leading-snug">{product.name}</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {product.type} · {ears === "pair" ? "1 pair" : ears === "left" ? "Left ear" : "Right ear"}
                    </p>
                    {product.inStock && (
                      <p className="mt-2 text-xs font-medium text-brand-teal">In stock for trial</p>
                    )}
                  </div>
                </div>
                <dl className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <dt>MRP</dt>
                    <dd>{formatInr(unitMrp)}</dd>
                  </div>
                  <p className="text-xs text-slate-400">Sold at MRP only. No special offers.</p>
                  {showBookingPayment && (
                    <>
                      <div className="flex justify-between text-brand-orange">
                        <dt>Booking amount (10%)</dt>
                        <dd>{formatInr(tokenDue)}</dd>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <dt>Due offline at visit</dt>
                        <dd>{formatInr(balanceDue)}</dd>
                      </div>
                    </>
                  )}
                </dl>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-sm text-slate-300">
                    {showBookingPayment ? "Pay now to book" : "Device MRP"}
                  </p>
                  <p className="inline-flex items-center gap-1 text-2xl font-bold">
                    <IndianRupee className="h-5 w-5" />
                    {formatInr(showBookingPayment ? tokenDue : unitMrp).replace("₹", "")}
                  </p>
                </div>
                {showBookingPayment && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Remaining {formatInr(balanceDue)} is collected by your audiologist at home or
                    clinic. Fitting is never done online.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-slate-300">Choose a model to continue checkout.</p>
                <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
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
              </div>
            )}
            <ul className="space-y-2 border-t border-white/10 px-6 py-5 text-xs text-slate-300">
              <li className="flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-teal" />
                4-year warranty available after programming
              </li>
              <li className="flex gap-2">
                <Package className="h-4 w-4 shrink-0 text-brand-teal" />
                Final model confirmed after a 30-minute in-person hearing test
              </li>
              <li className="flex gap-2">
                <Clock className="h-4 w-4 shrink-0 text-brand-teal" />
                {showBookingPayment
                  ? "Remaining 90% paid offline at home visit or clinic"
                  : "Test, fitting and remaining payment happen in person"}
              </li>
            </ul>
          </div>
          <p className="mt-4 flex items-center justify-center gap-4 text-xs text-brand-muted">
            <a href={toTelHref(site.phoneTel)} className="inline-flex items-center gap-1 hover:text-brand-dark">
              <Phone className="h-3.5 w-3.5" />
              {site.phoneDisplay}
            </a>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Delhi NCR clinics
            </span>
          </p>
        </aside>
      </div>
    </div>
  );
}
