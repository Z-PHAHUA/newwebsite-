import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { InlineNumber } from "@/components/admin/inline-edit";
import { ReseedButton } from "@/components/admin/reseed-button";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { items, total, pages } = await getProducts({ q: sp.q, includeInactive: true, page, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-neutral-500">{total} products · click price or stock to edit inline</p>
        </div>
        <div className="flex gap-3">
          <form className="flex gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Search products…" className="input w-56" />
            <button className="btn-outline py-2 px-4 text-xs">Search</button>
          </form>
          <ReseedButton />
          <Link href="/admin/products/new" className="btn-primary py-2 px-4 text-xs">+ Add Product</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
            <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="w-11 h-14 object-cover rounded bg-neutral-100" />
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                      <p className="text-xs text-neutral-400 capitalize">{p.gender} · {p.featured && "★ Featured"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-neutral-500">{p.categoryName ?? "—"}</td>
                <td className="px-5 py-3"><InlineNumber id={p.id} field="price" value={Number(p.price)} prefix="$" /><span className="text-xs text-neutral-400 line-through ml-2"><InlineNumber id={p.id} field="compareAtPrice" value={p.compareAtPrice ? Number(p.compareAtPrice) : null} prefix="$" /></span></td>
                <td className="px-5 py-3"><InlineNumber id={p.id} field="stock" value={p.stock} warn={p.stock <= 5} /></td>
                <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{p.isActive ? "Active" : "Hidden"}</span></td>
                <td className="px-5 py-3 text-right"><ProductRowActions id={p.id} slug={p.slug} isActive={p.isActive} featured={p.featured} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No products found.</p>}
      </div>
      {pages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={`/admin/products?page=${n}${sp.q ? `&q=${sp.q}` : ""}`} className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${n === page ? "bg-neutral-900 text-white" : "bg-white"}`}>{n}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
