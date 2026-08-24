export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function checkoutHref(slug: string) {
  return `/checkout?model=${encodeURIComponent(slug)}`;
}

export function productHref(slug: string) {
  return `/hearing-aids/${encodeURIComponent(slug)}`;
}
