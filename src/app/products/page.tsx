import type { Metadata } from "next";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hearing Aids",
    description:
      "Compare Signia, Phonak, Widex, Oticon, ReSound and Starkey hearing aids with transparent MRP and special offer prices.",
    openGraph: {
      title: `Hearing Aids | ${site.name}`,
      description:
        "Shop and trial premium hearing aids across India with audiologist support.",
    },
  };
}

type ProductsPageProps = {
  searchParams: Promise<{ brand?: string; type?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const headingParts = [params.brand, params.type].filter(Boolean);

  return (
    <main>
      <ProductCatalog
        initialFilter={params.brand}
        initialType={params.type}
        heading={
          headingParts.length > 0
            ? `${headingParts.join(" · ")} hearing aids`
            : "All hearing aid models"
        }
      />
    </main>
  );
}
