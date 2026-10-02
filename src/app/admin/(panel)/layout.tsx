import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { db } from "@/db";
import { orders, messages } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const [[o], [m]] = await Promise.all([
    db.select({ c: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ c: count() }).from(messages).where(eq(messages.read, false)),
  ]);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar admin={admin} badges={{ orders: o?.c ?? 0, messages: m?.c ?? 0 }} />
      <div className="flex-1 min-w-0">
        {admin.role === "staff" && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-6 py-2">You have a read-only <strong>staff</strong> role. Ask an owner to upgrade your access to make changes.</div>
        )}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
