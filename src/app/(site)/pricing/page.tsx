import type { Metadata } from "next";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { listPublishedProducts } from "@/lib/catalog";
import { getPage, getSiteSettings } from "@/lib/site-cms";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("pricing"), getSiteSettings()]);
  return {
    title: page.metaTitle || "Hearing Aid Price List",
    description: page.metaDescription,
    openGraph: {
      title: `${page.metaTitle || "Hearing Aid Price List"} | ${settings.name}`,
      description: "See starting prices and request a best-price callback.",
    },
  };
}

export default async function PricingPage() {
  const [products, page] = await Promise.all([listPublishedProducts(), getPage("pricing")]);
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-14 lg:px-6">
        <h1 className="text-3xl font-bold text-brand-dark">{page.fields.title}</h1>
        <p className="mt-3 max-w-2xl text-brand-muted">{page.fields.body}</p>
      </div>
      <ProductCatalog heading={page.fields.catalogHeading} items={products} />
    </main>
  );
}
