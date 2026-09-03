import { describe, expect, it } from "vitest";
import { renderLlmsTxt } from "@/lib/agent/llms-txt";
import { site } from "@/lib/site";

describe("renderLlmsTxt", () => {
  it("follows llms.txt v2: H1, blockquote, when-to-use before the first H2", () => {
    const text = renderLlmsTxt(site.url);
    expect(text.startsWith("# Hearing Hope\n")).toBe(true);
    expect(text).toMatch(/^# Hearing Hope\n\n> /);
    const firstH2 = text.indexOf("\n## ");
    const whenToUse = text.indexOf("When to use this:");
    expect(whenToUse).toBeGreaterThan(0);
    expect(firstH2).toBeGreaterThan(whenToUse);
    expect(text.slice(0, firstH2)).toContain("How an agent should call Hearing Hope");
  });

  it("lists developer resources and MCP discovery URLs", () => {
    const text = renderLlmsTxt(site.url);
    expect(text).toContain(`${site.url}/developers.md`);
    expect(text).toContain(`${site.url}/openapi.json`);
    expect(text).toContain(`${site.url}/.well-known/mcp`);
    expect(text).toContain(`${site.url}/contact.md`);
  });
});
