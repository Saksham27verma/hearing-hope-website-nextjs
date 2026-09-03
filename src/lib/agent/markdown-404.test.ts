import { describe, expect, it } from "vitest";
import { renderNotFoundMarkdown } from "@/lib/agent/not-found-markdown";
import { site } from "@/lib/site";

describe("renderNotFoundMarkdown", () => {
  it("returns a short markdown recovery body with sitemap and llms.txt links", () => {
    const body = renderNotFoundMarkdown(site.url);
    expect(body.startsWith("# Page not found")).toBe(true);
    expect(body).toContain(`${site.url}/sitemap.xml`);
    expect(body).toContain(`${site.url}/llms.txt`);
    expect(body).toContain(`${site.url}/contact`);
    expect(body).toContain(`${site.url}/developers`);
  });
});
