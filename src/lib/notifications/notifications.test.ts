import { describe, expect, it } from "vitest";
import { dailyDigest, staleDraftEscalation } from "./digest";
import { notify, type NotificationRecord, type NotificationStore } from "./index";
import { telegramMessage } from "./templates";
import { handleTelegramWebhook, parseTelegramStart } from "./telegram-webhook";
import { escalateStaleDrafts, sendDailyReviewDigests, type NotificationJobStore } from "./jobs";

class MemoryStore implements NotificationStore { rows: NotificationRecord[] = []; async record(row: NotificationRecord) { this.rows.push(row); } }
describe("notifications", () => {
  it("renders all eight Telegram templates with Markdown V2 escaping", () => {
    const payload = { name: "A.B", type: "test", title: "BERA (new)!", reason: "Need review", link: "https://example.test/a", id: 1, rating: 5, clinic: "Rohini", excerpt: "Great!", reply: "Thanks!", count: 2, review_link: "https://example.test/r", cap: 40, n: 3 };
    const types = ["draft_ready", "brief_ready", "review_urgent", "review_auto_replied", "review_nudge", "escalation", "quota_reached", "manual_ai_check_due"] as const;
    const messages = types.map((type) => telegramMessage(type, payload));
    expect(messages).toEqual(expect.arrayContaining([expect.stringContaining("a new test draft is ready for your review"), expect.stringContaining("needs a manual draft"), expect.stringContaining("URGENT:"), expect.stringContaining("Replied to a"), expect.stringContaining("Google reviews in the last 30 days"), expect.stringContaining("waiting more than 7 days"), expect.stringContaining("Daily LLM cap"), expect.stringContaining("Monthly AI visibility check is due")]));
    expect(telegramMessage("draft_ready", payload)).toContain("A\\.B"); expect(telegramMessage("draft_ready", payload)).toContain("BERA \\(new\\)\\!");
  });
  it("records in-app delivery and records a failed external channel without throwing", async () => {
    const store = new MemoryStore(); const results = await notify({ id: "team-1", email: "person@example.test", telegramChatId: "123" }, "draft_ready", { name: "A", type: "test", title: "BERA", reason: "why", link: "https://example.test" }, { store, delivery: { telegram: async () => { throw new Error("offline"); }, email: async () => {} } });
    expect(results).toHaveLength(3); expect(store.rows).toEqual(expect.arrayContaining([expect.objectContaining({ channel: "in_app", status: "pending" }), expect.objectContaining({ channel: "telegram", status: "failed" }), expect.objectContaining({ channel: "email", status: "sent" })]));
  });
  it("skips empty digests and identifies drafts waiting over seven days", () => { const now = new Date("2026-10-01T00:00:00Z"); const item = { id: "1", type: "new_page", title: "BERA", createdAt: "2026-09-20T00:00:00Z", link: "/admin/automation/queue/1" }; expect(dailyDigest({ email: "a@example.test" }, [], now)).toBeNull(); expect(dailyDigest({ email: "a@example.test" }, [item], now)?.html).toContain("BERA"); expect(staleDraftEscalation([item], now)).toMatchObject({ count: 1 }); });
  it("sends non-empty daily digests and escalates seven-day items to owners", async () => { const item = { id: "1", type: "new_page", title: "BERA", createdAt: "2026-09-20T00:00:00Z", link: "/admin/automation/queue/1" }; const queues: NotificationJobStore = { reviewQueues: async () => [{ recipient: { id: "reviewer", email: "reviewer@example.test" }, items: [item] }], owners: async () => [{ id: "owner", email: "owner@example.test" }] }; const types: string[] = []; const send = async (_recipient: unknown, type: string) => { types.push(type); return []; }; expect(await sendDailyReviewDigests(queues, new Date("2026-10-01T00:00:00Z"), send as never)).toBe(1); expect(await escalateStaleDrafts(queues, new Date("2026-10-01T00:00:00Z"), send as never)).toBe(1); expect(types).toEqual(["draft_ready", "escalation"]); });
  it("accepts only a one-time Telegram /start command", () => { expect(parseTelegramStart({ message: { chat: { id: 123 }, text: "/start abcd1234" } })).toEqual({ code: "abcd1234", chatId: "123" }); expect(parseTelegramStart({ message: { chat: { id: 123 }, text: "/start" } })).toBeNull(); });
  it("rejects an unsigned Telegram webhook and links a signed /start", async () => { process.env.TELEGRAM_WEBHOOK_SECRET = "test-webhook-secret"; const rejected = await handleTelegramWebhook(new Request("https://example.test", { method: "POST", body: "{}" })); expect(rejected.status).toBe(401); const accepted = await handleTelegramWebhook(new Request("https://example.test", { method: "POST", headers: { "x-telegram-bot-api-secret-token": "test-webhook-secret" }, body: JSON.stringify({ message: { chat: { id: 99 }, text: "/start abcd1234" } }) }), async () => ({ ok: true, linked: true })); expect(accepted.status).toBe(200); await expect(accepted.json()).resolves.toEqual({ ok: true, linked: true }); });
});
