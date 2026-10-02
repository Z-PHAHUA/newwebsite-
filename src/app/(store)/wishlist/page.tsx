"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { ProductCard } from "@/components/product-card";
import type { ProductListItem } from "@/lib/data";

export default function WishlistPage() {
  const { wishlist, hydrated } = useCart();
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (wishlist.length === 0) { setItems([]); setLoading(false); return; }
    fetch(`/api/products?ids=${wishlist.join(",")}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [wishlist, hydrated]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl mb-10">Wishlist</h1>
      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-neutral-500 mb-6">Nothing saved yet. Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
