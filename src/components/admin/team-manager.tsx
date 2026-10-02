"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

type Member = { id: number; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string };
const empty = { name: "", email: "", password: "", role: "manager" };

export function TeamManager({ members, meId }: { members: Member[]; meId: number }) {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setOk("");
    const res = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json();
    if (!res.ok) return setErr(d.error);
    setOk(`Admin ${f.email} created. Share the password with them securely.`);
    setF(empty);
    router.refresh();
  }
  async function patch(id: number, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) alert((await res.json()).error);
    router.refresh();
  }
  async function resetPassword(id: number) {
    const pw = prompt("Enter a new password for this admin (min 6 chars):");
    if (!pw) return;
    await patch(id, { password: pw });
  }
  async function del(id: number) {
    if (!confirm("Remove this admin? They will lose access immediately.")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (!res.ok) alert((await res.json()).error);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={create} className="card p-6 space-y-4 h-fit">
        <h2 className="font-semibold">Add Admin</h2>
        <div><label className="label">Name</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">Email (login)</label><input required type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label">Password</label><input required minLength={6} type="text" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="min 6 characters" /></div>
        <div><label className="label">Role</label>
          <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option value="owner">Owner</option><option value="manager">Manager</option><option value="staff">Staff (read-only)</option>
          </select>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}
        <button className="btn-primary w-full py-2.5">Create Admin Login</button>
      </form>
      <div className="lg:col-span-2 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
            <tr><th className="px-5 py-3">Admin</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Last login</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {members.map((m) => (
              <tr key={m.id} className={!m.isActive ? "opacity-60" : ""}>
                <td className="px-5 py-3"><p className="font-medium">{m.name} {m.id === meId && <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded ml-1">YOU</span>}</p><p className="text-xs text-neutral-400">{m.email}</p></td>
                <td className="px-5 py-3">
                  <select value={m.role} onChange={(e) => patch(m.id, { role: e.target.value })} className="text-xs border border-neutral-300 rounded px-2 py-1 capitalize bg-white">
                    <option value="owner">owner</option><option value="manager">manager</option><option value="staff">staff</option>
                  </select>
                </td>
                <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{m.isActive ? "Active" : "Disabled"}</span></td>
                <td className="px-5 py-3 text-neutral-500 text-xs">{m.lastLoginAt ? formatDate(m.lastLoginAt) : "Never"}<br /><span className="text-neutral-400">joined {formatDate(m.createdAt)}</span></td>
                <td className="px-5 py-3 text-right text-xs whitespace-nowrap">
                  <button onClick={() => resetPassword(m.id)} className="px-2 py-1 hover:bg-neutral-100 rounded">Reset password</button>
                  <button onClick={() => patch(m.id, { isActive: !m.isActive })} className="px-2 py-1 hover:bg-neutral-100 rounded">{m.isActive ? "Disable" : "Enable"}</button>
                  {m.id !== meId && <button onClick={() => del(m.id)} className="px-2 py-1 hover:bg-red-50 text-red-600 rounded">Remove</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
