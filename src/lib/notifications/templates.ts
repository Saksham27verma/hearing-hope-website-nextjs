export type NotificationType = "draft_ready" | "review_digest" | "brief_ready" | "review_urgent" | "review_auto_replied" | "review_nudge" | "escalation" | "quota_reached" | "manual_ai_check_due" | "page_published";
const escape = (value: unknown) => String(value ?? "").replace(/([_\*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
/** Telegram MarkdownV2 text: escapes the fixed wording and every interpolated value. */
const md = (strings: TemplateStringsArray, ...values: unknown[]) => strings.reduce((out, text, index) => out + escape(text) + (index < values.length ? escape(values[index]) : ""), "");
/** Messages are read outside the site, so admin paths become full links. */
export function siteLink(path: unknown) { const value = String(path ?? ""); return value.startsWith("/") ? `${(process.env.SITE_URL ?? "https://www.hearinghope.in").replace(/\/$/, "")}${value}` : value; }
export function telegramMessage(type: NotificationType, payload: Record<string, unknown>) {
  const p = (key: string) => payload[key];
  const link = siteLink(payload.link);
  switch (type) {
    case "draft_ready": return md`Hi ${p("name")}, a new ${p("type")} draft is ready for your review: ${p("title")}\nWhy: ${p("reason")}\nReview: ${link}`;
    case "review_digest": return md`Hi ${p("name")}, ${p("count")} item${Number(payload.count) === 1 ? " is" : "s are"} waiting for your review.\nOpen the queue: ${link}`;
    case "brief_ready": return md`Ticket #${p("id")} (${p("type")}) needs a manual draft. Open: ${link}`;
    case "review_urgent": return md`URGENT: ${p("rating")}★ review at ${p("clinic")}\n"${p("excerpt")}"\nA reply draft is waiting: ${link}`;
    case "review_auto_replied": return md`Replied to a ${p("rating")}★ review at ${p("clinic")}: "${p("reply")}"`;
    case "review_nudge": return md`Hi ${p("name")}, ${p("clinic")} has had ${p("count")} Google reviews in the last 30 days. Share this link with happy patients: ${siteLink(payload.review_link)}`;
    case "escalation": return md`Reminder: ${p("count")} drafts have been waiting more than 7 days. Oldest: ${p("title")}. Queue: ${link}`;
    case "quota_reached": return md`Daily LLM cap (${p("cap")}) reached. ${p("n")} tickets waiting. They will resume tomorrow or can be done manually: ${link}`;
    case "manual_ai_check_due": return md`Monthly AI visibility check is due. Takes ~20 minutes: ${link}`;
    case "page_published": return md`Published: ${p("title")} — ${link}`;
  }
}
/** The same message for email: Telegram escapes removed, HTML-escaped, line breaks kept. */
export function emailHtmlFromTelegram(message: string) { return `<p>${message.replace(/\\([_*\[\]()~`>#+\-=|{}.!\\])/g, "$1").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replaceAll("\n", "<br>")}</p>`; }
export { escape as escapeTelegramMarkdownV2 };
