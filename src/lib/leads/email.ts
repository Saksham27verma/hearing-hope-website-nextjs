type SmtpTransport = {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

function smtpEnv() {
  const host = (process.env.SMTP_HOST || "").trim();
  const port = Number((process.env.SMTP_PORT || "").trim() || 587);
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  const from = (process.env.SMTP_FROM || "").trim() || user;
  return { host, port, user, pass, from };
}

export function isSmtpConfigured() {
  const { host, user, pass } = smtpEnv();
  return Boolean(host && user && pass);
}

export function parseNotifyEmailList(raw: string | undefined, fallback: string[] = []) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of [...(raw || "").split(/[,;]+/), ...fallback]) {
    const email = part.trim().toLowerCase();
    if (!email || !email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

async function getTransport(): Promise<SmtpTransport | null> {
  if (!isSmtpConfigured()) return null;
  const { host, port, user, pass } = smtpEnv();
  const nodemailer = (await import("nodemailer")).default;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  }) as SmtpTransport;
}

export function formatLeadEmail(lead: {
  fullName: string;
  phone: string;
  concernOrCity: string;
  productName: string;
  address: string;
  source: string;
  pagePath: string;
}) {
  const rows = [
    ["Name", lead.fullName],
    ["Phone", lead.phone],
    ["Source", lead.source],
    ["Concern / city", lead.concernOrCity || "—"],
    ["Product", lead.productName || "—"],
    ["Address", lead.address || "—"],
    ["Page", lead.pagePath || "—"],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;color:#0f172a">
      <p style="margin:0 0 12px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#f97316">Hearing Hope website</p>
      <h1 style="margin:0 0 16px;font-size:22px">New form enquiry</h1>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px">${label}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>
  `;
  return { text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendLeadNotifyEmail(params: {
  to: string[];
  lead: {
    fullName: string;
    phone: string;
    concernOrCity: string;
    productName: string;
    address: string;
    source: string;
    pagePath: string;
  };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!params.to.length) return { ok: false, error: "No notify email configured" };
  const transport = await getTransport();
  if (!transport) return { ok: false, error: "SMTP is not configured" };

  try {
    const { from } = smtpEnv();
    const { text, html } = formatLeadEmail(params.lead);
    await transport.sendMail({
      from,
      to: params.to.join(", "),
      subject: `New website enquiry — ${params.lead.fullName}`,
      text,
      html,
    });
    console.info(`[lead-email] sent to=${params.to.join(",")}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";
    console.error("[lead-email] error", message);
    return { ok: false, error: message };
  }
}
