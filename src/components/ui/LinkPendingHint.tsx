"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

export function LinkPendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className={cn(
        "inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}
