"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteProduct, deleteAllProducts } from "@/app/admin/actions";
import { AssignModelPhotos } from "@/components/admin/AssignModelPhotos";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { isRemoteImage } from "@/lib/product-media";
import { studioPhotoCount } from "@/lib/product-photo";
import { cn, formatInr } from "@/lib/utils";
import type { CatalogBrand, Product } from "@/types";

export function ProductCatalogClient({
  products,
  brands,
}: {
  products: Product[];
  brands: CatalogBrand[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [style, setStyle] = useState("all");
  const [status, setStatus] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAllPending, setDeleteAllPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const styles = useMemo(() => [...new Set(products.map((item) => item.type))], [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (brand !== "all" && product.brand !== brand) return false;
      if (style !== "all" && product.type !== style) return false;
      if (status === "live" && !product.published) return false;
      if (status === "draft" && product.published) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q)
      );
    });
  }, [brand, products, query, status, style]);

  const liveCount = products.filter((item) => item.published).length;
  const visibleIds = visible.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setPendingId(toDelete.id);
    setError(null);
    const result = await deleteProduct(toDelete.id);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(toDelete.id);
      return next;
    });
    setToDelete(null);
    router.refresh();
  }

  async function confirmDeleteAll() {
    setDeleteAllPending(true);
    setError(null);
    const result = await deleteAllProducts();
    setDeleteAllPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelectedIds(new Set());
    setDeleteAllOpen(false);
    router.refresh();
  }

  return (
    <div className={cn(selectedIds.size ? "pb-56" : "")}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Hearing aid models</h1>
          <p className="mt-2 text-sm text-brand-muted">
            {products.length} models · {liveCount} live on the website · {brands.length} brands.
            Tick models that look the same, then drop one photo at the bottom to apply it to all of them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button
              type="button"
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete all
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Add a model
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, slug or brand"
            className="w-full rounded-2xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/15"
          />
        </label>
        <select
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="rounded-2xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
        >
          <option value="all">All brands</option>
          {brands.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="rounded-2xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
          >
            <option value="all">All types</option>
            {styles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
          >
            <option value="all">All status</option>
            <option value="live">Live</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-brand-orange">{error}</p> : null}

      {visible.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/5">
          <p className="font-semibold text-brand-dark">No models match these filters</p>
          <p className="mt-2 text-sm text-brand-muted">Clear search, or add a new hearing aid to the catalog.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          <li className="flex items-center gap-3 px-2 text-xs font-semibold text-brand-muted">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleVisible}
                className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange/30"
              />
              Select all {visible.length} shown
            </label>
          </li>
          {visible.map((product) => {
            const photoCount = studioPhotoCount(product);
            const selected = selectedIds.has(product.id);
            return (
              <li
                key={product.id}
                className={cn(
                  "grid items-center gap-4 rounded-3xl bg-white p-4 ring-1 sm:grid-cols-[auto_auto_1fr_auto]",
                  selected ? "ring-brand-orange/40" : "ring-black/5",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleOne(product.id)}
                  aria-label={`Select ${product.name}`}
                  className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange/30"
                />
                <Link href={`/admin/products/${product.id}`} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-brand-surface">
                  {photoCount ? (
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-contain p-2"
                      unoptimized={!isRemoteImage(product.image) || product.image.endsWith(".svg")}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      No photo
                    </span>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link href={`/admin/products/${product.id}`} className="font-bold text-brand-dark hover:text-brand-orange">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-brand-muted">
                    {product.brand} · {product.type} · {formatInr(product.mrp)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={
                        product.published
                          ? "rounded-full bg-[#E7F7F3] px-2 py-0.5 text-[11px] font-semibold text-brand-teal"
                          : "rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-muted"
                      }
                    >
                      {product.published ? "Live" : "Draft"}
                    </span>
                    {product.colors.length ? (
                      <span className="inline-flex items-center gap-1">
                        {product.colors.slice(0, 6).map((color) => (
                          <span
                            key={color.id}
                            title={color.name}
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: color.hex || "#cbd5e1" }}
                          />
                        ))}
                        <span className="text-[11px] text-brand-muted">
                          {product.colors.length} colour{product.colors.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-brand-muted">No colours yet</span>
                    )}
                    <span className="text-[11px] text-brand-muted">
                      {photoCount ? `${photoCount} photos` : "Needs a photo"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-border px-3 py-2 text-sm font-semibold hover:bg-brand-surface"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(product)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AssignModelPhotos
        products={products}
        selectedIds={selectedIds}
        onClear={() => setSelectedIds(new Set())}
        onSelectIds={(ids) => setSelectedIds(new Set(ids))}
        onDone={() => {
          setSelectedIds(new Set());
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.name ?? "this model"}?`}
        body="This removes the hearing aid, its colours and photos from the catalog. The public site updates as soon as you delete it."
        pending={Boolean(pendingId)}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all models?"
        body={`This will permanently remove all ${products.length} hearing aid models from the catalog. This action cannot be undone.`}
        pending={deleteAllPending}
        onCancel={() => setDeleteAllOpen(false)}
        onConfirm={confirmDeleteAll}
      />
    </div>
  );
}
