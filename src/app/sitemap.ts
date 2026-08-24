import type { MetadataRoute } from "next";
import { blogs } from "@/data/blogs";
import { brandProfiles } from "@/data/brands";
import { clinicalServices } from "@/data/services";
import { hearingAidFeatures } from "@/data/hearing-aids";
import { hearingAidTypes } from "@/data/content";
import { listPublishedProducts } from "@/lib/catalog";
import { productHref } from "@/lib/urls";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/hearing-aids", "/services", "/clinics", "/pricing", "/about", "/checkout", "/blog"];
  const products = await listPublishedProducts();

  const pages = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : route === "/hearing-aids" ? 0.95 : 0.7,
  }));

  const articles = blogs.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const servicePages = clinicalServices.map((service) => ({
    url: `${site.url}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const brandPages = brandProfiles.map((brand) => ({
    url: `${site.url}/hearing-aids/brands/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const typePages = hearingAidTypes.map((type) => ({
    url: `${site.url}/hearing-aids/types/${type.id.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const featurePages = hearingAidFeatures.map((feature) => ({
    url: `${site.url}/hearing-aids/features/${feature.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const productPages = products.map((product) => ({
    url: `${site.url}${productHref(product.slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...pages, ...brandPages, ...typePages, ...featurePages, ...productPages, ...servicePages, ...articles];
}
