"use client";

import { useState } from "react";

export function PasswordForm({ requireCurrent }: { requireCurrent: boolean }) {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.next !== f.confirm) return setMsg({ ok: false, text: "Passwords do not match" });
    const res = await fetch("/api/auth/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json();
    setMsg(res.ok ? { ok: true, text: "Password updated." } : { ok: false, text: d.error });
    if (res.ok) setF({ current: "", next: "", confirm: "" });
  }
  return (
    <form onSubmit={submit} className="card p-6 space-y-4 max-w-md">
      {requireCurrent && <div><label className="label">Current password</label><input required type="password" className="input" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></div>}
      <div><label className="label">New password</label><input required minLength={6} type="password" className="input" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></div>
      <div><label className="label">Confirm new password</label><input required minLength={6} type="password" className="input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></div>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}
      <button className="btn-primary py-2.5">Update Password</button>
    </form>
  );
}
