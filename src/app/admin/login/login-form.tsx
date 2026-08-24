"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { adminField, adminLabel } from "@/components/admin/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm leading-6 text-brand-muted ring-1 ring-black/5">
        <p className="font-semibold text-brand-dark">Supabase is not connected yet.</p>
        <ol className="mt-3 list-decimal space-y-1 pl-4">
          <li>
            Copy <code className="rounded bg-brand-surface px-1">.env.example</code> to{" "}
            <code className="rounded bg-brand-surface px-1">.env.local</code>
          </li>
          <li>Paste your project URL and anon key</li>
          <li>
            Run the SQL in <code className="rounded bg-brand-surface px-1">supabase/migrations</code>
          </li>
          <li>Create an Auth user, then restart the dev server</li>
        </ol>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <div>
        <label htmlFor="admin-email" className={adminLabel}>
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={adminField}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className={adminLabel}>
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={adminField}
        />
      </div>
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-orange py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
