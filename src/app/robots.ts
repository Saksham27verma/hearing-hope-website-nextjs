import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "anthropic-ai", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
