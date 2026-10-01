import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { dailyDigest, staleDraftEscalation, type DigestItem } from "./digest";
import { notify, type Recipient } from "./index";

export type ReviewQueue = { recipient: Recipient; items: DigestItem[] };
export interface NotificationJobStore {
  reviewQueues(): Promise<ReviewQueue[]>;
  owners(): Promise<Recipient[]>;
}
export type NotificationSender = typeof notify;

type TicketRow = { id: string; type: string; status: string; created_at: string; assigned_reviewer_id: string | null; suggested_slug: string };
type MemberRow = { id: string; name: string; email: string; telegram_chat_id: string | null; is_reviewer: boolean; staff_role: string | null };

export class SupabaseNotificationJobStore implements NotificationJobStore {
  private db() { return createServiceSupabaseClient(); }
  private async members() {
    const { data, error } = await this.db().from("team_members").select("id,name,email,telegram_chat_id,is_reviewer,staff_role");
    if (error) throw new Error(error.message);
    return (data ?? []) as MemberRow[];
  }
  private async activeTickets() {
    const { data, error } = await this.db().from("content_tickets").select("id,type,status,created_at,assigned_reviewer_id,suggested_slug").in("status", ["open", "brief_ready", "draft_ready", "in_review", "changes_requested"]);
    if (error) throw new Error(error.message);
    return (data ?? []) as TicketRow[];
  }
  async reviewQueues() {
    const [members, tickets] = await Promise.all([this.members(), this.activeTickets()]);
    return members.filter((member) => member.is_reviewer).map((member) => ({
      recipient: { id: member.id, name: member.name, email: member.email || null, telegramChatId: member.telegram_chat_id },
      items: tickets.filter((ticket) => ticket.assigned_reviewer_id === member.id).map(ticketToItem),
    }));
  }
  async owners() {
    if (process.env.OWNER_EMAIL) return [{ email: process.env.OWNER_EMAIL }];
    const members = await this.members();
    return members.filter((member) => member.staff_role === "admin").map((member) => ({ id: member.id, name: member.name, email: member.email || null, telegramChatId: member.telegram_chat_id }));
  }
}

function ticketToItem(ticket: TicketRow): DigestItem {
  return { id: ticket.id, type: ticket.type, title: ticket.suggested_slug || ticket.type, createdAt: ticket.created_at, link: `/admin/automation/tickets?ticket=${ticket.id}` };
}

export async function sendDailyReviewDigests(store: NotificationJobStore, now = new Date(), send: NotificationSender = notify) {
  let sent = 0;
  for (const queue of await store.reviewQueues()) {
    const digest = dailyDigest(queue.recipient, queue.items, now);
    if (!digest) continue;
    await send(queue.recipient, "draft_ready", { count: queue.items.length, link: "/admin/automation/queue" }, { emailOverride: { subject: digest.subject, html: digest.html } });
    sent += 1;
  }
  return sent;
}

export async function escalateStaleDrafts(store: NotificationJobStore, now = new Date(), send: NotificationSender = notify) {
  const stale = staleDraftEscalation((await store.reviewQueues()).flatMap((queue) => queue.items), now);
  if (!stale) return 0;
  let sent = 0;
  for (const owner of await store.owners()) {
    await send(owner, "escalation", { count: stale.count, title: stale.oldest.title, link: stale.oldest.link }, { emailOverride: { subject: `Hearing Hope escalation — ${stale.count} stale draft${stale.count === 1 ? "" : "s"}`, html: `<p>${stale.count} draft${stale.count === 1 ? " is" : "s are"} waiting more than seven days. Oldest: <a href="${stale.oldest.link}">${stale.oldest.title}</a>.</p>` } });
    sent += 1;
  }
  return sent;
}
