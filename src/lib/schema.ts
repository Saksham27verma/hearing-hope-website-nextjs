import type { BlogPost, Product } from "@/types";
import { faqs } from "@/data/content";
import { openClinics } from "@/data/clinics";
import { site } from "@/lib/site";
import { productHref } from "@/lib/urls";

function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${site.url}${path}`;
}

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

export function productListSchema(products: Product[]) {
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
        image: product.image.startsWith("http") ? product.image : `${site.url}${product.image}`,
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
          url: `${site.url}${productHref(product.slug)}`,
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

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.image),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/blog/${post.slug}`,
    },
    url: `${site.url}/blog/${post.slug}`,
    articleSection: post.category,
    wordCount: post.sections
      .flatMap((section) => [...section.paragraphs, ...(section.list ?? [])])
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length,
  };
}

export function blogIndexSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} hearing care blog`,
    description:
      "Practical guides on hearing tests, hearing aids, prices in India, and family care — written by Hearing Hope audiologists.",
    url: `${site.url}/blog`,
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/logo.svg`,
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${site.url}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author.name,
      },
    })),
  };
}

export function blogItemListSchema(posts: BlogPost[], page: number, perPage: number) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} blog articles`,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: (page - 1) * perPage + index + 1,
      url: `${site.url}/blog/${post.slug}`,
      name: post.title,
    })),
  };
}
