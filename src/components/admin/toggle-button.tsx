"use client";

import { useRouter } from "next/navigation";

export function ToggleButton({ url, field, value, onLabel, offLabel }: { url: string; field: string; value: boolean; onLabel: string; offLabel: string }) {
  const router = useRouter();
  async function toggle() {
    await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
    router.refresh();
  }
  return <button onClick={toggle} className="text-xs px-2 py-1 rounded hover:bg-neutral-100">{value ? onLabel : offLabel}</button>;
}
