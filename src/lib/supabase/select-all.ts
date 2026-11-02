type PageResult<T> = { data: T[] | null; error: { message: string } | null };

export const SUPABASE_PAGE_SIZE = 1_000;

/**
 * Supabase returns at most 1,000 rows per request, so a plain select silently drops the rest.
 * `page` must order by a unique column (normally `id`) so consecutive ranges never overlap.
 */
export async function selectAll<T>(page: (from: number, to: number) => PromiseLike<PageResult<T>>, pageSize = SUPABASE_PAGE_SIZE): Promise<PageResult<T>> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return { data: rows, error: null };
  }
}
