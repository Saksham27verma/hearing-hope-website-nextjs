import { notify, type Recipient } from "@/lib/notifications";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function marketingReviewerRecipient(): Promise<Recipient | null> {
  const { data, error } = await createServiceSupabaseClient()
    .from("team_members")
    .select("id,name,email,telegram_chat_id")
    .eq("is_reviewer", true)
    .eq("staff_role", "marketing")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { id: String(data.id), name: String(data.name), email: String(data.email ?? "") || null, telegramChatId: data.telegram_chat_id ? String(data.telegram_chat_id) : null, preferences: { email: false, inApp: false } } : null;
}

export async function sendManualAiCheckReminder(send: typeof notify = notify, recipient?: Recipient | null) {
  const target = recipient === undefined ? await marketingReviewerRecipient() : recipient;
  if (!target?.telegramChatId) return 0;
  await send(target, "manual_ai_check_due", { link: "/admin/automation/ai-check" });
  return 1;
}
