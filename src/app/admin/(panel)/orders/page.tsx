import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, ilike, or, and } from "drizzle-orm";
import { formatPrice, formatDate, ORDER_STATUSES, cn } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const conds = [];
  if (sp.status && sp.status !== "all") conds.push(eq(orders.status, sp.status));
  if (sp.q) conds.push(or(ilike(orders.orderNumber, `%${sp.q}%`), ilike(orders.customerName, `%${sp.q}%`), ilike(orders.customerEmail, `%${sp.q}%`)));
  const rows = await db.select().from(orders).where(conds.length ? and(...conds) : undefined).orderBy(desc(orders.createdAt)).limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-neutral-500">{rows.length} orders</p></div>
        <form className="flex gap-2">
          <input name="q" defaultValue={sp.q} placeholder="Search order #, name, email…" className="input w-64" />
          <button className="btn-outline py-2 px-4 text-xs">Search</button>
        </form>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all", ...ORDER_STATUSES].map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={cn("px-3 py-1.5 rounded-full text-xs border capitalize", (sp.status ?? "all") === s ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-300")}>{s}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
            <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-5 py-3 font-medium"><Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link></td>
                <td className="px-5 py-3">{o.customerName}<br /><span className="text-xs text-neutral-400">{o.customerEmail}</span></td>
                <td className="px-5 py-3 text-neutral-500">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3 uppercase text-xs">{o.paymentMethod}</td>
                <td className="px-5 py-3 font-medium">{formatPrice(o.total)}</td>
                <td className="px-5 py-3"><OrderStatusSelect id={o.id} status={o.status} /></td>
                <td className="px-5 py-3 text-right"><Link href={`/admin/orders/${o.id}`} className="text-xs underline">Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No orders found.</p>}
      </div>
    </div>
  );
}
