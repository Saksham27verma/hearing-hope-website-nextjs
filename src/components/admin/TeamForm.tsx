"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTeamMember, saveTeamMember } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { adminField, adminLabel } from "@/components/admin/ui";
import { TeamPortrait } from "@/components/about/TeamPortrait";
import type { CmsTeamMember } from "@/lib/site-cms/types";
import { slugify } from "@/lib/urls";

export function TeamForm({ member }: { member?: CmsTeamMember }) {
  const router = useRouter();
  const [form, setForm] = useState({
    honorific: member?.honorific ?? "",
    name: member?.name ?? "",
    slug: member?.slug ?? "",
    role: member?.role ?? "",
    credentials: member?.credentials ?? "",
    bio: member?.bio ?? "",
    image: member?.image ?? "",
    featured: Boolean(member?.featured),
    published: member?.published ?? true,
    sortOrder: member?.sortOrder ?? 1,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await saveTeamMember({ ...form, id: member?.id });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/team");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Team</p>
        <h1 className="mt-2 text-3xl font-bold">{member ? "Edit person" : "Add person"}</h1>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5 sm:grid-cols-2">
        <label>
          <span className={adminLabel}>Honorific</span>
          <input className={adminField} value={form.honorific} onChange={(e) => setForm({ ...form, honorific: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Name</span>
          <input className={adminField} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </label>
        <label>
          <span className={adminLabel}>Role</span>
          <input className={adminField} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Credentials</span>
          <input className={adminField} value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={adminLabel}>Bio</span>
          <textarea className={adminField} rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured
        </label>
        <div className="sm:col-span-2">
          <CmsImageField label="Portrait" folder="team" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        </div>
      </div>
      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Portrait preview</h2>
        <p className="mt-1 text-sm text-brand-muted">How this person appears on the About page.</p>
        <div className="mt-4 max-w-xs overflow-hidden rounded-[1.75rem] ring-1 ring-black/5">
          <TeamPortrait src={form.image} name={form.name || "Team member"} className="aspect-4/5 w-full" rounded="rounded-none" />
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">{form.role || "Role"}</p>
            <p className="mt-1 font-bold text-brand-dark">{[form.honorific, form.name].filter(Boolean).join(" ") || "Name"}</p>
          </div>
        </div>
      </section>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white">
          {pending ? "Saving…" : "Save"}
        </button>
        {member?.id ? (
          <button type="button" className="rounded-full px-6 py-3 text-sm font-semibold text-red-600" onClick={async () => { await deleteTeamMember(member.id as string); router.push("/admin/team"); }}>
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
