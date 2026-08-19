import type { Metadata } from "next";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hearing Aid Price List",
    description:
      "Transparent hearing aid prices in India. Compare MRP for Signia, Phonak, Widex, Oticon and more.",
    openGraph: {
      title: `Hearing Aid Price List | ${site.name}`,
      description: "See starting prices and request a best-price callback.",
    },
  };
}

export default async function PricingPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-14 lg:px-6">
        <h1 className="text-3xl font-bold text-brand-dark">Hearing aid price list</h1>
        <p className="mt-3 max-w-2xl text-brand-muted">
          MRPs are shown below. Final quotes depend on your audiogram, warranty pack and
          accessories. Ask for a best-price callback — no obligation.
        </p>
      </div>
      <ProductCatalog heading="Hearing aid MRP list" />
    </main>
  );
}
