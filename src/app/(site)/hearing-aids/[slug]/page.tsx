import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/hearing-aids/ProductDetail";
import { getProductBySlug, listPublishedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";
import { brandHref } from "@/data/brands";
import { typeHref } from "@/data/hearing-aids";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Hearing aid" };
  return {
    title: product.name,
    description: product.feature || product.overview.slice(0, 160),
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description: product.feature,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

export default async function HearingAidProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <p className="text-sm text-brand-muted">
          <Link href="/hearing-aids" className="hover:text-brand-dark">
            Hearing aids
          </Link>
          <span className="px-2">/</span>
          <Link href={brandHref(product.brand)} className="hover:text-brand-dark">
            {product.brand}
          </Link>
          <span className="px-2">/</span>
          <Link href={typeHref(product.type)} className="hover:text-brand-dark">
            {product.type}
          </Link>
        </p>
        <div className="mt-6">
          <ProductDetail product={product} />
        </div>
      </div>
    </main>
  );
}
