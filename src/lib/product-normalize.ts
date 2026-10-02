import { slugify } from "./utils";

export function normalizeProduct(b: Record<string, unknown>) {
  const arr = (v: unknown) => Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return {
    name: String(b.name ?? "").trim(),
    slug: slugify(String(b.slug || b.name || "")),
    description: String(b.description ?? ""),
    price: Number(b.price ?? 0).toFixed(2),
    compareAtPrice: b.compareAtPrice ? Number(b.compareAtPrice).toFixed(2) : null,
    categoryId: b.categoryId ? Number(b.categoryId) : null,
    images: arr(b.images),
    sizes: arr(b.sizes),
    colors: arr(b.colors),
    tags: arr(b.tags),
    stock: Math.max(0, Math.floor(Number(b.stock ?? 0))),
    featured: Boolean(b.featured),
    isActive: b.isActive === undefined ? true : Boolean(b.isActive),
    gender: ["men", "women", "unisex"].includes(String(b.gender)) ? String(b.gender) : "unisex",
    updatedAt: new Date(),
  };
}
