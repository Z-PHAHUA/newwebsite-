import Link from "next/link";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminCustomers() {
  const accounts = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const res = await db.execute<{ email: string; name: string; orders: string; spent: string; last: string; city: string; country: string }>(sql`
    select customer_email as email, max(customer_name) as name, count(*)::text as orders,
      coalesce(sum(total) filter (where status <> 'cancelled'), 0)::text as spent,
      max(created_at)::text as last, max(city) as city, max(country) as country
    from orders group by customer_email order by max(created_at) desc
  `);
  const rows = res.rows;
  const stats = new Map(rows.map((r) => [r.email, r]));
  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4"><h1 className="text-2xl font-bold">Registered Accounts</h1><p className="text-sm text-neutral-500">{accounts.length} accounts · auth provider: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "local (set Supabase keys to switch)"}</p></div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
              <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Address</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Spent</th><th className="px-5 py-3">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {accounts.map((c) => {
                const s = stats.get(c.email);
                return (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3"><p className="font-medium">{c.name}</p><p className="text-xs text-neutral-400">{c.email}{c.phone && ` · ${c.phone}`}</p></td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.provider === "supabase" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{c.provider}</span></td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">{c.address ? `${c.address}, ${c.city} ${c.postalCode}, ${c.country}` : "—"}</td>
                    <td className="px-5 py-3">{s?.orders ?? 0}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(s?.spent ?? 0)}</td>
                    <td className="px-5 py-3 text-neutral-500">{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {accounts.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No registered accounts yet.</p>}
        </div>
      </div>
      <div>
        <div className="mb-4"><h2 className="text-xl font-bold">All Buyers (incl. guests)</h2><p className="text-sm text-neutral-500">{rows.length} unique emails from orders</p></div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
              <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Total spent</th><th className="px-5 py-3">Last order</th><th className="px-5 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((c) => (
                <tr key={c.email} className="hover:bg-neutral-50">
                  <td className="px-5 py-3"><p className="font-medium">{c.name}</p><p className="text-xs text-neutral-400">{c.email}</p></td>
                  <td className="px-5 py-3 text-neutral-500">{c.city}, {c.country}</td>
                  <td className="px-5 py-3">{c.orders}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(c.spent)}</td>
                  <td className="px-5 py-3 text-neutral-500">{formatDate(c.last)}</td>
                  <td className="px-5 py-3 text-right"><Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-xs underline">View orders</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
