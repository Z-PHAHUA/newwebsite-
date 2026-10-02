"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer({ storeName, supportEmail }: { storeName: string; supportEmail?: string }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setMsg(res.ok ? "Thanks — you're on the list! Use WELCOME10 at checkout." : data.error ?? "Something went wrong");
    if (res.ok) setEmail("");
  }

  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="font-serif text-2xl tracking-[0.2em] text-white">{storeName}</h3>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            Considered clothing for modern life. Designed in small batches, made to be worn for years.
          </p>
          <div className="flex gap-4 mt-6">
            {["instagram", "tiktok", "pinterest"].map((s) => (
              <span key={s} className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center text-xs uppercase hover:border-white cursor-pointer">{s[0]}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/shop?gender=women" className="hover:text-white">Women</Link></li>
            <li><Link href="/shop?gender=men" className="hover:text-white">Men</Link></li>
            <li><Link href="/shop?sort=newest" className="hover:text-white">New Arrivals</Link></li>
            <li><Link href="/sale" className="hover:text-white">Sale</Link></li>
            <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/account" className="hover:text-white">My Account</Link></li>
            <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-white">Shipping & Returns</Link></li>
            <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Newsletter</h4>
          <p className="text-sm text-neutral-400 mb-4">Get 10% off your first order and early access to drops.</p>
          <form onSubmit={subscribe} className="flex">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white outline-none focus:border-white rounded-l-md"
            />
            <button className="bg-white text-neutral-900 px-4 text-sm font-semibold rounded-r-md hover:bg-neutral-200">Join</button>
          </form>
          {msg && <p className="mt-2 text-xs text-emerald-400">{msg}</p>}
          {supportEmail && <p className="mt-6 text-xs text-neutral-500">Support: {supportEmail}</p>}
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex gap-2">
            {["VISA", "MC", "AMEX", "PAYPAL", "COD"].map((p) => (
              <span key={p} className="border border-neutral-700 rounded px-2 py-1 text-[10px] font-semibold">{p}</span>
            ))}
          </div>
          <Link href="/admin" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
