import { describe, expect, it } from "vitest";
import { preferredType } from "@/lib/agent/accept";

describe("preferredType", () => {
  it("defaults to HTML when Accept is missing", () => {
    expect(preferredType(null)).toBe("text/html");
  });

  it("prefers markdown when it is listed first", () => {
    expect(preferredType("text/markdown, text/html;q=0.8")).toBe("text/markdown");
  });

  it("honours a higher q-value for HTML", () => {
    expect(preferredType("text/markdown;q=0.2, text/html;q=0.9")).toBe("text/html");
  });

  it("returns null for an unsupported type so the server can send 406", () => {
    expect(preferredType("application/pdf")).toBeNull();
  });

  it("does not let */* override an explicit markdown preference", () => {
    expect(preferredType("text/markdown, */*;q=0.1")).toBe("text/markdown");
  });
});
