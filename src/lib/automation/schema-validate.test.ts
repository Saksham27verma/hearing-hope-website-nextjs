import { describe, expect, it } from "vitest";
import { validateJsonLd } from "@/lib/automation/schema-validate";

describe("validateJsonLd", () => {
  it("requires context and type", () => {
    expect(validateJsonLd({ name: "Hearing Hope" }).ok).toBe(false);
  });

  it("checks FAQ and clinic required fields", () => {
    expect(
      validateJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [],
      }).ok,
    ).toBe(true);
    expect(
      validateJsonLd({
        "@context": "https://schema.org",
        "@type": ["MedicalClinic", "LocalBusiness"],
      }).errors,
    ).toContain("Clinic schema requires address.");
  });
});
