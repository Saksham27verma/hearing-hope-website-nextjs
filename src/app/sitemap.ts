import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { listPublishedProducts } from "@/lib/catalog";
import { listBrandProfiles, listFeaturePages, listServices, listStylePages, getSiteSettings } from "@/lib/site-cms";
import { productHref } from "@/lib/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/hearing-aids", "/services", "/clinics", "/pricing", "/about", "/checkout", "/blog"];
  const [products, posts, settings, services, brands, types, features] = await Promise.all([
    listPublishedProducts(),
    listPublishedPosts(),
    getSiteSettings(),
    listServices(),
    listBrandProfiles(),
    listStylePages(),
    listFeaturePages(),
  ]);
  const indexablePosts = posts.filter((post) => post.robotsIndex);
  const latestArticle = indexablePosts.reduce(
    (latest, post) => (post.publishedAt > latest ? post.publishedAt : latest),
    indexablePosts[0]?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );

  const pages = routes.map((route) => ({
    url: `${settings.url}${route}`,
    lastModified: route === "/blog" ? new Date(`${latestArticle}T00:00:00+05:30`) : new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : route === "/hearing-aids" ? 0.95 : route === "/blog" ? 0.8 : 0.7,
  }));

  const articles = indexablePosts.map((post) => ({
    url: `${settings.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00+05:30`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const servicePages = services.map((service) => ({
    url: `${settings.url}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const brandPages = brands.map((brand) => ({
    url: `${settings.url}/hearing-aids/brands/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const typePages = types.map((type) => ({
    url: `${settings.url}/hearing-aids/types/${type.id.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const featurePages = features.map((feature) => ({
    url: `${settings.url}/hearing-aids/features/${feature.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const productPages = products.map((product) => ({
    url: `${settings.url}${productHref(product.slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...pages, ...brandPages, ...typePages, ...featurePages, ...productPages, ...servicePages, ...articles];
}
