"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Click-to-edit numeric field that PATCHes /api/admin/products/:id */
export function InlineNumber({ id, field, value, prefix = "", warn }: { id: number; field: "stock" | "price" | "compareAtPrice"; value: number | null; prefix?: string; warn?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value?.toString() ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: v === "" ? null : Number(v) }) });
    setBusy(false);
    if (!res.ok) { alert((await res.json()).error ?? "Failed"); return; }
    setEditing(false);
    router.refresh();
  }

  if (editing)
    return (
      <span className="inline-flex items-center gap-1">
        <input autoFocus type="number" step={field === "stock" ? 1 : 0.01} min={0} value={v} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          className="w-20 border border-neutral-900 rounded px-1.5 py-0.5 text-sm outline-none" />
        <button disabled={busy} onClick={save} className="text-xs text-emerald-600 font-semibold">✓</button>
        <button onClick={() => setEditing(false)} className="text-xs text-neutral-400">✕</button>
      </span>
    );
  return (
    <button onClick={() => { setV(value?.toString() ?? ""); setEditing(true); }} title="Click to edit" className={`group inline-flex items-center gap-1 hover:bg-neutral-100 rounded px-1 -mx-1 ${warn ? "text-red-600 font-semibold" : ""}`}>
      {value === null ? <span className="text-neutral-300">—</span> : `${prefix}${field === "stock" ? value : value.toFixed(2)}`}
      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-neutral-400">✎</span>
    </button>
  );
}
