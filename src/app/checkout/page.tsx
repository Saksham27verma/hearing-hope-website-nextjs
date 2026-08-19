import type { Metadata } from "next";
import { CheckoutClient } from "@/components/sections/CheckoutClient";
import { getProductBySlug } from "@/data/products";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Book Trial or Reserve on COD",
    description:
      "Book a free home trial or clinic appointment, or reserve a hearing aid on cash-on-delivery.",
    openGraph: {
      title: `Checkout | ${site.name}`,
      description: "Book a free trial or reserve your device on COD.",
    },
  };
}

type CheckoutPageProps = {
  searchParams: Promise<{ model?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { model } = await searchParams;
  const product = model ? getProductBySlug(model) : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <h1 className="text-3xl font-bold text-brand-dark">Book trial or reserve on COD</h1>
      <p className="mt-2 max-w-2xl text-brand-muted">
        Choose a free appointment or reserve a device. An audiologist will confirm details on call.
      </p>
      <CheckoutClient product={product} />
    </main>
  );
}
