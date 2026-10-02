"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ url, redirectTo, label = "Delete", small }: { url: string; redirectTo?: string; label?: string; small?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setBusy(true);
    await fetch(url, { method: "DELETE" });
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }
  return (
    <button disabled={busy} onClick={del} className={small ? "text-xs text-red-600 hover:underline" : "border border-red-200 text-red-600 text-xs font-semibold px-3 py-2 rounded-md hover:bg-red-50"}>{label}</button>
  );
}
