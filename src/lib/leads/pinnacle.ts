import { normalizePhoneForWhatsApp } from "@/lib/leads/phone";

const PINNACLE_TIMEOUT_MS = 12_000;

type PinnacleSendResult =
  | { ok: true; to: string; messageId: string }
  | { ok: false; to: string; error: string };

function pinnacleConfig() {
  const phoneId = (process.env.PINNACLE_PHONE_ID || "").trim();
  const apiKey = (process.env.PINNACLE_API_KEY || "").trim();
  const templateLanguage = (process.env.PINNACLE_TEMPLATE_LANGUAGE || "en").trim() || "en";
  const formTemplateName = (process.env.PINNACLE_FORM_TEMPLATE_NAME || "").trim();
  const notifyTemplateName = (process.env.PINNACLE_LEAD_NOTIFY_TEMPLATE_NAME || "").trim();
  return { phoneId, apiKey, templateLanguage, formTemplateName, notifyTemplateName };
}

export function isPinnacleConfigured() {
  const { phoneId, apiKey } = pinnacleConfig();
  return Boolean(phoneId && apiKey);
}

export function extractMessageId(response: unknown): string | undefined {
  if (!response || typeof response !== "object") return undefined;
  const messages = (response as Record<string, unknown>).messages;
  if (Array.isArray(messages) && messages[0] && typeof messages[0] === "object") {
    const id = (messages[0] as Record<string, unknown>).id;
    return typeof id === "string" && id ? id : undefined;
  }
  return undefined;
}

function bodyParameters(values: string[]) {
  return values.map((text) => ({
    type: "text" as const,
    text: String(text || " ").slice(0, 1024),
  }));
}

export function buildTemplatePayload(params: {
  to: string;
  templateName: string;
  languageCode: string;
  bodyParams: string[];
}) {
  const components =
    params.bodyParams.length > 0
      ? [
          {
            type: "body",
            parameters: bodyParameters(params.bodyParams),
          },
        ]
      : [];

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: params.to,
    type: "template",
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      ...(components.length ? { components } : {}),
    },
  };
}

function describePinnacleError(code: unknown, detailStr: string, templateName: string) {
  if (code === 132001 || detailStr.includes("132001") || detailStr.includes("does not exist in the translation")) {
    return `WhatsApp template not found (132001): name="${templateName}". Use the exact approved name; try language en and en_US.`;
  }
  if (code === 132012 || detailStr.includes("132012") || detailStr.includes("Format mismatch")) {
    return `Template "${templateName}" header type mismatch (132012). This form send uses a body-only UTILITY template.`;
  }
  if (code === 132000 || detailStr.includes("132000")) {
    return `Template "${templateName}" has the wrong number of body parameters (132000).`;
  }
  if (
    detailStr.includes("131026") ||
    detailStr.includes("undeliverable") ||
    /same.*number|yourself|own number/i.test(detailStr)
  ) {
    return `Cannot deliver WhatsApp to ${templateName || "this number"} from the Hearing Hope WABA (often sending to the same business number 7428711680). ${detailStr}`;
  }
  return detailStr;
}

function isTemplateNotFoundError(message: string) {
  return (
    message.includes("132001") ||
    message.includes("template not found") ||
    message.includes("does not exist in the translation")
  );
}

export function wabaPhoneNumber() {
  return normalizePhoneForWhatsApp(process.env.PINNACLE_WABA_NUMBER || "7428711680");
}

