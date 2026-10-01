import { describe, expect, it } from "vitest";
import { addFaqSchema, fixSchemaSchema, gbpPostSchema, metaRewriteSchema, newPageSchema, refreshSchema, reviewReplySchema } from "./schemas";
import { buildSystemPrompt } from "./prompts/shared";
import { promptFor } from "./prompts";

const page = { slug: "hearing-aid-cost", page_type: "guide", title: "Hearing aid cost in India", meta_title: "Hearing aid cost in India", meta_description: "A practical guide to hearing aid costs in India and the factors that affect them.", answer_summary: "Hearing aid prices in India vary by technology level, fitting needs, and after-care. A hearing test and consultation help an audiologist suggest suitable options and explain the full cost clearly before you decide.", body_markdown: "## What affects hearing aid cost?\n\nPrices vary by technology level and fitting support. [REVIEWER: verify] Book a consultation for a quote.", faq_items: Array.from({ length: 5 }, (_, index) => ({ question: `Question number ${index + 1}?`, answer: "This is a clear answer with enough detail for a patient and their family to understand the next step." })), sources: [{ title: "WHO hearing care", url: "https://www.who.int/health-topics/hearing-loss" }], internal_links: ["bera-test", "hearing-aids", "contact"], target_keywords: ["hearing aid cost india"] };

it("validates all seven generation output shapes", () => {
  expect(newPageSchema.safeParse(page).success).toBe(true); expect(refreshSchema.safeParse({ ...page, change_summary: "- Updated the cost explanation." }).success).toBe(true); expect(addFaqSchema.safeParse({ faq_items: [page.faq_items[0]] }).success).toBe(true);
  const variants = Array.from({ length: 3 }, (_, index) => ({ meta_title: `Variant ${index + 1}`, meta_description: "A plain-language description that is long enough for the metadata validation rule.", rationale: "Matches search intent." }));
  expect(metaRewriteSchema.safeParse({ variants }).success).toBe(true); expect(metaRewriteSchema.safeParse({ variants: variants.slice(0, 2) }).success).toBe(false); expect(fixSchemaSchema.safeParse({}).success).toBe(true); expect(reviewReplySchema.safeParse({ reply_text: "Thank you for sharing your visit with Hearing Hope.", tone: "warm", escalate: false, escalation_reason: "" }).success).toBe(true); expect(gbpPostSchema.safeParse({ post_text: "Book a free hearing consultation at Hearing Hope.", cta_type: "BOOK", cta_url: "https://www.hearinghope.in/contact", suggested_topic: "Hearing care" }).success).toBe(true);
});

it("loads the brand guide and supplies every hard prompt rule to each prompt type", () => {
  const system = buildSystemPrompt();
  for (const text of ["Hearing Hope", "clear Indian English", "40–60 word direct answer", "question-form H2", "never invent prices", "Every medical claim", "Never diagnose", "5–8 FAQ", "3–6 internal links", "Never claim the content has been reviewed", "single JSON object"]) expect(system).toContain(text);
  for (const type of ["new_page", "refresh", "add_faq", "meta_rewrite", "fix_schema", "review_reply", "gbp_post"] as const) expect(promptFor(type, "context")).toMatchObject({ version: expect.stringMatching(/v1$/), userPrompt: expect.stringContaining("context") });
});
