import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/customer-auth";
import { AccountNav } from "@/components/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-1">My Account</p>
        <h1 className="font-serif text-4xl">Hello, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-neutral-500 mt-1">{user.email} · {user.provider === "supabase" ? "Supabase account" : "Store account"}</p>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
