import type { Metadata } from "next";
import { CheckoutClient } from "@/components/sections/CheckoutClient";
import { getProductBySlug } from "@/data/products";
import { site } from "@/lib/site";

type CheckoutPageProps = {
  searchParams: Promise<{ model?: string }>;
};

export async function generateMetadata({ searchParams }: CheckoutPageProps): Promise<Metadata> {
  const { model } = await searchParams;
  const product = model ? getProductBySlug(model) : undefined;
  const title = product ? `Order ${product.name}` : "Place your order";

  return {
    title,
    description:
      "Place your order. Our team will contact you, confirm a hearing-test appointment, and you can pay the rest at the fitting in any form you prefer.",
    openGraph: {
      title: `${title} | ${site.name}`,
      description: "Hearing test and fitting happen at your appointment. Pay the rest then, in any form you prefer.",
    },
  };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { model } = await searchParams;
  const product = model ? getProductBySlug(model) : undefined;

  return (
    <main className="bg-brand-surface">
      <CheckoutClient product={product} />
    </main>
  );
}
