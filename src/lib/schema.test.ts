import { describe, expect, it } from "vitest";
import { businessSchema, productListSchema } from "@/lib/schema";
import type { Product } from "@/types";

const sampleProduct = {
  id: "1",
  slug: "signia-pure-charge-and-go-ix",
  brand: "Signia",
  brandSlug: "signia",
  brandLogo: "/logo.svg",
  type: "RIC",
  name: "Signia Pure Charge&Go IX",
  badge: "Rechargeable",
  rating: 4.8,
  reviewCount: 120,
  feature: "Rechargeable RIC with Bluetooth",
  overview: "A rechargeable receiver-in-canal hearing aid.",
  features: [],
  featureIds: ["rechargeable", "bluetooth"],
  mrp: 199990,
  inStock: true,
  rechargeable: true,
  bluetooth: true,
  image: "/images/products/ric.svg",
  images: [],
  colors: [],
} satisfies Product;

describe("businessSchema", () => {
  it("includes contactPoint and PostalAddress", () => {
    const schema = businessSchema();
    expect(schema.contactPoint).toMatchObject({
      "@type": "ContactPoint",
      contactType: "customer service",
    });
    expect(schema.contactPoint.telephone).toBeTruthy();
    expect(schema.contactPoint.email).toBeTruthy();
    expect(schema.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: "IN",
    });
    expect(schema.sameAs.length).toBeGreaterThan(0);
    expect(schema.legalName).toBeTruthy();
  });
});

describe("productListSchema", () => {
  it("adds url, brand and offers on each Product", () => {
    const schema = productListSchema([sampleProduct]);
    const product = schema.itemListElement[0].item;
    expect(product["@type"]).toBe("Product");
    expect(product.url).toContain("/hearing-aids/signia-pure-charge-and-go-ix");
    expect(product.brand).toMatchObject({ "@type": "Brand", name: "Signia" });
    expect(product.offers).toMatchObject({
      "@type": "Offer",
      priceCurrency: "INR",
    });
  });
});
