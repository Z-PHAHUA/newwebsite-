"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, statusColors } from "@/lib/utils";

export function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function change(next: string) {
    setBusy(true);
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    setBusy(false);
    router.refresh();
  }
  return (
    <select disabled={busy} value={status} onChange={(e) => change(e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded-full capitalize border-0 outline-none cursor-pointer ${statusColors[status]}`}>
      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
