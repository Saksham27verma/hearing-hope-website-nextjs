"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LinkPendingHint } from "@/components/ui/LinkPendingHint";

export function NotificationBell({ initialUnreadCount }: { initialUnreadCount: number }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const openQueue = async () => {
    if (unreadCount > 0) {
      try {
        const response = await fetch("/api/admin/notifications/read", { method: "POST" });
        if (response.ok) setUnreadCount(0);
      } catch {
        // Opening the review queue still works when marking a notification read fails.
      } finally {
        router.push("/admin/automation/queue");
        router.refresh();
      }
      return;
    }
    router.push("/admin/automation/queue");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void openQueue()}
      aria-label={`${unreadCount} unread automation notification${unreadCount === 1 ? "" : "s"}`}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
    >
      <Bell className="h-4 w-4" />
      <span className="flex-1">Notifications</span>
      {unreadCount > 0 ? <span className="rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span> : null}
      <LinkPendingHint />
    </button>
  );
}
