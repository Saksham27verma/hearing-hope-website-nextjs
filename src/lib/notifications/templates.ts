export type NotificationType = "draft_ready" | "brief_ready" | "review_urgent" | "review_auto_replied" | "review_nudge" | "escalation" | "quota_reached" | "manual_ai_check_due" | "page_published";
const escape = (value: unknown) => String(value ?? "").replace(/([_\*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
export function telegramMessage(type: NotificationType, payload: Record<string, unknown>) {
  const p = (key: string) => escape(payload[key]);
  switch (type) {
    case "draft_ready": return `Hi ${p("name")}, a new ${p("type")} draft is ready for your review: ${p("title")}\nWhy: ${p("reason")}\nReview: ${p("link")}`;
    case "brief_ready": return `Ticket \#${p("id")} \(${p("type")}\) needs a manual draft\. Open: ${p("link")}`;
    case "review_urgent": return `URGENT: ${p("rating")}★ review at ${p("clinic")}\n"${p("excerpt")}"\nA reply draft is waiting: ${p("link")}`;
    case "review_auto_replied": return `Replied to a ${p("rating")}★ review at ${p("clinic")}: "${p("reply")}"`;
    case "review_nudge": return `Hi ${p("name")}, ${p("clinic")} has had ${p("count")} Google reviews in the last 30 days\. Share this link with happy patients: ${p("review_link")}`;
    case "escalation": return `Reminder: ${p("count")} drafts have been waiting more than 7 days\. Oldest: ${p("title")}\. Queue: ${p("link")}`;
    case "quota_reached": return `Daily LLM cap \(${p("cap")}\) reached\. ${p("n")} tickets waiting\. They will resume tomorrow or can be done manually: ${p("link")}`;
    case "manual_ai_check_due": return `Monthly AI visibility check is due\. Takes ~20 minutes: ${p("link")}`;
    case "page_published": return `Published: ${p("title")} — ${p("link")}`;
  }
}
export { escape as escapeTelegramMarkdownV2 };
