"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [f, setF] = useState({
    store_name: initial.store_name ?? "VOGUE ATELIER",
    announcement: initial.announcement ?? "",
    support_email: initial.support_email ?? "",
  });
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setMsg(res.ok ? "Settings saved." : "Failed to save.");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="card p-6 space-y-5 max-w-2xl">
      <div><label className="label">Store name</label><input className="input" value={f.store_name} onChange={(e) => setF({ ...f, store_name: e.target.value })} /></div>
      <div><label className="label">Announcement bar text</label><input className="input" value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} placeholder="Leave empty to hide" /></div>
      <div><label className="label">Support email</label><input type="email" className="input" value={f.support_email} onChange={(e) => setF({ ...f, support_email: e.target.value })} /></div>
      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4 text-xs text-neutral-600 space-y-1">
        <p className="font-semibold text-neutral-900">Admin credentials</p>
        <p>Admin logins are managed in the panel: change your own under <a href="/admin/account" className="underline">My Account</a>; owners can add/remove admins under <a href="/admin/team" className="underline">Team &amp; Access</a>. <code>ADMIN_EMAIL</code>/<code>ADMIN_PASSWORD</code> env vars only seed the very first owner account.</p>
      </div>
      <div className="flex items-center gap-4"><button className="btn-primary py-2.5">Save Settings</button>{msg && <span className="text-sm text-emerald-600">{msg}</span>}</div>
    </form>
  );
}
