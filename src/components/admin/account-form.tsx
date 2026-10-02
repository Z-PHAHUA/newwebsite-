"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";

export function AdminAccountForm({ admin }: { admin: AdminSession }) {
  const router = useRouter();
  const [p, setP] = useState({ name: admin.name, email: admin.email });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg1, setMsg1] = useState<{ ok: boolean; t: string } | null>(null);
  const [msg2, setMsg2] = useState<{ ok: boolean; t: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    const d = await res.json();
    setMsg1(res.ok ? { ok: true, t: "Profile updated." } : { ok: false, t: d.error });
    router.refresh();
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setMsg2({ ok: false, t: "Passwords do not match" });
    const res = await fetch("/api/admin/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }) });
    const d = await res.json();
    setMsg2(res.ok ? { ok: true, t: "Password changed." } : { ok: false, t: d.error });
    if (res.ok) setPw({ currentPassword: "", newPassword: "", confirm: "" });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="font-semibold">Login details</h2>
        <div><label className="label">Name</label><input required className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
        <div><label className="label">Login email</label><input required type="email" className="input" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></div>
        {msg1 && <p className={`text-sm ${msg1.ok ? "text-emerald-600" : "text-red-600"}`}>{msg1.t}</p>}
        <button className="btn-primary py-2.5">Save</button>
      </form>
      <form onSubmit={savePassword} className="card p-6 space-y-4">
        <h2 className="font-semibold">Change password</h2>
        <div><label className="label">Current password</label><input required type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
        <div><label className="label">New password</label><input required minLength={6} type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
        <div><label className="label">Confirm new password</label><input required minLength={6} type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        {msg2 && <p className={`text-sm ${msg2.ok ? "text-emerald-600" : "text-red-600"}`}>{msg2.t}</p>}
        <button className="btn-primary py-2.5">Update Password</button>
      </form>
    </div>
  );
}
