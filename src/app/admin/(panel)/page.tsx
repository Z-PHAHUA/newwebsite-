import Link from "next/link";
import { getAdminStats } from "@/lib/data";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";

export default async function AdminDashboard() {
  const s = await getAdminStats();
  const maxRev = Math.max(1, ...s.daily.map((d) => d.revenue));

  const cards = [
    { label: "Total Revenue", value: formatPrice(s.revenue), sub: "excl. cancelled", accent: "bg-emerald-500" },
    { label: "Orders", value: s.orders, sub: `${s.pending} pending`, accent: "bg-blue-500" },
    { label: "Customers", value: s.customers, sub: "unique emails", accent: "bg-purple-500" },
    { label: "Products", value: s.products, sub: `${s.lowStock} low stock`, accent: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">Overview of your store performance</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${c.accent}`} />
            <p className="text-xs uppercase tracking-wider text-neutral-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
            <p className="text-xs text-neutral-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold mb-6">Revenue — last 14 days</h2>
          <div className="flex items-end gap-1.5 h-48">
            {s.daily.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end h-40">
                  <div className="w-full bg-neutral-900 rounded-t hover:bg-neutral-700 transition min-h-[2px]" style={{ height: `${(d.revenue / maxRev) * 100}%` }} title={`${d.day}: ${formatPrice(d.revenue)} (${d.orders} orders)`} />
                </div>
                <span className="text-[9px] text-neutral-400 rotate-[-45deg] origin-top-left whitespace-nowrap h-4">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Orders by status</h2>
          <div className="space-y-3">
            {["pending", "processing", "shipped", "delivered", "cancelled"].map((st) => {
              const c = s.statusBreakdown.find((b) => b.status === st)?.c ?? 0;
              const pct = s.orders ? (c / s.orders) * 100 : 0;
              return (
                <div key={st}>
                  <div className="flex justify-between text-xs mb-1"><span className="capitalize">{st}</span><span>{c}</span></div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${statusColors[st].split(" ")[0].replace("100", "500")}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <h2 className="font-semibold mt-8 mb-3">Top products</h2>
          {s.topProducts.length === 0 && <p className="text-xs text-neutral-400">No sales yet.</p>}
          <ul className="space-y-2 text-sm">
            {s.topProducts.map((p, i) => (
              <li key={p.name} className="flex justify-between gap-3"><span className="line-clamp-1">{i + 1}. {p.name}</span><span className="text-neutral-500 shrink-0">{p.qty} sold</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm underline">View all</Link>
        </div>
        {s.recent.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No orders yet. Place a test order from the storefront.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
              <tr><th className="px-6 py-3">Order</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {s.recent.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></td>
                  <td className="px-6 py-3">{o.customerName}<br /><span className="text-xs text-neutral-400">{o.customerEmail}</span></td>
                  <td className="px-6 py-3 text-neutral-500">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-6 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
