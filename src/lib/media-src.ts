export function isRenderableImageSrc(src: string | undefined | null): boolean {
  const value = src?.trim() ?? "";
  if (!value) return false;
  return /^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/");
}
