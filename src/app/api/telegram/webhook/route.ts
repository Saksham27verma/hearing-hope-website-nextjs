import { handleTelegramWebhook } from "@/lib/notifications/telegram-webhook";

export async function POST(request: Request) {
  return handleTelegramWebhook(request);
}
