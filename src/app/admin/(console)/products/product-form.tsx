"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Star, Trash2 } from "lucide-react";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { HEARING_AID_COLORS, adminField, adminLabel } from "@/components/admin/ui";
import { hearingAidFeatures } from "@/data/hearing-aids";
import { hearingAidTypes } from "@/data/content";
import { prepareAndUploadProductPhotos } from "@/lib/product-photo-client";
import { productHref, slugify } from "@/lib/urls";
import { cn, formatInr } from "@/lib/utils";
import type { CatalogBrand, HearingAidFeatureId, HearingAidStyle, Product } from "@/types";

type FormColor = ProductInput["colors"][number] & { key: string };
type FormState = Omit<ProductInput, "colors"> & { colors: FormColor[] };

function emptyState(brandId: string): FormState {
  return {
    name: "",
    slug: "",
    brandId,
    style: "RIC",
    badge: "",
    tagline: "",
    overview: "",
    mrp: 0,
    inStock: true,
    published: true,
    rating: 0,
    reviewCount: 0,
    featureIds: [],
    highlights: [{ title: "", body: "" }],
    images: [],
    colors: [],
  };
}

function fromProduct(product: Product, brands: CatalogBrand[]): FormState {
  const brand = brands.find((item) => item.slug === product.brandSlug || item.name === product.brand);
  return {
    id: product.id.startsWith("seed-") ? undefined : product.id,
    name: product.name,
    slug: product.slug,
    brandId: brand?.id ?? "",
    style: product.type,
    badge: product.badge,
    tagline: product.feature,
    overview: product.overview,
    mrp: product.mrp,
    inStock: product.inStock,
    published: product.published ?? true,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featureIds: product.featureIds,
    highlights: product.features.length ? product.features : [{ title: "", body: "" }],
    images: product.images.map((url, index) => ({ url, alt: `${product.name} photo ${index + 1}` })),
    colors: product.colors.map((color) => ({
      key: color.id,
      name: color.name,
      hex: color.hex,
      isDefault: color.isDefault,
      inStock: color.inStock,
      images: color.images.map((url, index) => ({ url, alt: `${product.name} ${color.name} ${index + 1}` })),
    })),
  };
}

