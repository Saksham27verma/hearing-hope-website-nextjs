"use client";

import { useState } from "react";
import { ProductShowcase } from "@/components/brands/ProductShowcase";
import { LeadModal } from "@/components/ui/LeadModal";
import type { Product } from "@/types";

export function BrandModels({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  if (products.length === 0) {
    return <p className="text-sm text-brand-muted">Models for this selection will appear here shortly.</p>;
  }

  return (
    <>
      <ul className="space-y-8">
        {products.map((product, index) => (
          <li key={product.slug}>
            <ProductShowcase
              product={product}
              onGetPrice={setSelected}
              reverse={index % 2 === 1}
            />
          </li>
        ))}
      </ul>
      <LeadModal
        open={Boolean(selected)}
        productName={selected?.name}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
