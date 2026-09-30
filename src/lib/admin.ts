import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getAdminSession = cache(async (): Promise<{ supabase: SupabaseClient; user: User } | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
});

export const requireAdmin = cache(async (): Promise<{ supabase: SupabaseClient; user: User }> => {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
});
