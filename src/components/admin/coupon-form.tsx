"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CouponForm() {
  const router = useRouter();
  const [f, setF] = useState({ code: "", type: "percent", value: "", minOrder: "0" });
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (!res.ok) return setErr((await res.json()).error);
    setF({ code: "", type: "percent", value: "", minOrder: "0" });
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="card p-6 space-y-4 h-fit">
      <h2 className="font-semibold">New Coupon</h2>
      <div><label className="label">Code</label><input required className="input uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" /></div>
      <div><label className="label">Type</label><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">Percentage off</option><option value="fixed">Fixed amount off</option></select></div>
      <div><label className="label">Value</label><input required type="number" step="0.01" min="0" className="input" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></div>
      <div><label className="label">Minimum order ($)</label><input type="number" step="0.01" min="0" className="input" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} /></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary w-full py-2.5">Create Coupon</button>
    </form>
  );
}
