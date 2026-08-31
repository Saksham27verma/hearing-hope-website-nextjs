import type { MetadataRoute } from "next";
import { brandProfiles } from "@/data/brands";
import { clinicalServices } from "@/data/services";
import { hearingAidFeatures } from "@/data/hearing-aids";
import { hearingAidTypes } from "@/data/content";
import { listPublishedPosts } from "@/lib/blog";
import { listPublishedProducts } from "@/lib/catalog";
import { productHref } from "@/lib/urls";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/hearing-aids", "/services", "/clinics", "/pricing", "/about", "/checkout", "/blog"];
  const [products, posts] = await Promise.all([listPublishedProducts(), listPublishedPosts()]);
  const indexablePosts = posts.filter((post) => post.robotsIndex);
  const latestArticle = indexablePosts.reduce(
    (latest, post) => (post.publishedAt > latest ? post.publishedAt : latest),
    indexablePosts[0]?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );

  const pages = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: route === "/blog" ? new Date(`${latestArticle}T00:00:00+05:30`) : new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : route === "/hearing-aids" ? 0.95 : route === "/blog" ? 0.8 : 0.7,
  }));

  const articles = indexablePosts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00+05:30`),
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
