"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@vogue.store");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setLoading(false);
    if (res.ok) { router.push("/admin"); router.refresh(); }
    else setErr("Invalid email or password");
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl tracking-[0.2em] text-white">VOGUE ATELIER</Link>
          <p className="text-neutral-400 text-sm mt-2">Admin Console</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in…" : "Sign In"}</button>
          <p className="text-[11px] text-neutral-500 text-center pt-2">First-time login: <code className="bg-neutral-100 px-1 rounded">admin@vogue.store</code> / <code className="bg-neutral-100 px-1 rounded">admin123</code>. Change it under My Account, add more admins under Team &amp; Access.</p>
        </form>
      </div>
    </div>
  );
}
