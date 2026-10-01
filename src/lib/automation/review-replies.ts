import { publishAutomationEvent } from "./events";
export type Review = { id: string; clinicId: string; clinic: string; rating: number; text: string; authorName?: string; manager: { id: string; name: string; email?: string | null; telegramChatId?: string | null } };
export type ReviewReply = { replyText: string; escalate: boolean; escalationReason: string };
export interface ReviewReplyStore { createTicket(review: Review, reply: ReviewReply): Promise<void>; setAutoPublished(reviewId: string, reply: string): Promise<void>; }
export type ReviewReplyDeps = { generate: (review: Review) => Promise<ReviewReply>; publish: (review: Review, reply: string) => Promise<void>; notify: (recipient: Review["manager"], type: "review_urgent" | "review_auto_replied", payload: Record<string, unknown>) => Promise<void>; emailEscalation: (review: Review) => Promise<void> };
export async function handleReviewReceived(review: Review, store: ReviewReplyStore, deps: ReviewReplyDeps) {
  let drafted: ReviewReply;
  try {
    drafted = await deps.generate(review);
  } catch (error) {
    // A cap-hit/manual provider must create work for a human, never a public reply.
    await store.createTicket(review, { replyText: "", escalate: true, escalationReason: error instanceof Error ? error.message : "Review reply generation requires manual completion." });
    return { autoPublished: false as const };
  }
  if (review.rating <= 3) { await store.createTicket(review, { ...drafted, escalate: true, escalationReason: drafted.escalationReason || "Rating is 3 stars or below." }); await deps.notify(review.manager, "review_urgent", { rating: review.rating, clinic: review.clinic, excerpt: review.text.slice(0, 180), link: `/admin/reviews?review=${review.id}` }); await deps.emailEscalation(review); return { autoPublished: false as const }; }
  if (drafted.escalate) { await store.createTicket(review, drafted); return { autoPublished: false as const }; }
  await deps.publish(review, drafted.replyText); await store.setAutoPublished(review.id, drafted.replyText); await deps.notify(review.manager, "review_auto_replied", { rating: review.rating, clinic: review.clinic, reply: drafted.replyText }); await publishAutomationEvent("review.reply_published", { reviewId: review.id, auto: true }); return { autoPublished: true as const };
}
