"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?sort=newest", label: "New In" },
  { href: "/shop?category=jackets", label: "Outerwear" },
  { href: "/sale", label: "Sale", accent: true },
];

export function Header({ announcement, storeName, user }: { announcement?: string; storeName: string; user: { name: string } | null }) {
  const { count, setOpen, wishlist, hydrated } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
      {announcement && (
        <div className="bg-neutral-900 text-white text-center text-xs tracking-wide py-2 px-4">
          {announcement}
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMenu(!menu)} aria-label="Menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h16M3 11h16M3 16h16" /></svg>
          </button>
          <Link href="/" className="font-serif text-2xl tracking-[0.2em] font-semibold">
            {storeName}
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "hover:text-neutral-500 transition-colors",
                  n.accent && "text-red-600",
                  pathname === n.href.split("?")[0] && !n.href.includes("?") && "underline underline-offset-8"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={() => setSearch(!search)} className="p-2 hover:text-neutral-500" aria-label="Search">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="6" /><path d="M14 14l4 4" /></svg>
            </button>
            <Link href="/wishlist" className="p-2 hover:text-neutral-500 relative" aria-label="Wishlist">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
              {hydrated && wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>
              )}
            </Link>
            <Link href={user ? "/account" : "/login"} className="p-2 hover:text-neutral-500 flex items-center gap-1.5" aria-label="Account" title={user ? `Signed in as ${user.name}` : "Sign in"}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
              <span className="hidden md:inline text-xs font-medium max-w-24 truncate">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <button onClick={() => setOpen(true)} className="p-2 hover:text-neutral-500 relative" aria-label="Cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 7h12l1 13H5L6 7zM9 7a3 3 0 0 1 6 0" /></svg>
              {hydrated && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
              )}
            </button>
          </div>
        </div>
        {search && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(false);
              router.push(`/shop?q=${encodeURIComponent(q)}`);
            }}
            className="pb-4"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for dresses, jackets, denim..."
              className="w-full border-b border-neutral-900 py-2 text-lg outline-none bg-transparent"
            />
          </form>
        )}
      </div>
      {menu && (
        <div className="lg:hidden border-t border-neutral-200 bg-white">
          <nav className="flex flex-col px-4 py-3">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className={cn("py-3 border-b border-neutral-100 text-sm font-medium", n.accent && "text-red-600")}>
                {n.label}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setMenu(false)} className="py-3 border-b border-neutral-100 text-sm font-medium">Track Order</Link>
            <Link href={user ? "/account" : "/login"} onClick={() => setMenu(false)} className="py-3 text-sm font-medium">{user ? "My Account" : "Sign In / Register"}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
