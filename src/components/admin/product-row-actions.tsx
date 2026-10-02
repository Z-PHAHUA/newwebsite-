"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductRowActions({ id, slug, isActive, featured }: { id: number; slug: string; isActive: boolean; featured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    router.refresh();
  }
  async function del() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1 text-xs">
      <button disabled={busy} onClick={() => patch({ featured: !featured })} title="Toggle featured" className={`px-2 py-1 rounded hover:bg-neutral-100 ${featured ? "text-amber-500" : "text-neutral-400"}`}>★</button>
      <button disabled={busy} onClick={() => patch({ isActive: !isActive })} className="px-2 py-1 rounded hover:bg-neutral-100">{isActive ? "Hide" : "Show"}</button>
      <Link href={`/product/${slug}`} target="_blank" className="px-2 py-1 rounded hover:bg-neutral-100">View</Link>
      <Link href={`/admin/products/${id}`} className="px-2 py-1 rounded hover:bg-neutral-100 font-medium">Edit</Link>
      <button disabled={busy} onClick={del} className="px-2 py-1 rounded hover:bg-red-50 text-red-600">Delete</button>
    </div>
  );
}
