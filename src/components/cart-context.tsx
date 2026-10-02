"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

type CartCtx = {
  items: CartItem[];
  wishlist: number[];
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  update: (key: string, qty: number) => void;
  clear: () => void;
  toggleWishlist: (id: number) => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  hydrated: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("vogue_cart");
      const w = localStorage.getItem("vogue_wishlist");
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("vogue_cart", JSON.stringify(items));
  }, [items, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("vogue_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const add: CartCtx["add"] = (item) => {
      const key = `${item.productId}-${item.size}-${item.color}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(i.stock, i.quantity + item.quantity) } : i
          );
        }
        return [...prev, { ...item, key }];
      });
      setOpen(true);
    };
    return {
      items,
      wishlist,
      add,
      remove: (key) => setItems((p) => p.filter((i) => i.key !== key)),
      update: (key, qty) =>
        setItems((p) =>
          qty <= 0 ? p.filter((i) => i.key !== key) : p.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.stock, qty) } : i))
        ),
      clear: () => setItems([]),
      toggleWishlist: (id) =>
        setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price, 0),
      open,
      setOpen,
      hydrated,
    };
  }, [items, wishlist, open, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
