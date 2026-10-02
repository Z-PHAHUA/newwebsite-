"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/orders", label: "Orders", icon: "⬚" },
  { href: "/admin/products", label: "Products", icon: "◈" },
  { href: "/admin/categories", label: "Categories", icon: "☰" },
  { href: "/admin/customers", label: "Customers", icon: "◯" },
  { href: "/admin/coupons", label: "Coupons", icon: "◇" },
  { href: "/admin/reviews", label: "Reviews", icon: "★" },
  { href: "/admin/messages", label: "Messages", icon: "✉" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "◎" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];
const adminLinks = [
  { href: "/admin/team", label: "Team & Access", icon: "⚇", ownerOnly: true },
  { href: "/admin/activity", label: "Activity Log", icon: "≡", ownerOnly: false },
  { href: "/admin/account", label: "My Account", icon: "◉", ownerOnly: false },
];

export function AdminSidebar({ admin, badges }: { admin: AdminSession; badges: { orders: number; messages: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  const item = (l: { href: string; label: string; icon: string }) => {
    const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
    const badge = l.href === "/admin/orders" ? badges.orders : l.href === "/admin/messages" ? badges.messages : 0;
    return (
      <Link key={l.href} href={l.href} className={cn("flex items-center gap-3 px-6 py-2.5 text-sm transition", active ? "bg-neutral-800 text-white border-r-2 border-white" : "hover:bg-neutral-900 hover:text-white")}>
        <span className="w-4 text-center text-xs">{l.icon}</span>
        <span className="flex-1">{l.label}</span>
        {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
      </Link>
    );
  };
  return (
    <aside className="w-60 shrink-0 bg-neutral-950 text-neutral-300 flex flex-col min-h-screen sticky top-0 h-screen">
      <div className="px-6 py-6 border-b border-neutral-800">
        <Link href="/admin" className="font-serif text-xl tracking-[0.2em] text-white">VOGUE</Link>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Admin Console</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map(item)}
        <p className="px-6 pt-5 pb-2 text-[10px] uppercase tracking-widest text-neutral-600">Administration</p>
        {adminLinks.filter((l) => !l.ownerOnly || admin.role === "owner").map(item)}
      </nav>
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <Link href="/admin/account" className="flex items-center gap-3 hover:bg-neutral-900 rounded-md p-2 -m-2">
          <div className="w-9 h-9 rounded-full bg-neutral-700 text-white flex items-center justify-center text-sm font-bold">{admin.name[0]?.toUpperCase()}</div>
          <div className="min-w-0"><p className="text-sm text-white truncate">{admin.name}</p><p className="text-[10px] uppercase tracking-wider text-neutral-500">{admin.role}</p></div>
        </Link>
        <Link href="/" target="_blank" className="block text-xs text-center py-2 border border-neutral-700 rounded-md hover:bg-neutral-900">View Storefront ↗</Link>
        <button onClick={logout} className="w-full text-xs py-1 text-neutral-400 hover:text-white">Sign out</button>
      </div>
    </aside>
  );
}
