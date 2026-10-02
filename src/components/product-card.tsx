"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data";

export function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5 9 9z" />
        </svg>
      ))}
    </span>
  );
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const { add, wishlist, toggleWishlist, hydrated } = useCart();
  const price = Number(product.price);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = compare ? Math.round(((compare - price) / compare) * 100) : 0;
  const wished = hydrated && wishlist.includes(product.id);
  const img = product.images[0] ?? "";
  const hover = product.images[1];

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={product.name} className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${hover ? "group-hover:opacity-0" : ""}`} loading="lazy" />
        {hover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 transition duration-700 group-hover:opacity-100 group-hover:scale-105" loading="lazy" />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="badge bg-red-600 text-white">-{discount}%</span>}
          {product.tags?.includes("new") && <span className="badge bg-white text-neutral-900">New</span>}
          {product.stock === 0 && <span className="badge bg-neutral-900 text-white">Sold out</span>}
        </div>
        {product.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              add({ productId: product.id, name: product.name, slug: product.slug, price, image: img, size: product.sizes[0] ?? "One Size", color: product.colors[0] ?? "Default", quantity: 1, stock: product.stock });
            }}
            className="absolute bottom-3 left-3 right-3 bg-white/95 text-neutral-900 text-xs font-semibold tracking-wide uppercase py-3 rounded-md translate-y-16 group-hover:translate-y-0 transition duration-300 hover:bg-neutral-900 hover:text-white"
          >
            Quick Add
          </button>
        )}
      </Link>
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition"
        aria-label="Wishlist"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "currentColor"} strokeWidth="1.8">
          <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
      </button>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">{product.categoryName}</p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-medium hover:underline line-clamp-1">{product.name}</Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(price)}</span>
          {compare && <span className="text-xs text-neutral-400 line-through">{formatPrice(compare)}</span>}
        </div>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-[11px] text-neutral-500">({product.reviewCount})</span>
          </div>
        )}
        {product.colors.length > 1 && (
          <p className="text-[11px] text-neutral-500">{product.colors.length} colours</p>
        )}
      </div>
    </div>
  );
}
