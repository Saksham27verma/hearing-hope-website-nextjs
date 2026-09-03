import type { BlogPost, ClinicLocation, FaqItem, Product } from "@/types";
import { faqs as fallbackFaqs } from "@/data/content";
import { openClinics as fallbackClinics } from "@/data/clinics";
import { blogWordCount } from "@/lib/blog-utils";
import { site as fallbackSite } from "@/lib/site";
import { productHref } from "@/lib/urls";
import { defaultSettings } from "@/lib/site-cms/defaults";
import type { SiteSettings } from "@/lib/site-cms/types";

function absoluteUrl(path: string, origin = fallbackSite.url) {
  if (path.startsWith("http")) return path;
  return `${origin}${path}`;
}

export function businessSchema(settings: SiteSettings = defaultSettings()) {
  const extraPhones = settings.extraPhones ?? fallbackSite.extraPhones;
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    name: settings.name,
    legalName: settings.parentCompany,
    alternateName: ["HearingHope", "Hearing Hope India"],
    url: settings.url,
    telephone: [settings.phoneTel, ...extraPhones.map((phone) => phone.tel)],
    email: settings.email,
    image: `${settings.url}/logo.svg`,
    priceRange: "₹₹",
    medicalSpecialty: "Audiology",
    openingHours: "Mo-Su 09:00-20:00",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.street,
      addressLocality: settings.address.locality,
      addressRegion: settings.address.region,
      postalCode: settings.address.postalCode,
      addressCountry: settings.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phoneTel,
      email: settings.email,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [settings.social.facebook, settings.social.instagram, settings.social.youtube],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: settings.ratingValue,
      reviewCount: settings.reviewCount,
      bestRating: "5",
    },
  };
}

export function websiteSchema(settings: SiteSettings = defaultSettings()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.name,
    alternateName: "Hearing Hope India",
    url: settings.url,
    description: settings.description,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: settings.name,
      legalName: settings.parentCompany,
      url: settings.url,
    },
  };
}

export function faqSchema(items: FaqItem[] = fallbackFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
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
        url: `${fallbackSite.url}${productHref(product.slug)}`,
        brand: {
          "@type": "Brand",
          name: product.brand,
        },
        description: product.feature,
        sku: product.slug,
        image: product.image.startsWith("http") ? product.image : `${fallbackSite.url}${product.image}`,
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
          url: `${fallbackSite.url}${productHref(product.slug)}`,
        },
      },
    })),
  };
}

export function clinicListSchema(clinics: ClinicLocation[] = fallbackClinics) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hearing Hope clinic locations",
    itemListElement: clinics.filter((clinic) => !clinic.comingSoon).map((clinic, index) => ({
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
        url: `${fallbackSite.url}/clinics`,
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
  const keywords = [...new Set([post.focusKeyword, ...post.keywords].map((item) => item.trim()).filter(Boolean))];
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: absoluteUrl(post.ogImage || post.image),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en-IN",
    keywords: keywords.length ? keywords.join(", ") : undefined,
    about: post.focusKeyword
      ? {
          "@type": "Thing",
          name: post.focusKeyword,
        }
      : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: fallbackSite.name,
      logo: {
        "@type": "ImageObject",
        url: `${fallbackSite.url}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${fallbackSite.url}/blog/${post.slug}`,
    },
    url: `${fallbackSite.url}/blog/${post.slug}`,
    articleSection: post.category,
    wordCount: blogWordCount(post),
  };
}

export function articleFaqSchema(post: BlogPost) {
  if (!post.faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function blogIndexSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${fallbackSite.name} hearing care blog`,
    description:
      "Practical guides on hearing tests, hearing aids, prices in India, and family care — written by Hearing Hope audiologists.",
    url: `${fallbackSite.url}/blog`,
    publisher: {
      "@type": "Organization",
      name: fallbackSite.name,
      logo: {
        "@type": "ImageObject",
        url: `${fallbackSite.url}/logo.svg`,
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${fallbackSite.url}/blog/${post.slug}`,
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
    name: `${fallbackSite.name} blog articles`,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: (page - 1) * perPage + index + 1,
      url: `${fallbackSite.url}/blog/${post.slug}`,
      name: post.title,
    })),
  };
}
