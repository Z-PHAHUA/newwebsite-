import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { TeamManager } from "@/components/admin/team-manager";

export default async function TeamPage() {
  const admin = (await getAdminSession())!;
  if (admin.role !== "owner") redirect("/admin");
  const rows = await db.select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, isActive: adminUsers.isActive, lastLoginAt: adminUsers.lastLoginAt, createdAt: adminUsers.createdAt }).from(adminUsers).orderBy(asc(adminUsers.createdAt));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Team & Access</h1><p className="text-sm text-neutral-500">Create admin logins (email + password) and control what each person can do.</p></div>
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        {[["Owner", "Full access incl. team management"], ["Manager", "Manage products, orders, content — no team access"], ["Staff", "Read-only: view dashboard, orders, customers"]].map(([r, d]) => (
          <div key={r} className="card p-4"><p className="font-semibold">{r}</p><p className="text-xs text-neutral-500 mt-1">{d}</p></div>
        ))}
      </div>
      <TeamManager members={rows.map((r) => ({ ...r, lastLoginAt: r.lastLoginAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString() }))} meId={admin.id} />
    </div>
  );
}
