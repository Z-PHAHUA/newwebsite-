"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 grid md:grid-cols-2 gap-16">
      <div>
        <h1 className="font-serif text-5xl mb-4">Get in touch</h1>
        <p className="text-neutral-600 mb-10">Questions about an order, sizing, or anything else? We usually reply within a few hours.</p>
        <div className="space-y-6 text-sm">
          <div><p className="font-semibold">Email</p><p className="text-neutral-600">hello@vogueatelier.com</p></div>
          <div><p className="font-semibold">Phone</p><p className="text-neutral-600">+1 (555) 012-3456 · Mon–Fri, 9am–6pm EST</p></div>
          <div><p className="font-semibold">Flagship Store</p><p className="text-neutral-600">128 Mercer Street, SoHo<br />New York, NY 10012</p></div>
        </div>
      </div>
      <form onSubmit={submit} className="card p-8 space-y-4">
        <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div><label className="label">Message</label><textarea required rows={5} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        <button disabled={status === "sending"} className="btn-primary w-full">{status === "sending" ? "Sending…" : "Send Message"}</button>
        {status === "sent" && <p className="text-sm text-emerald-600">Message sent! We&apos;ll get back to you soon.</p>}
        {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
}
