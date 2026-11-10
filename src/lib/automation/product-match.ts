export type ProductOption = { id: string; name: string; slug: string };

function tokens(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

/**
 * Best catalog product for a draft, judged from its title and slug: every word
 * of the product's name must appear, and the most specific such name wins.
 * Returns null when nothing matches or two products match equally well, so a
 * reviewer is never handed a coin-flip.
 */
export function suggestProduct(draft: { title: string; slug: string }, products: ProductOption[]) {
  const words = new Set([...tokens(draft.title), ...tokens(draft.slug)]);
  let best: ProductOption | null = null;
  let bestSize = 0;
  let tied = false;
  for (const product of products) {
    const name = tokens(product.name);
    if (!name.size || ![...name].every((word) => words.has(word))) continue;
    if (name.size > bestSize) {
      best = product;
      bestSize = name.size;
      tied = false;
    } else if (name.size === bestSize) {
      tied = true;
    }
  }
  return tied ? null : best;
}