export function ProductForm({ brands, product }: { brands: CatalogBrand[]; product?: Product }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    product ? fromProduct(product, brands) : emptyState(brands[0]?.id ?? ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [activeColor, setActiveColor] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const previewMrp = useMemo(() => formatInr(form.mrp || 0), [form.mrp]);
  const selectedColor = form.colors[activeColor];
  const canDelete = Boolean(form.id);

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function patchColor(index: number, partial: Partial<FormColor>) {
    const colors = form.colors.map((color, i) => (i === index ? { ...color, ...partial } : color));
    patch({ colors });
  }

  async function uploadFiles(files: FileList | File[], assign: (urls: string[]) => void, extra?: string) {
    const brand = brands.find((item) => item.id === form.brandId);
    if (!form.name.trim() && !form.slug.trim()) {
      setError("Add the model name first so the photo can be named with the brand and model.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const currentCount = extra
        ? (form.colors[activeColor]?.images.length ?? 0)
        : form.images.length;
      const assignments = await prepareAndUploadProductPhotos({
        files: Array.from(files),
        products: [
          {
            id: form.id,
            brand: brand?.name,
            brandSlug: brand?.slug,
            slug: slugify(form.slug || form.name),
            name: form.name.trim() || slugify(form.slug || form.name),
          },
        ],
        startIndex: currentCount + 1,
        extra,
      });
      assign(assignments[0]?.images.map((item) => item.url) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function addColor(preset?: { name: string; hex: string }) {
    const next: FormColor = {
      key: crypto.randomUUID(),
      name: preset?.name ?? "",
      hex: preset?.hex ?? "#C4A574",
      isDefault: form.colors.length === 0,
      inStock: true,
      images: [],
    };
    patch({ colors: [...form.colors, next] });
    setActiveColor(form.colors.length);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const colors = form.colors
      .filter((color) => color.name.trim())
      .map(({ key: _key, ...color }, index, list) => ({
        ...color,
        name: color.name.trim(),
        isDefault: list.some((item) => item.isDefault) ? color.isDefault : index === 0,
      }));
    const payload: ProductInput = {
      ...form,
      slug: slugify(form.slug || form.name),
      colors,
      highlights: form.highlights.filter((item) => item.title.trim()),
    };
    const result = await saveProduct(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!form.id) return;
    setPending(true);
    setError(null);
    const result = await deleteProduct(form.id);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <Link href="/admin/products" className="hover:underline">
              Models
            </Link>
            <span className="px-1.5 text-brand-muted">/</span>
            {product ? "Edit" : "New"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product ? product.name : "Add a hearing aid"}</h1>
          <p className="mt-2 max-w-xl text-sm text-brand-muted">
            Fill in the model, then add every shell colour with its own photos. Drafts stay off the public site until
            you publish.
          </p>
        </div>
        {product?.slug ? (
          <Link
            href={productHref(product.slug)}
            className="text-sm font-semibold text-brand-teal hover:underline"
            target="_blank"
          >
            View on website
          </Link>
        ) : null}
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
        <h2 className="text-lg font-bold">1. Model details</h2>
        <p className="mt-1 text-sm text-brand-muted">Name, brand, type and listed MRP — the fields customers see first.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label>
            <span className={adminLabel}>Model name</span>
            <input
              className={adminField}
              required
              placeholder="Signia Pure Charge&Go IX"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                patch({ name, slug: slugTouched ? form.slug : slugify(name) });
              }}
            />
          </label>
          <label>
            <span className={adminLabel}>URL slug</span>
            <input
              className={adminField}
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                patch({ slug: slugify(event.target.value) });
              }}
            />
          </label>
          <label>
            <span className={adminLabel}>Brand</span>
            <select className={adminField} value={form.brandId} onChange={(event) => patch({ brandId: event.target.value })}>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={adminLabel}>Type</span>
            <select
              className={adminField}
              value={form.style}
              onChange={(event) => patch({ style: event.target.value as HearingAidStyle })}
            >
              {hearingAidTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.shortName} — {type.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={adminLabel}>Badge</span>
            <input
              className={adminField}
              placeholder="36 Hours Battery"
              value={form.badge}
              onChange={(event) => patch({ badge: event.target.value })}
            />
          </label>
          <label>
            <span className={adminLabel}>MRP per pair · {previewMrp}</span>
            <input
              className={adminField}
              type="number"
              min={0}
              required
              value={form.mrp || ""}
              onChange={(event) => patch({ mrp: Number(event.target.value) })}
            />
          </label>
          <label className="lg:col-span-2">
            <span className={adminLabel}>One-line tagline</span>
            <input
              className={adminField}
              placeholder="AI-powered speech clarity in noisy environments"
              value={form.tagline}
              onChange={(event) => patch({ tagline: event.target.value })}
            />
          </label>
          <label className="lg:col-span-2">
            <span className={adminLabel}>Overview</span>
            <textarea
              className={cn(adminField, "min-h-28 resize-y")}
              value={form.overview}
              onChange={(event) => patch({ overview: event.target.value })}
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Toggle checked={form.published} onChange={(published) => patch({ published })} label="Published on website" />
          <Toggle checked={form.inStock} onChange={(inStock) => patch({ inStock })} label="In stock" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
        <h2 className="text-lg font-bold">2. Collection features</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Tick every tag this model should appear under on brand, type and feature pages.
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hearingAidFeatures.map((feature) => {
            const checked = form.featureIds.includes(feature.id);
            return (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      featureIds: checked
                        ? form.featureIds.filter((id) => id !== feature.id)
                        : [...form.featureIds, feature.id as HearingAidFeatureId],
                    })
                  }
                  className={cn(
                    "flex h-full w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left ring-1 transition",
                    checked
                      ? "bg-[#E7F7F3] ring-brand-teal/30"
                      : "bg-brand-surface ring-transparent hover:ring-black/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                      checked ? "bg-brand-teal text-white" : "bg-white ring-1 ring-black/10",
                    )}
                  >
                    {checked ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{feature.label}</span>
                    <span className="mt-0.5 block text-xs text-brand-muted">{feature.tagline}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
        <h2 className="text-lg font-bold">3. Colour variants</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-muted">
          Add every shell colour this model is sold in. Each colour gets its own photos. Shared photos below are the
          fallback when a colour has none yet, and they also appear on catalog cards.
        </p>

        <div className="mt-6">
          <p className={adminLabel}>Quick add</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HEARING_AID_COLORS.map((preset) => {
              const used = form.colors.some((color) => color.name.toLowerCase() === preset.name.toLowerCase());
              return (
                <button
                  key={preset.name}
                  type="button"
                  disabled={used}
                  onClick={() => addColor(preset)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-surface px-3 py-1.5 text-sm font-medium ring-1 ring-black/5 disabled:opacity-40"
                >
                  <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: preset.hex }} />
                  {preset.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => addColor()}
              className="inline-flex items-center gap-1 rounded-full bg-brand-dark px-3 py-1.5 text-sm font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Custom colour
            </button>
          </div>
        </div>

        {form.colors.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-brand-surface px-5 py-10 text-center">
            <p className="font-semibold">No colour variants yet</p>
            <p className="mt-1 text-sm text-brand-muted">Add Beige, Black, Silver — or a custom colour — then drop photos on that colour.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <ul className="space-y-2">
              {form.colors.map((color, index) => (
                <li key={color.key}>
                  <button
                    type="button"
                    onClick={() => setActiveColor(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ring-1 transition",
                      index === activeColor
                        ? "bg-white ring-brand-orange shadow-sm"
                        : "bg-brand-surface ring-transparent hover:bg-white",
                    )}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: color.hex || "#cbd5e1" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{color.name || "Untitled colour"}</span>
                      <span className="text-[11px] text-brand-muted">
                        {color.images.length} photo{color.images.length === 1 ? "" : "s"}
                        {color.isDefault ? " · Default" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {selectedColor ? (
              <div className="rounded-2xl bg-brand-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Editing {selectedColor.name || "this colour"}</p>
                    <p className="text-xs text-brand-muted">Photos here show when a customer picks this colour.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.colors.filter((_, i) => i !== activeColor);
                      const hasDefault = next.some((item) => item.isDefault);
                      patch({
                        colors: next.map((item, i) => ({ ...item, isDefault: hasDefault ? item.isDefault : i === 0 })),
                      });
                      setActiveColor(Math.max(0, activeColor - 1));
                    }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove colour
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label>
                    <span className={adminLabel}>Colour name</span>
                    <input
                      className={adminField}
                      placeholder="Beige"
                      value={selectedColor.name}
                      onChange={(event) => patchColor(activeColor, { name: event.target.value })}
                    />
                  </label>
                  <label>
                    <span className={adminLabel}>Swatch</span>
                    <input
                      type="color"
                      className="h-[42px] w-20 cursor-pointer rounded-xl border border-brand-border bg-white p-1"
                      value={selectedColor.hex || "#C4A574"}
                      onChange={(event) => patchColor(activeColor, { hex: event.target.value })}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Toggle
                    checked={selectedColor.isDefault}
                    label="Default colour"
                    onChange={() =>
                      patch({
                        colors: form.colors.map((item, i) => ({ ...item, isDefault: i === activeColor })),
                      })
                    }
                  />
                  <Toggle
                    checked={selectedColor.inStock}
                    label="This colour in stock"
                    onChange={(inStock) => patchColor(activeColor, { inStock })}
                  />
                </div>
                <div className="mt-5">
                  <ImageDropzone
                    images={selectedColor.images}
                    uploading={uploading}
                    emptyLabel="PNG or JPG of this colour. Converted to WebP and named brand-model-colour-01-1200x1200.webp."
                    onUpload={(files) =>
                      uploadFiles(
                        files,
                        (urls) =>
                          patchColor(activeColor, {
                            images: [
                              ...selectedColor.images,
                              ...urls.map((url) => ({ url, alt: `${form.name} ${selectedColor.name}` })),
                            ],
                          }),
                        selectedColor.name,
                      )
                    }
                    onChange={(images) => patchColor(activeColor, { images })}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-8 border-t border-brand-border pt-6">
          <h3 className="text-base font-bold">Shared photos</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Used on catalog cards, and as a fallback if a colour has no photos of its own. For a whole
            series that looks the same, tick those models on All models and drop one photo there.
          </p>
          <div className="mt-4">
            <ImageDropzone
              images={form.images}
              uploading={uploading}
              emptyLabel="PNG or JPG. Converted to WebP 1200×1200 and named with the brand and model. No people."
              onUpload={(files) =>
                uploadFiles(files, (urls) =>
                  patch({
                    images: [...form.images, ...urls.map((url) => ({ url, alt: form.name }))],
                  }),
                )
              }
              onChange={(images) => patch({ images })}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">4. Feature highlights</h2>
            <p className="mt-1 text-sm text-brand-muted">Short bullets on the product page — what it actually does.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal"
            onClick={() => patch({ highlights: [...form.highlights, { title: "", body: "" }] })}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <ul className="mt-5 space-y-3">
          {form.highlights.map((item, index) => (
            <li key={index} className="grid gap-2 rounded-2xl bg-brand-surface p-3 sm:grid-cols-[1fr_2fr_auto]">
              <input
                className={adminField}
                placeholder="Title"
                value={item.title}
                onChange={(event) => {
                  const highlights = [...form.highlights];
                  highlights[index] = { ...item, title: event.target.value };
                  patch({ highlights });
                }}
              />
              <textarea
                className={cn(adminField, "min-h-16 resize-y")}
                placeholder="What it does in real rooms"
                value={item.body}
                onChange={(event) => {
                  const highlights = [...form.highlights];
                  highlights[index] = { ...item, body: event.target.value };
                  patch({ highlights });
                }}
              />
              <button
                type="button"
                className="justify-self-end text-brand-muted hover:text-red-600 sm:mt-2"
                onClick={() => patch({ highlights: form.highlights.filter((_, i) => i !== index) })}
                aria-label="Remove highlight"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 lg:px-8">
          <p className="inline-flex items-center gap-1 text-sm text-brand-muted">
            <Star className="h-3.5 w-3.5" />
            {form.published ? "Will appear on the public catalog" : "Saved as a draft — not on the website"}
          </p>
          <div className="flex flex-wrap gap-2">
            {canDelete ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete model
              </button>
            ) : null}
            <Link
              href="/admin/products"
              className="rounded-full border border-brand-border px-4 py-2.5 text-sm font-semibold hover:bg-brand-surface"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={pending || uploading}
              className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {pending ? "Saving…" : product ? "Save changes" : "Create model"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${form.name || "this model"}?`}
        body="This permanently removes the hearing aid, all colour variants and photos from the catalog."
        pending={pending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </form>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1",
        checked ? "bg-[#E7F7F3] text-brand-teal ring-brand-teal/20" : "bg-white text-brand-muted ring-black/10",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", checked ? "bg-brand-teal" : "bg-brand-border")} />
      {label}
    </button>
  );
}
