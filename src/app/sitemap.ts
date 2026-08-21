import type { MetadataRoute } from "next";
import { blogs } from "@/data/blogs";
import { brandProfiles } from "@/data/brands";
import { clinicalServices } from "@/data/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/products", "/hearing-aids", "/services", "/clinics", "/pricing", "/about", "/checkout", "/blog"];

  const pages = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : 0.7,
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

  return [...pages, ...brandPages, ...servicePages, ...articles];
}
