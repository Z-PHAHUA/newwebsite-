"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch(`/api/orders/track?number=${encodeURIComponent(number.trim())}&email=${encodeURIComponent(email.trim())}`);
    setLoading(false);
    if (res.ok) router.push(`/order/${number.trim().toUpperCase()}`);
    else setErr("We couldn't find an order with those details.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-4xl mb-2 text-center">Track Your Order</h1>
      <p className="text-neutral-500 text-sm text-center mb-10">Enter your order number and email to see the latest status.</p>
      <form onSubmit={submit} className="card p-8 space-y-4">
        <div><label className="label">Order number</label><input required className="input" placeholder="VA-XXXXXX" value={number} onChange={(e) => setNumber(e.target.value)} /></div>
        <div><label className="label">Email</label><input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Searching…" : "Track Order"}</button>
      </form>
    </div>
  );
}
