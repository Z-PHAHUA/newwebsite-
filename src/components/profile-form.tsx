"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type P = { name: string; phone: string; address: string; city: string; postalCode: string; country: string };

export function ProfileForm({ initial, email }: { initial: P; email: string }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const set = (k: keyof P) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setMsg(res.ok ? "Profile saved." : "Failed to save.");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="card p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
      <div className="sm:col-span-2"><label className="label">Email</label><input disabled className="input bg-neutral-50" value={email} /></div>
      <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={set("name")} /></div>
      <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div>
      <div className="sm:col-span-2"><label className="label">Street address</label><input className="input" value={f.address} onChange={set("address")} /></div>
      <div><label className="label">City</label><input className="input" value={f.city} onChange={set("city")} /></div>
      <div><label className="label">Postal code</label><input className="input" value={f.postalCode} onChange={set("postalCode")} /></div>
      <div className="sm:col-span-2"><label className="label">Country</label>
        <select className="input" value={f.country} onChange={set("country")}>
          {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Pakistan", "United Arab Emirates", "Other"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2 flex items-center gap-4"><button className="btn-primary py-2.5">Save</button>{msg && <span className="text-sm text-emerald-600">{msg}</span>}</div>
    </form>
  );
}
