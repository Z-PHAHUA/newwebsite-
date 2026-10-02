"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useUser, checkoutHref } from "@/components/user-context";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/utils";

export default function CartPage() {
  const { items, update, remove, subtotal, hydrated } = useCart();
  const user = useUser();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;

  if (!hydrated) return <div className="py-32 text-center text-neutral-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl mb-10">Shopping Bag</h1>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-neutral-500 mb-6">Your bag is empty.</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="divide-y divide-neutral-200">
            {items.map((i) => (
              <div key={i.key} className="py-6 flex gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt={i.name} className="w-28 h-36 object-cover rounded-md bg-neutral-100" />
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${i.slug}`} className="font-medium hover:underline">{i.name}</Link>
                      <p className="text-sm text-neutral-500 mt-1">Size: {i.size} · Colour: {i.color}</p>
                      <p className="text-sm mt-1">{formatPrice(i.price)}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-neutral-300 rounded-md">
                      <button onClick={() => update(i.key, i.quantity - 1)} className="px-3 py-1.5 hover:bg-neutral-100">−</button>
                      <span className="px-3 text-sm">{i.quantity}</span>
                      <button onClick={() => update(i.key, i.quantity + 1)} className="px-3 py-1.5 hover:bg-neutral-100">+</button>
                    </div>
                    <button onClick={() => remove(i.key)} className="text-xs text-neutral-500 underline hover:text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="card p-6 h-fit sticky top-28">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-neutral-200"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
            </div>
            <Link href={checkoutHref(user)} className="btn-primary w-full mt-6">{user ? "Proceed to Checkout" : "Sign in to Checkout"}</Link>
            {!user && <p className="text-xs text-neutral-500 text-center mt-3">An account is required to place an order. <Link href="/register?next=%2Fcheckout" className="underline">Create one</Link> in seconds.</p>}
            <Link href="/shop" className="block text-center text-xs underline mt-4 text-neutral-500">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
