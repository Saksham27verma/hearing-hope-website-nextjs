import { notFound } from "next/navigation";
import { TeamForm } from "@/components/admin/TeamForm";
import { getAdminTeamMember } from "@/lib/admin-site-cms";

export default async function AdminEditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getAdminTeamMember(id);
  if (!member) notFound();
  return <TeamForm member={member} />;
}
