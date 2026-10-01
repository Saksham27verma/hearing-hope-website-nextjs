import { z } from "zod";

export const faqItemSchema = z.object({ question: z.string().min(5), answer: z.string().min(20).max(1_200) });
export const sourceSchema = z.object({ title: z.string().min(2), url: z.url(), publisher: z.string().min(2).optional() });
export const pageSchema = z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), page_type: z.enum(["clinic", "product", "test", "condition", "guide", "comparison", "blog", "landing"]), title: z.string().min(5), meta_title: z.string().min(5).max(60), meta_description: z.string().min(20).max(160), answer_summary: z.string().min(40).max(600), body_markdown: z.string().min(100), faq_items: z.array(faqItemSchema).min(5).max(8), sources: z.array(sourceSchema).min(1), internal_links: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).min(3).max(6), target_keywords: z.array(z.string().min(2)).min(1) });
export const newPageSchema = pageSchema;
export const refreshSchema = pageSchema.extend({ change_summary: z.string().min(10) });
export const addFaqSchema = z.object({ faq_items: z.array(faqItemSchema).min(1).max(8) });
export const metaRewriteSchema = z.object({ variants: z.array(z.object({ meta_title: z.string().min(5).max(60), meta_description: z.string().min(20).max(160), rationale: z.string().min(5) })).length(3) });
export const fixSchemaSchema = z.object({ json_ld: z.record(z.string(), z.unknown()).optional() });
export const reviewReplySchema = z.object({ reply_text: z.string().min(5).max(60 * 8), tone: z.string().min(2), escalate: z.boolean(), escalation_reason: z.string() }).superRefine((value, ctx) => { if (value.reply_text.trim().split(/\s+/).length > 60) ctx.addIssue({ code: "custom", message: "Review replies must be 60 words or fewer.", path: ["reply_text"] }); });
export const gbpPostSchema = z.object({ post_text: z.string().min(10).max(300), cta_type: z.string().min(2), cta_url: z.url(), suggested_topic: z.string().min(2) });

export const outputSchemas = { new_page: newPageSchema, refresh: refreshSchema, add_faq: addFaqSchema, meta_rewrite: metaRewriteSchema, fix_schema: fixSchemaSchema, review_reply: reviewReplySchema, gbp_post: gbpPostSchema } as const;
export type GenerationTicketType = keyof typeof outputSchemas;
