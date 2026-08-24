import type { Metadata } from "next";
import { Ear } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "CMS login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#07111F] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-16 -top-10 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-sm font-bold">
            <Ear className="h-5 w-5 text-brand-orange" />
            Hearing Hope
          </p>
          <h1 className="mt-10 max-w-sm text-4xl font-bold tracking-tight">
            Catalog for every model, colour and listed MRP.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
            Staff only. Add hearing aids, shell colours and photos — then they render on the public site.
          </p>
        </div>
        <p className="relative text-xs text-white/40">Not indexed. Not linked from the website.</p>
      </div>
      <div className="flex items-center justify-center bg-[#F4F6F8] px-4 py-16">
        <div className="w-full max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Staff only</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-dark">Sign in to the CMS</h2>
          <p className="mt-2 text-sm text-brand-muted">Use the email you created in Supabase Auth.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
