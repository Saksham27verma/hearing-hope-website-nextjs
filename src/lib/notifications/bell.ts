import type { SupabaseClient } from "@supabase/supabase-js";

/** Pending in-app records are notifications the recipient has not yet opened. */
export async function unreadNotificationCount(supabase: SupabaseClient, recipientId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .eq("channel", "in_app")
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markInAppNotificationsRead(supabase: SupabaseClient, recipientId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("recipient_id", recipientId)
    .eq("channel", "in_app")
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}
