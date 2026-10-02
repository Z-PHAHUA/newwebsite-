"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { useUser, checkoutHref } from "./user-context";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotal } = useCart();
  const user = useUser();
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <h2 className="font-serif text-xl">Your Bag ({items.length})</h2>
          <button onClick={() => setOpen(false)} className="p-1 hover:text-neutral-500" aria-label="Close">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5l12 12M17 5L5 17" /></svg>
          </button>
        </div>
        {remaining > 0 ? (
          <div className="px-6 py-3 bg-neutral-50 text-xs text-neutral-600">
            Add <strong>{formatPrice(remaining)}</strong> more for free shipping
            <div className="mt-2 h-1 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-900" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="px-6 py-3 bg-emerald-50 text-xs text-emerald-700 font-medium">🎉 You unlocked free shipping!</div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-500 mb-6">Your bag is empty.</p>
              <Link href="/shop" onClick={() => setOpen(false)} className="btn-primary">Start Shopping</Link>
            </div>
          )}
          {items.map((i) => (
            <div key={i.key} className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt={i.name} className="w-20 h-24 object-cover rounded-md bg-neutral-100" />
              <div className="flex-1 min-w-0">
                <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="text-sm font-medium line-clamp-2 hover:underline">{i.name}</Link>
                <p className="text-xs text-neutral-500 mt-1">{i.size} · {i.color}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-neutral-300 rounded-md">
                    <button onClick={() => update(i.key, i.quantity - 1)} className="px-2.5 py-1 hover:bg-neutral-100">−</button>
                    <span className="px-2 text-sm">{i.quantity}</span>
                    <button onClick={() => update(i.key, i.quantity + 1)} className="px-2.5 py-1 hover:bg-neutral-100">+</button>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(i.key)} className="text-neutral-400 hover:text-red-500 self-start" aria-label="Remove">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13" /></svg>
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-neutral-500">Shipping and discounts calculated at checkout.</p>
            <Link href={checkoutHref(user)} onClick={() => setOpen(false)} className="btn-primary w-full text-center block">{user ? "Checkout" : "Sign in to Checkout"}</Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="btn-outline w-full text-center block">View Bag</Link>
          </div>
        )}
      </aside>
    </>
  );
}
