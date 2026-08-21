import { products } from "@/data/products";
import { faqs } from "@/data/content";
import { openClinics } from "@/data/clinics";
import { site } from "@/lib/site";

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    name: site.name,
    url: site.url,
    telephone: site.phoneTel,
    email: site.email,
    image: `${site.url}/logo.svg`,
    priceRange: "₹₹",
    medicalSpecialty: "Audiology",
    openingHours: "Mo-Su 09:00-20:00",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.ratingValue,
      reviewCount: site.reviewCount,
      bestRating: "5",
    },
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        brand: product.brand,
        description: product.feature,
        sku: product.slug,
        image: `${site.url}${product.image}`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating.toString(),
          reviewCount: product.reviewCount.toString(),
          bestRating: "5",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.mrp.toString(),
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${site.url}/products`,
        },
      },
    })),
  };
}

export function clinicListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hearing Hope clinic locations",
    itemListElement: openClinics.map((clinic, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": ["MedicalClinic", "LocalBusiness"],
        name: `Hearing Hope ${clinic.name}`,
        telephone: clinic.phoneTel,
        openingHours: "Mo-Sa 10:00-19:00",
        address: {
          "@type": "PostalAddress",
          streetAddress: clinic.address,
          addressLocality: clinic.city,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: clinic.lat,
          longitude: clinic.lng,
        },
        url: `${site.url}/clinics`,
      },
    })),
  };
}
