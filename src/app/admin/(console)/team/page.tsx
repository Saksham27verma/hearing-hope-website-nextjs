import Link from "next/link";
import { listAdminTeam } from "@/lib/admin-site-cms";

export default async function AdminTeamPage() {
  const members = await listAdminTeam();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">About</p>
          <h1 className="mt-2 text-3xl font-bold">Team</h1>
        </div>
        <Link href="/admin/team/new" className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white">
          Add person
        </Link>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <li key={member.id ?? member.slug}>
            <Link
              href={`/admin/team/${member.id || member.slug}`}
              className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-black/5 hover:ring-brand-orange/40"
            >
              <span className="block font-bold text-brand-dark">
                {member.honorific} {member.name}
              </span>
              <span className="text-sm text-brand-muted">{member.role}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
