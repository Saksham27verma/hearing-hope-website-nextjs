import type { MetadataRoute } from "next";

export const SITEMAP_PAGE_SIZE = 5_000;

export function sitemapPageCount(entries: MetadataRoute.Sitemap) {
  return Math.max(1, Math.ceil(entries.length / SITEMAP_PAGE_SIZE));
}

export function sitemapPage(entries: MetadataRoute.Sitemap, id = 0) {
  return entries.slice(id * SITEMAP_PAGE_SIZE, (id + 1) * SITEMAP_PAGE_SIZE);
}

const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function isoDate(value: string | Date | undefined) {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function latestModified(entries: MetadataRoute.Sitemap) {
  const times = entries.map((entry) => isoDate(entry.lastModified)).filter((date): date is string => Boolean(date));
  return times.length ? times.reduce((latest, date) => (date > latest ? date : latest)) : null;
}

export function renderUrlset(entries: MetadataRoute.Sitemap) {
  const urls = entries.map((entry) => {
    const lastModified = isoDate(entry.lastModified);
    return `<url><loc>${xmlEscape(entry.url)}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ""}${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ""}${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ""}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderSitemapIndex(baseUrl: string, entries: MetadataRoute.Sitemap) {
  const sitemaps = Array.from({ length: sitemapPageCount(entries) }, (_, id) => {
    const lastModified = latestModified(sitemapPage(entries, id));
    return `<sitemap><loc>${xmlEscape(`${baseUrl}/sitemap/${id}.xml`)}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ""}</sitemap>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.join("\n")}\n</sitemapindex>\n`;
}

/** /sitemap.xml: every URL while it fits in one file, a sitemap index of /sitemap/{id}.xml above 5,000. */
export function renderRootSitemap(baseUrl: string, entries: MetadataRoute.Sitemap) {
  return sitemapPageCount(entries) === 1 ? renderUrlset(entries) : renderSitemapIndex(baseUrl, entries);
}
