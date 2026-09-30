import { ClinicForm } from "@/components/admin/ClinicForm";
import { listAdminTeam } from "@/lib/admin-site-cms";

export default async function AdminNewClinicPage() {
  const team = await listAdminTeam();
  return <ClinicForm images={[]} managers={team.map((member) => ({ id: member.id ?? "", name: member.name }))} />;
}
