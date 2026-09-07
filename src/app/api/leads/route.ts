import { NextResponse } from "next/server";
import { normalizePhoneForWhatsApp } from "@/lib/leads/phone";
import { websiteLeadPayloadSchema } from "@/lib/leads/schema";
import { submitWebsiteLead } from "@/lib/leads/submit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = websiteLeadPayloadSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check the form and try again.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const payload = parsed.data;
  if (payload.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (payload.source === "checkout" && payload.address.trim().length < 8) {
    return NextResponse.json({ ok: false, error: "Enter your full address" }, { status: 400 });
  }
  if (payload.source !== "checkout" && payload.concernOrCity.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Please share your city or hearing concern" }, { status: 400 });
  }

  const phoneNormalized = normalizePhoneForWhatsApp(payload.phone);
  if (!phoneNormalized || phoneNormalized.length < 12) {
    return NextResponse.json({ ok: false, error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });
  }

  const result = await submitWebsiteLead(payload, phoneNormalized);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
