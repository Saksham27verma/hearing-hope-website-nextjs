import type { MetadataRoute } from "next";

export const SITEMAP_PAGE_SIZE = 5_000;

export function sitemapPageCount(entries: MetadataRoute.Sitemap) {
  return Math.max(1, Math.ceil(entries.length / SITEMAP_PAGE_SIZE));
}

export function sitemapPage(entries: MetadataRoute.Sitemap, id = 0) {
  return entries.slice(id * SITEMAP_PAGE_SIZE, (id + 1) * SITEMAP_PAGE_SIZE);
}
