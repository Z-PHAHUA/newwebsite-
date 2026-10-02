"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile & Address" },
  { href: "/account/security", label: "Password" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={cn("px-4 py-2.5 rounded-md text-sm whitespace-nowrap", pathname === l.href ? "bg-neutral-900 text-white" : "hover:bg-neutral-100")}>{l.label}</Link>
      ))}
      <button onClick={logout} className="px-4 py-2.5 rounded-md text-sm text-left text-red-600 hover:bg-red-50 whitespace-nowrap">Sign out</button>
    </nav>
  );
}
