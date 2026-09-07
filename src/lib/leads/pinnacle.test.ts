import { describe, expect, it } from "vitest";
import { normalizePhoneForWhatsApp, parseNotifyPhoneList } from "@/lib/leads/phone";
import { buildTemplatePayload, extractMessageId, formatStaffLeadTemplateParam } from "@/lib/leads/pinnacle";

describe("normalizePhoneForWhatsApp", () => {
  it("prefixes 10-digit Indian mobiles with 91", () => {
    expect(normalizePhoneForWhatsApp("9876543210")).toBe("919876543210");
    expect(normalizePhoneForWhatsApp("+91 98765 43210")).toBe("919876543210");
    expect(normalizePhoneForWhatsApp("09876543210")).toBe("919876543210");
  });

  it("keeps already-prefixed numbers as digits only", () => {
    expect(normalizePhoneForWhatsApp("919876543210")).toBe("919876543210");
  });
});

describe("parseNotifyPhoneList", () => {
  it("splits and normalizes unique numbers", () => {
    expect(parseNotifyPhoneList("9711871168, 97118 71169")).toEqual(["919711871168", "919711871169"]);
  });
});

describe("Pinnacle template payload", () => {
  it("sends a body-only template with one name parameter", () => {
    expect(
      buildTemplatePayload({
        to: "919876543210",
        templateName: "hh_test_appt_received",
        languageCode: "en",
        bodyParams: ["Anita"],
      }),
    ).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "template",
      template: {
        name: "hh_test_appt_received",
        language: { code: "en" },
        components: [{ type: "body", parameters: [{ type: "text", text: "Anita" }] }],
      },
    });
  });

  it("omits components when the template has no variables", () => {
    const payload = buildTemplatePayload({
      to: "919876543210",
      templateName: "hh_test_appt_received",
      languageCode: "en",
      bodyParams: [],
    });
    expect(payload.template).not.toHaveProperty("components");
  });

  it("treats missing messages[0].id as not sent", () => {
    expect(extractMessageId({ messages: [] })).toBeUndefined();
    expect(extractMessageId({ messages: [{ id: "wamid.123" }] })).toBe("wamid.123");
  });

  it("packs clinic-alert details into one body variable", () => {
    expect(
      formatStaffLeadTemplateParam({
        fullName: "Anita",
        phone: "9876543210",
        details: "Delhi home visit",
      }),
    ).toBe("Anita, 9876543210, Delhi home visit");
  });
});
