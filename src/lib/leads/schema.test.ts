import { describe, expect, it } from "vitest";
import { howDidYouHearOptions, websiteLeadPayloadSchema } from "./schema";

describe("lead attribution", () => {
  const payload = { fullName: "Asha Kumar", phone: "9876543210", concernOrCity: "Rohini", howDidYouHear: "google_search" };
  it("requires one of the seven approved attribution options", () => {
    expect(howDidYouHearOptions).toHaveLength(7);
    expect(websiteLeadPayloadSchema.safeParse(payload).success).toBe(true);
    expect(websiteLeadPayloadSchema.safeParse({ ...payload, howDidYouHear: "friend" }).success).toBe(false);
    expect(websiteLeadPayloadSchema.safeParse({ fullName: payload.fullName, phone: payload.phone }).success).toBe(false);
  });
});
