import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { sendLeadNotifyEmail, parseNotifyEmailList, isSmtpConfigured } from "@/lib/leads/email";
import {
  formatStaffLeadBody,
  isPinnacleConfigured,
  sendPatientFormWhatsApp,
  sendStaffLeadWhatsApp,
} from "@/lib/leads/pinnacle";
import { parseNotifyPhoneList } from "@/lib/leads/phone";
import type { WebsiteLeadPayload } from "@/lib/leads/schema";

export type SubmitLeadResult = { ok: true; id: string } | { ok: false; error: string };

function notifyEmails() {
  return parseNotifyEmailList(process.env.LEAD_NOTIFY_EMAIL, ["hearinghope@gmail.com"]);
}

function notifyPhones() {
  const configured = parseNotifyPhoneList(process.env.LEAD_NOTIFY_WHATSAPP);
  if (configured.length) return configured;
  return parseNotifyPhoneList("9711871168,9711871169");
}

async function saveLead(payload: WebsiteLeadPayload & { phoneNormalized: string }) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("submit_website_lead", {
    p_source: payload.source,
    p_full_name: payload.fullName,
    p_phone: payload.phone,
    p_phone_normalized: payload.phoneNormalized,
    p_concern_or_city: payload.concernOrCity,
    p_product_name: payload.productName,
    p_address: payload.address,
    p_page_path: payload.pagePath,
  });
  if (error) throw new Error(error.message);
  const id = typeof data === "string" ? data : "";
  if (!id) throw new Error("Lead was not saved.");
  return id;
}

async function recordNotify(
  id: string,
  result: {
    whatsappPatientId: string;
    whatsappPatientError: string;
    whatsappStaffId: string;
    whatsappStaffError: string;
    emailSent: boolean;
    emailError: string;
  },
) {
  const supabase = createPublicSupabaseClient();
  const { error } = await supabase.rpc("record_form_lead_notify", {
    p_id: id,
    p_whatsapp_patient_id: result.whatsappPatientId,
    p_whatsapp_patient_error: result.whatsappPatientError,
    p_whatsapp_staff_id: result.whatsappStaffId,
    p_whatsapp_staff_error: result.whatsappStaffError,
    p_email_sent: result.emailSent,
    p_email_error: result.emailError,
  });
  if (error) console.error("[leads] notify status update failed", error.message);
}

export async function submitWebsiteLead(
  payload: WebsiteLeadPayload,
  phoneNormalized: string,
): Promise<SubmitLeadResult> {
  let id = "";
  let saveError = "";
  try {
    id = await saveLead({ ...payload, phoneNormalized });
  } catch (error) {
    saveError = error instanceof Error ? error.message : "Could not save your request.";
    console.error("[leads] save failed", saveError);
  }

  const staffBody = formatStaffLeadBody({
    fullName: payload.fullName,
    phone: payload.phone,
    concernOrCity: payload.concernOrCity,
    productName: payload.productName,
    address: payload.address,
    source: payload.source,
    pagePath: payload.pagePath,
  });
  const staffDetails = [payload.concernOrCity, payload.productName, payload.address].filter(Boolean).join(" · ") || "Website form";

  const patientPromise = isPinnacleConfigured()
    ? sendPatientFormWhatsApp({ name: payload.fullName, phone: payload.phone })
    : Promise.resolve({ ok: false as const, to: phoneNormalized, error: "Pinnacle is not configured" });

  const staffPhones = notifyPhones().filter((phone) => phone !== phoneNormalized);
  const staffPromise = isPinnacleConfigured()
    ? Promise.all(
        staffPhones.map((staffPhone) =>
          sendStaffLeadWhatsApp({
            staffPhone,
            fullName: payload.fullName,
            phone: payload.phone,
            details: staffDetails,
            textBody: staffBody,
          }),
        ),
      )
    : Promise.resolve([]);

  const emailPromise = isSmtpConfigured()
    ? sendLeadNotifyEmail({
        to: notifyEmails(),
        lead: payload,
      })
    : Promise.resolve({ ok: false as const, error: "SMTP is not configured" });

  const [patient, staffResults, email] = await Promise.all([patientPromise, staffPromise, emailPromise]);
  const staffOk = staffResults.filter((item) => item.ok);
  const staffFail = staffResults.filter((item) => !item.ok);

  if (id) {
    await recordNotify(id, {
      whatsappPatientId: patient.ok ? patient.messageId : "",
      whatsappPatientError: patient.ok ? "" : patient.error,
      whatsappStaffId: staffOk.map((item) => item.messageId).join(","),
      whatsappStaffError: staffFail.map((item) => `${item.to}: ${item.error}`).join(" | "),
      emailSent: email.ok,
      emailError: email.ok ? "" : email.error,
    });
  }

  if (!id && !patient.ok && !staffOk.length && !email.ok) {
    return { ok: false, error: saveError || "Could not save your request." };
  }

  return { ok: true, id };
}
