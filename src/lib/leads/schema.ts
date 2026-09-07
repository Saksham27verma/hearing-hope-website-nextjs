import { z } from "zod";

export const indianMobileSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const hearingTestLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  phone: indianMobileSchema,
  concernOrCity: z.string().trim().min(2, "Please share your city or hearing concern"),
});

export const checkoutLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  phone: indianMobileSchema,
  address: z.string().trim().min(8, "Enter your full address"),
});

export const websiteLeadPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: indianMobileSchema,
  concernOrCity: z.string().trim().max(500).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  productName: z.string().trim().max(200).optional().default(""),
  source: z.enum(["hearing_test", "checkout", "product_enquiry"]).optional().default("hearing_test"),
  pagePath: z.string().trim().max(300).optional().default(""),
  company: z.string().optional().default(""),
});

export type HearingTestLeadValues = z.infer<typeof hearingTestLeadSchema>;
export type CheckoutLeadValues = z.infer<typeof checkoutLeadSchema>;
export type WebsiteLeadPayload = z.infer<typeof websiteLeadPayloadSchema>;