export async function postToPinnacle(body: Record<string, unknown>) {
  const { phoneId, apiKey } = pinnacleConfig();
  if (!phoneId || !apiKey) {
    throw new Error("Pinnacle WhatsApp is not configured (PINNACLE_PHONE_ID / PINNACLE_API_KEY).");
  }

  const url = `https://partnersv1.pinbot.ai/v3/${phoneId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(PINNACLE_TIMEOUT_MS),
  });

  const text = await res.text();
  let responseJson: unknown = null;
  try {
    responseJson = text ? JSON.parse(text) : null;
  } catch {
    responseJson = { raw: text };
  }

  const root =
    typeof responseJson === "object" && responseJson ? (responseJson as Record<string, unknown>) : null;
  const errObj =
    root?.error && typeof root.error === "object" ? (root.error as Record<string, unknown>) : root;
  const code = errObj?.code;
  const detail = errObj ? JSON.stringify(errObj) : text || res.statusText;
  const detailStr = String(root?.message || detail);
  const requestedName =
    typeof body.template === "object" && body.template
      ? String((body.template as Record<string, unknown>).name || "")
      : "";

  if (!res.ok) {
    throw new Error(describePinnacleError(code, `Pinnacle API error (${res.status}): ${detailStr}`, requestedName));
  }

  const messageId = extractMessageId(responseJson);
  if (!messageId) {
    throw new Error(
      describePinnacleError(
        code,
        `Pinnacle returned HTTP ${res.status} but no messages[0].id: ${JSON.stringify(responseJson).slice(0, 300)}`,
        requestedName,
      ),
    );
  }

  return { responseJson, messageId };
}

async function sendTemplate(params: {
  phone: string;
  templateName: string;
  bodyParams: string[];
}): Promise<PinnacleSendResult> {
  const to = normalizePhoneForWhatsApp(params.phone);
  if (!to || to.length < 12) {
    return { ok: false, to, error: "Invalid phone number" };
  }
  if (!params.templateName) {
    return { ok: false, to, error: "WhatsApp template name is not configured" };
  }

  const { templateLanguage } = pinnacleConfig();
  const languages = [...new Set([templateLanguage, "en", "en_US"].map((code) => code.trim()).filter(Boolean))];
  let lastError = "Pinnacle send failed";

  for (const languageCode of languages) {
    try {
      const payload = buildTemplatePayload({
        to,
        templateName: params.templateName,
        languageCode,
        bodyParams: params.bodyParams,
      });
      const { messageId } = await postToPinnacle(payload);
      console.info(
        `[pinnacle] sent to=${to} messageId=${messageId} template=${params.templateName} lang=${languageCode}`,
      );
      return { ok: true, to, messageId };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Pinnacle send failed";
      console.error(`[pinnacle] error to=${to} template=${params.templateName} lang=${languageCode} ${lastError}`);
      if (!isTemplateNotFoundError(lastError)) {
        return { ok: false, to, error: lastError };
      }
    }
  }

  return { ok: false, to, error: lastError };
}

export async function sendPatientFormWhatsApp(params: {
  name: string;
  phone: string;
}): Promise<PinnacleSendResult> {
  const { formTemplateName } = pinnacleConfig();
  const name = (params.name || "Customer").trim() || "Customer";
  return sendTemplate({
    phone: params.phone,
    templateName: formTemplateName,
    bodyParams: [name],
  });
}

async function sendStaffTextWhatsApp(params: { phone: string; body: string }): Promise<PinnacleSendResult> {
  const to = normalizePhoneForWhatsApp(params.phone);
  if (!to || to.length < 12) {
    return { ok: false, to, error: "Invalid staff phone number" };
  }
  try {
    const { messageId } = await postToPinnacle({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: params.body.slice(0, 4096) },
    });
    console.info(`[pinnacle] staff text sent to=${to} messageId=${messageId}`);
    return { ok: true, to, messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pinnacle staff send failed";
    console.error(`[pinnacle] staff text error to=${to} ${message}`);
    return { ok: false, to, error: message };
  }
}

export function formatStaffLeadBody(lead: {
  fullName: string;
  phone: string;
  concernOrCity: string;
  productName: string;
  address: string;
  source: string;
  pagePath: string;
}) {
  const lines = [
    "New Hearing Hope website enquiry",
    `Name: ${lead.fullName}`,
    `Phone: ${lead.phone}`,
    `Source: ${lead.source}`,
  ];
  if (lead.concernOrCity) lines.push(`Concern / city: ${lead.concernOrCity}`);
  if (lead.productName) lines.push(`Product: ${lead.productName}`);
  if (lead.address) lines.push(`Address: ${lead.address}`);
  if (lead.pagePath) lines.push(`Page: ${lead.pagePath}`);
  return lines.join("\n");
}

/** Single WhatsApp body variable — Meta rejects short templates with 2–3 placeholders. */
export function formatStaffLeadTemplateParam(params: {
  fullName: string;
  phone: string;
  details: string;
}) {
  const name = (params.fullName || "Customer").trim() || "Customer";
  const phone = (params.phone || "").trim() || "number not given";
  const details = (params.details || "").trim() || "Website form";
  return `${name}, ${phone}, ${details}`.slice(0, 600);
}

export async function sendStaffLeadWhatsApp(params: {
  staffPhone: string;
  fullName: string;
  phone: string;
  details: string;
  textBody: string;
}): Promise<PinnacleSendResult> {
  const { notifyTemplateName } = pinnacleConfig();
  if (notifyTemplateName) {
    const templated = await sendTemplate({
      phone: params.staffPhone,
      templateName: notifyTemplateName,
      bodyParams: [formatStaffLeadTemplateParam(params)],
    });
    if (templated.ok) return templated;
    const fallback = await sendStaffTextWhatsApp({ phone: params.staffPhone, body: params.textBody });
    if (fallback.ok) return fallback;
    return templated;
  }
  return sendStaffTextWhatsApp({ phone: params.staffPhone, body: params.textBody });
}
