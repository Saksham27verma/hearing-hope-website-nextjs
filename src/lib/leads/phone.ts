export function normalizePhoneForWhatsApp(raw: string): string {
  const digits = (raw || "").toString().replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function parseNotifyPhoneList(raw: string | undefined): string[] {
  const seen = new Set<string>();
  for (const part of (raw || "").split(/[,;]+/)) {
    const to = normalizePhoneForWhatsApp(part);
    if (to.length >= 12 && !seen.has(to)) seen.add(to);
  }
  return [...seen];
}
