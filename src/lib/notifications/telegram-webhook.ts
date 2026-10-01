import { createServiceSupabaseClient } from "@/lib/supabase/service";
export type TelegramUpdate = { message?: { chat?: { id?: number | string }; text?: string } };
export function parseTelegramStart(update: TelegramUpdate) { const text = update.message?.text?.trim() ?? ""; const match = text.match(/^\/start\s+([a-z0-9]{8,})$/i); const chatId = update.message?.chat?.id; return match && chatId !== undefined ? { code: match[1], chatId: String(chatId) } : null; }
export async function linkTelegramAccount(update: TelegramUpdate) { const start = parseTelegramStart(update); if (!start) return { ok: true as const, linked: false }; const { data, error } = await createServiceSupabaseClient().from("team_members").update({ telegram_chat_id: start.chatId }).eq("telegram_link_code", start.code).select("id").maybeSingle(); if (error) throw new Error(error.message); return { ok: true as const, linked: Boolean(data) }; }

export async function handleTelegramWebhook(request: Request, link: (update: TelegramUpdate) => Promise<{ ok: true; linked: boolean }> = linkTelegramAccount) {
  if (request.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    return Response.json(await link(await request.json() as TelegramUpdate));
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Webhook failed." }, { status: 500 });
  }
}
