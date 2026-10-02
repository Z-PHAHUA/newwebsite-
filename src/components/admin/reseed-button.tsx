"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReseedButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!confirm("Refresh demo catalog? This updates names/images of the demo products to the latest set. Your own products are not touched.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/reseed", { method: "POST" });
    setBusy(false);
    if (!res.ok) return alert((await res.json()).error ?? "Failed");
    router.refresh();
  }
  return <button onClick={run} disabled={busy} className="btn-outline py-2 px-4 text-xs">{busy ? "Refreshing…" : "↻ Refresh demo images"}</button>;
}
