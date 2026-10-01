import { getAdminSession } from "@/lib/admin";
import { markInAppNotificationsRead } from "@/lib/notifications/bell";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const { data: member, error } = await session.supabase.from("team_members").select("id").eq("auth_user_id", session.user.id).maybeSingle();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  if (!member) return Response.json({ ok: false, error: "Team member not found." }, { status: 404 });
  await markInAppNotificationsRead(session.supabase, String(member.id));
  return Response.json({ ok: true });
}
