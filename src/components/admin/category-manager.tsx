"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/db/schema";

type Cat = Category & { productCount: number };
const empty = { name: "", slug: "", description: "", image: "" };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch(editing ? `/api/admin/categories/${editing}` : "/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return setErr((await res.json()).error ?? "Failed");
    setForm(empty);
    setEditing(null);
    router.refresh();
  }
  async function del(id: number) {
    if (!confirm("Delete category? Products will become uncategorised.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="card p-6 space-y-4 h-fit">
        <h2 className="font-semibold">{editing ? "Edit Category" : "New Category"}</h2>
        <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Slug</label><input className="input" placeholder="auto" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><label className="label">Image URL</label><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full py-2.5">{editing ? "Save" : "Create"}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="btn-outline w-full py-2.5">Cancel</button>}
      </form>
      <div className="lg:col-span-2 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
            <tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Products</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt="" className="w-10 h-12 object-cover rounded bg-neutral-100" />
                    ) : <div className="w-10 h-12 rounded bg-neutral-100" />}
                    <div><p className="font-medium">{c.name}</p><p className="text-xs text-neutral-400">{c.description}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-neutral-500 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3">{c.productCount}</td>
                <td className="px-5 py-3 text-right text-xs">
                  <button onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "" }); }} className="px-2 py-1 hover:bg-neutral-100 rounded">Edit</button>
                  <button onClick={() => del(c.id)} className="px-2 py-1 hover:bg-red-50 text-red-600 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
