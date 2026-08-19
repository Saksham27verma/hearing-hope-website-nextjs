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
  const title = product ? `Book ${product.name}` : "Secure checkout";

  return {
    title,
    description:
      "Book a hearing aid. Pay a small booking amount after you enter your details. Remaining payment and fitting happen offline with an audiologist.",
    openGraph: {
      title: `${title} | ${site.name}`,
      description: "Book a hearing aid. Remaining payment and fitting happen offline with your audiologist.",
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
