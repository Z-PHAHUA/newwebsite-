"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/utils";

export function CheckoutForm() {
  const { items, subtotal, clear, hydrated } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", address: "", city: "", postalCode: "", country: "United States", notes: "", paymentMethod: "card" });
  const [user, setUser] = useState<{ name: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) return;
      setUser(d.user);
      const p = d.profile ?? {};
      setForm((f) => ({ ...f, customerName: p.name || d.user.name || f.customerName, customerEmail: d.user.email || f.customerEmail, customerPhone: p.phone || f.customerPhone, address: p.address || f.address, city: p.city || f.city, postalCode: p.postalCode || f.postalCode, country: p.country || f.country }));
    }).catch(() => {});
  }, []);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponInput, subtotal }) });
    const data = await res.json();
    if (res.ok) { setCoupon({ code: data.code, discount: data.discount }); setCouponMsg(`Coupon applied: -${formatPrice(data.discount)}`); }
    else { setCoupon(null); setCouponMsg(data.error); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.paymentMethod === "card" && card.number.replace(/\s/g, "").length < 12) return setError("Please enter a valid card number (demo: any 16 digits).");
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, couponCode: coupon?.code, items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })) }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 401) { router.push("/login?next=%2Fcheckout&reason=checkout"); return; }
    if (!res.ok) return setError(data.error ?? "Could not place order");
    clear();
    router.push(`/order/${data.orderNumber}`);
  }

  if (!hydrated) return <div className="py-32 text-center text-neutral-400">Loading…</div>;
  if (items.length === 0)
    return (
      <div className="py-32 text-center">
        <p className="text-neutral-500 mb-6">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary">Go Shopping</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl mb-2">Checkout</h1>
      <p className="text-sm text-neutral-500 mb-10">
        {user ? <>Signed in as <strong>{user.name}</strong> — details pre-filled from your profile.</> : <>Have an account? <Link href="/login?next=/checkout" className="underline text-neutral-900">Sign in</Link> for faster checkout.</>}
      </p>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_420px] gap-12">
        <div className="space-y-10">
          <section>
            <h2 className="font-semibold text-lg mb-4">1. Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="label">Full name</label><input required className="input" value={form.customerName} onChange={set("customerName")} /></div>
              <div><label className="label">Email</label><input required type="email" className="input" value={form.customerEmail} onChange={set("customerEmail")} /></div>
              <div><label className="label">Phone</label><input className="input" value={form.customerPhone} onChange={set("customerPhone")} /></div>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-4">2. Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="label">Street address</label><input required className="input" value={form.address} onChange={set("address")} /></div>
              <div><label className="label">City</label><input required className="input" value={form.city} onChange={set("city")} /></div>
              <div><label className="label">Postal code</label><input required className="input" value={form.postalCode} onChange={set("postalCode")} /></div>
              <div className="sm:col-span-2">
                <label className="label">Country</label>
                <select className="input" value={form.country} onChange={set("country")}>
                  {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Pakistan", "United Arab Emirates", "Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className="label">Order notes (optional)</label><textarea className="input" rows={2} value={form.notes} onChange={set("notes")} /></div>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-4">3. Payment</h2>
            <div className="space-y-3">
              {[
                ["card", "Credit / Debit Card", "Visa, Mastercard, Amex"],
                ["paypal", "PayPal", "You'll be redirected (demo)"],
                ["cod", "Cash on Delivery", "Pay when your order arrives"],
              ].map(([v, t, d]) => (
                <label key={v} className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer ${form.paymentMethod === v ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"}`}>
                  <input type="radio" name="pm" value={v} checked={form.paymentMethod === v} onChange={set("paymentMethod")} className="accent-neutral-900" />
                  <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-neutral-500">{d}</p></div>
                </label>
              ))}
              {form.paymentMethod === "card" && (
                <div className="grid grid-cols-2 gap-4 border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                  <div className="col-span-2"><label className="label">Card number</label><input className="input" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
                  <div><label className="label">Expiry</label><input className="input" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
                  <div><label className="label">CVC</label><input className="input" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
                  <p className="col-span-2 text-[11px] text-neutral-500">Demo checkout — no real payment is processed.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-28">
          <h2 className="font-semibold mb-4">Your Order</h2>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.key} className="flex gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" className="w-14 h-18 object-cover rounded bg-neutral-100" />
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{i.name}</p>
                  <p className="text-xs text-neutral-500">{i.size} · {i.color} · ×{i.quantity}</p>
                </div>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code" className="input" />
            <button type="button" onClick={applyCoupon} className="btn-outline px-4 py-2 text-xs">Apply</button>
          </div>
          {couponMsg && <p className={`text-xs mt-2 ${coupon ? "text-emerald-600" : "text-red-600"}`}>{couponMsg}</p>}
          <div className="space-y-2 text-sm mt-5 pt-5 border-t border-neutral-200">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-semibold text-lg pt-3 border-t border-neutral-200"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          <button disabled={loading} className="btn-primary w-full mt-6">{loading ? "Placing order…" : `Place Order · ${formatPrice(total)}`}</button>
          <p className="text-[11px] text-neutral-500 text-center mt-3">🔒 Secure checkout · 30-day returns</p>
        </aside>
      </form>
    </div>
  );
}
