"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const reason = sp.get("reason");
  const supabaseEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const oauthError = sp.get("error");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Something went wrong");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.pexels.com/photos/31046837/pexels-photo-31046837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-sm">
          <p className="text-xs tracking-[0.3em] uppercase mb-3">Members</p>
          <h2 className="font-serif text-4xl leading-tight">Faster checkout, order tracking, and early access to drops.</h2>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-4xl mb-2">{mode === "login" ? "Welcome back" : "Create account"}</h1>
            <p className="text-sm text-neutral-500">{mode === "login" ? "Sign in to your account to continue." : "Join VOGUE ATELIER — it only takes a minute."}</p>
          </div>
          {reason === "checkout" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
              🔒 Please {mode === "login" ? "sign in" : "create an account"} to complete your purchase. Your bag is saved.
            </div>
          )}
          {oauthError && <p className="text-sm text-red-600">{oauthError}</p>}
          {mode === "register" && (
            <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          )}
          <div><label className="label">Email</label><input required type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input required type="password" minLength={6} className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}</button>
          <p className="text-sm text-center text-neutral-500">
            {mode === "login" ? (
              <>New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline text-neutral-900">Create an account</Link></>
            ) : (
              <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline text-neutral-900">Sign in</Link></>
            )}
          </p>
          {supabaseEnabled && (
            <>
              <div className="flex items-center gap-3 text-xs text-neutral-400"><span className="flex-1 h-px bg-neutral-200" />or<span className="flex-1 h-px bg-neutral-200" /></div>
              <a href={`/api/auth/oauth?provider=google&next=${encodeURIComponent(next)}`} className="btn-outline w-full">Continue with Google</a>
              <p className="text-[11px] text-center text-neutral-400">Secured by Supabase Auth</p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
