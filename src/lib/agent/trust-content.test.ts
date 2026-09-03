import { describe, expect, it } from "vitest";
import { homeOverview } from "@/lib/agent/trust-content";

describe("homeOverview", () => {
  it("provides more than 500 characters of sequential homepage prose", () => {
    const text = [homeOverview.title, ...homeOverview.paragraphs].join(" ");
    expect(homeOverview.title.length).toBeGreaterThan(0);
    expect(text.replace(/\s+/g, " ").length).toBeGreaterThan(500);
  });
});
