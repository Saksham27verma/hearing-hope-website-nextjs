import { describe, expect, it } from "vitest";
import { isReviewedMedicalPage } from "@/lib/content-pages";
import { articleSchema, breadcrumbListSchema, faqPageSchema, medicalConditionSchema, medicalTestSchema, productSchema } from "@/lib/schema";
import { validateJsonLd } from "./schema-validate";
import { renderLlmsTxt } from "@/lib/agent/llms-txt";
import { sitemapPage, sitemapPageCount } from "@/lib/sitemap-pages";

describe("automation content SEO", () => {
  it("builds valid stored schema candidates and flags missing required properties", () => {
    const base = { name: "BERA test", description: "A hearing response test.", url: "https://www.hearinghope.in/bera-test" };
    for (const schema of [medicalTestSchema(base), medicalConditionSchema(base), productSchema(base), articleSchema(base), faqPageSchema([{ question: "What is BERA?", answer: "A hearing response test." }]), breadcrumbListSchema([{ name: "Home", url: "https://www.hearinghope.in" }])]) {
      expect(validateJsonLd(schema).ok).toBe(true);
    }
    expect(validateJsonLd({ "@context": "https://schema.org", "@type": "MedicalTest" }).errors).toContain("MedicalTest schema requires name.");
  });

  it("only exposes the medical review line when a real reviewer and date are present", () => {
    expect(isReviewedMedicalPage({ pageType: "test", reviewedById: "reviewer", reviewerName: "Dr Harshi", reviewedAt: "2026-09-30T00:00:00.000Z" })).toBe(true);
    expect(isReviewedMedicalPage({ pageType: "test", reviewedById: "reviewer", reviewerName: null, reviewedAt: "2026-09-30T00:00:00.000Z" })).toBe(false);
    expect(isReviewedMedicalPage({ pageType: "guide", reviewedById: "reviewer", reviewerName: "Dr Harshi", reviewedAt: "2026-09-30T00:00:00.000Z" })).toBe(false);
  });

  it("splits sitemap entries above 5,000 and includes published guides in llms.txt", () => {
    const entries = Array.from({ length: 5_001 }, (_, index) => ({ url: `https://www.hearinghope.in/${index}` }));
    expect(sitemapPageCount(entries)).toBe(2);
    expect(sitemapPage(entries, 0)).toHaveLength(5_000);
    expect(sitemapPage(entries, 1)).toHaveLength(1);
    expect(renderLlmsTxt("https://www.hearinghope.in", [{
      id: "page", slug: "bera-test-guide", pageType: "guide", title: "BERA test guide", bodyMarkdown: "", metaTitle: "", metaDescription: "", canonicalUrl: "", answerSummary: "A concise answer.", faqItems: [], jsonLd: {}, sources: [], internalLinks: [], reviewedById: null, reviewerName: null, reviewedAt: null, publishedAt: null, updatedAt: "2026-09-30T00:00:00.000Z",
    }])).toContain("BERA test guide");
  });
});
