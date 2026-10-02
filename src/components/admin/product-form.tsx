"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/db/schema";

type Props = { product?: Product; categories: Category[] };

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [f, setF] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    compareAtPrice: product?.compareAtPrice ?? "",
    categoryId: product?.categoryId?.toString() ?? "",
    images: product?.images.join("\n") ?? "",
    sizes: product?.sizes.join(", ") ?? "S, M, L, XL",
    colors: product?.colors.join(", ") ?? "",
    tags: product?.tags.join(", ") ?? "",
    stock: product?.stock?.toString() ?? "10",
    gender: product?.gender ?? "unisex",
    featured: product?.featured ?? false,
    isActive: product?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const body = { ...f, images: f.images.split(/\n|,/).map((s) => s.trim()).filter(Boolean) };
    const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setErr(data.error ?? "Failed to save");
    router.push("/admin/products");
    router.refresh();
  }

  const previews = f.images.split(/\n|,/).map((s) => s.trim()).filter(Boolean);

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <div><label className="label">Product name</label><input required className="input" value={f.name} onChange={set("name")} /></div>
          <div><label className="label">Slug (URL)</label><input className="input" placeholder="auto-generated from name" value={f.slug} onChange={set("slug")} /></div>
          <div><label className="label">Description</label><textarea rows={5} className="input" value={f.description} onChange={set("description")} /></div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Images</h2>
          <p className="text-xs text-neutral-500">Paste one image URL per line. The first image is the main image.</p>
          <textarea rows={4} className="input font-mono text-xs" value={f.images} onChange={set("images")} placeholder="https://…" />
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="w-16 h-20 object-cover rounded border border-neutral-200 bg-neutral-100" />
              ))}
            </div>
          )}
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Sizes (comma separated)</label><input className="input" value={f.sizes} onChange={set("sizes")} /></div>
            <div><label className="label">Colours (comma separated)</label><input className="input" value={f.colors} onChange={set("colors")} /></div>
            <div><label className="label">Tags (new, bestseller, limited…)</label><input className="input" value={f.tags} onChange={set("tags")} /></div>
            <div><label className="label">Stock quantity</label><input type="number" min="0" className="input" value={f.stock} onChange={set("stock")} /></div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Pricing</h2>
          <div><label className="label">Price ($)</label><input required type="number" step="0.01" min="0" className="input" value={f.price} onChange={set("price")} /></div>
          <div><label className="label">Compare-at price ($)</label><input type="number" step="0.01" min="0" className="input" value={f.compareAtPrice ?? ""} onChange={set("compareAtPrice")} placeholder="Leave empty if not on sale" /></div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Organisation</h2>
          <div>
            <label className="label">Category</label>
            <select className="input" value={f.categoryId} onChange={set("categoryId")}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={f.gender} onChange={set("gender")}>
              <option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={set("featured")} className="accent-neutral-900" /> Featured on homepage</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={set("isActive")} className="accent-neutral-900" /> Visible in store</label>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={saving} className="btn-primary w-full">{saving ? "Saving…" : product ? "Save Changes" : "Create Product"}</button>
        <button type="button" onClick={() => router.back()} className="btn-outline w-full">Cancel</button>
      </div>
    </form>
  );
}
