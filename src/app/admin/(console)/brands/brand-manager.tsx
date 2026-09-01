"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveBrand } from "@/app/admin/actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { adminField, adminLabel } from "@/components/admin/ui";
import { slugify } from "@/lib/urls";
import type { CatalogBrand } from "@/types";
import type { CmsBrandProfile } from "@/lib/site-cms/types";

export function BrandManager({
  brands,
  profiles,
}: {
  brands: CatalogBrand[];
  profiles: CmsBrandProfile[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveBrand({
      name,
      slug: slug || slugify(name),
      logoUrl,
      sortOrder: brands.length + 1,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSlug("");
    setLogoUrl("");
    router.refresh();
  }

  async function onUpdate(brand: CatalogBrand, next: Partial<CatalogBrand>) {
    const result = await saveBrand({
      id: brand.id,
      name: next.name ?? brand.name,
      slug: next.slug ?? brand.slug,
      logoUrl: next.logoUrl ?? brand.logoUrl,
      sortOrder: next.sortOrder ?? brand.sortOrder,
    });
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Catalog</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Brands</h1>
      <p className="mt-2 max-w-xl text-sm text-brand-muted">
        Names used on models, plus logo and story copy for public brand pages.
      </p>

      <form onSubmit={onCreate} className="mt-8 grid gap-3 rounded-3xl bg-white p-6 ring-1 ring-black/5 sm:grid-cols-2">
        <label>
          <span className={adminLabel}>Brand name</span>
          <input
            className={adminField}
            required
            placeholder="Signia"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSlug(slugify(event.target.value));
            }}
          />
        </label>
        <label>
          <span className={adminLabel}>Slug</span>
          <input className={adminField} placeholder="signia" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
        <div className="sm:col-span-2">
          <CmsImageField label="Logo" folder="brands" value={logoUrl} onChange={setLogoUrl} />
        </div>
        <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white sm:col-span-2">
          {pending ? "Adding…" : "Add brand"}
        </button>
        {error ? <p className="text-sm text-brand-orange sm:col-span-2">{error}</p> : null}
      </form>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {brands.map((brand) => {
          const profile = profiles.find((item) => item.slug === brand.slug);
          return (
            <li key={brand.id} className="rounded-3xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-brand-surface px-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logoUrl} alt="" className="max-h-8 w-auto object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    className={adminField}
                    defaultValue={brand.name}
                    onBlur={(event) => {
                      if (event.target.value !== brand.name) onUpdate(brand, { name: event.target.value });
                    }}
                  />
                  <p className="mt-1 text-[11px] text-brand-muted">{brand.slug}</p>
                </div>
              </div>
              <div className="mt-3">
                <CmsImageField
                  label="Logo"
                  folder="brands"
                  value={brand.logoUrl}
                  onChange={(nextLogo) => void onUpdate(brand, { logoUrl: nextLogo })}
                />
              </div>
              <Link
                href={`/admin/brands/${brand.id}`}
                className="mt-3 inline-flex text-sm font-semibold text-brand-teal"
              >
                {profile?.intro ? "Edit story and logo" : "Add story copy"}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
