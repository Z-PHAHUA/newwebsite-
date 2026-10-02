"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { useUser, checkoutHref } from "@/components/user-context";
import { Stars } from "@/components/product-card";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { getProductBySlug } from "@/lib/data";

type P = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export function ProductDetails({ product }: { product: P }) {
  const { add, wishlist, toggleWishlist, hydrated } = useCart();
  const router = useRouter();
  const user = useUser();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"details" | "shipping" | "reviews">("details");
  const [review, setReview] = useState({ authorName: "", rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  const price = Number(product.price);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const wished = hydrated && wishlist.includes(product.id);

  function addToBag(buyNow = false) {
    if (product.sizes.length && !size) return setErr("Please select a size");
    setErr("");
    add({ productId: product.id, name: product.name, slug: product.slug, price, image: product.images[0] ?? "", size: size || "One Size", color: color || "Default", quantity: qty, stock: product.stock });
    if (buyNow) router.push(checkoutHref(user));
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...review, productId: product.id }) });
    if (res.ok) {
      setReviewMsg("Thanks for your review!");
      setReview({ authorName: "", rating: 5, comment: "" });
      router.refresh();
    } else setReviewMsg("Could not submit review.");
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="flex gap-4">
        {product.images.length > 1 && (
          <div className="hidden sm:flex flex-col gap-3 w-20">
            {product.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" onClick={() => setImg(i)} className={cn("aspect-[3/4] object-cover rounded-md cursor-pointer border-2", i === img ? "border-neutral-900" : "border-transparent")} />
            ))}
          </div>
        )}
        <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[img]} alt={product.name} className="w-full h-full object-cover" />
          {compare && <span className="absolute top-4 left-4 badge bg-red-600 text-white">Save {Math.round(((compare - price) / compare) * 100)}%</span>}
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">{product.categoryName}</p>
        <h1 className="font-serif text-4xl mb-3">{product.name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <Stars rating={product.rating} size={14} />
          <button onClick={() => setTab("reviews")} className="text-xs text-neutral-500 underline">{product.reviewCount} reviews</button>
        </div>
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-semibold">{formatPrice(price)}</span>
          {compare && <span className="text-neutral-400 line-through">{formatPrice(compare)}</span>}
        </div>
        <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>

        {product.colors.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Colour: <span className="font-normal text-neutral-500">{color}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={cn("px-4 py-2 text-xs rounded-md border", c === color ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-900")}>{c}</button>
              ))}
            </div>
          </div>
        )}
        {product.sizes.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider">Size{size && <span className="font-normal text-neutral-500">: {size}</span>}</p>
              <a href="/size-guide" className="text-xs underline text-neutral-500">Size guide</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={cn("min-w-12 px-3 py-2.5 text-sm rounded-md border", s === size ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-900")}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

        <div className="flex gap-3 mb-3">
          <div className="flex items-center border border-neutral-300 rounded-md">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-neutral-100">−</button>
            <span className="px-3 text-sm w-10 text-center">{qty}</span>
            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 hover:bg-neutral-100">+</button>
          </div>
          <button onClick={() => addToBag()} disabled={product.stock === 0} className="btn-primary flex-1">
            {product.stock === 0 ? "Sold Out" : "Add to Bag"}
          </button>
          <button onClick={() => toggleWishlist(product.id)} className="w-12 border border-neutral-300 rounded-md flex items-center justify-center hover:border-neutral-900" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "currentColor"} strokeWidth="1.8"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
          </button>
        </div>
        {product.stock > 0 && <button onClick={() => addToBag(true)} className="btn-outline w-full mb-4">Buy It Now</button>}
        <p className="text-xs text-neutral-500">
          {product.stock === 0 ? "Currently out of stock" : product.stock <= 5 ? `🔥 Only ${product.stock} left in stock` : "✓ In stock, ships within 24h"}
        </p>

        {/* Tabs */}
        <div className="mt-10 border-t border-neutral-200">
          <div className="flex gap-6 text-sm border-b border-neutral-200">
            {(["details", "shipping", "reviews"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("py-3 capitalize -mb-px border-b-2", tab === t ? "border-neutral-900 font-semibold" : "border-transparent text-neutral-500")}>
                {t}{t === "reviews" && ` (${product.reviewCount})`}
              </button>
            ))}
          </div>
          <div className="py-6 text-sm text-neutral-600 leading-relaxed">
            {tab === "details" && (
              <ul className="space-y-2">
                <li>• Premium quality fabric, ethically produced</li>
                <li>• Available sizes: {product.sizes.join(", ") || "One size"}</li>
                <li>• Colours: {product.colors.join(", ")}</li>
                <li>• Machine wash cold, hang dry</li>
                <li>• SKU: VA-{String(product.id).padStart(5, "0")}</li>
              </ul>
            )}
            {tab === "shipping" && (
              <ul className="space-y-2">
                <li>• Free standard shipping over $100 (3–5 business days)</li>
                <li>• Express delivery available at checkout</li>
                <li>• 30-day free returns and exchanges</li>
                <li>• Cash on delivery available</li>
              </ul>
            )}
            {tab === "reviews" && (
              <div className="space-y-6">
                {product.reviews.length === 0 && <p>No reviews yet. Be the first!</p>}
                {product.reviews.map((r) => (
                  <div key={r.id} className="border-b border-neutral-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-neutral-900">{r.authorName}</p>
                      <span className="text-xs text-neutral-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p className="mt-2">{r.comment}</p>
                  </div>
                ))}
                <form onSubmit={submitReview} className="space-y-3 pt-2">
                  <p className="font-semibold text-neutral-900">Write a review</p>
                  <input required value={review.authorName} onChange={(e) => setReview({ ...review, authorName: e.target.value })} placeholder="Your name" className="input" />
                  <select value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })} className="input">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                  <textarea required value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="Share your thoughts..." rows={3} className="input" />
                  <button className="btn-primary py-2.5">Submit Review</button>
                  {reviewMsg && <p className="text-emerald-600">{reviewMsg}</p>}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
