import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, or, sql } from "drizzle-orm";
import { getCurrentUser, getCustomerProfile } from "@/lib/customer-auth";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";

export default async function AccountOverview() {
  const user = (await getCurrentUser())!;
  const profile = await getCustomerProfile(user.id);
  const where = or(eq(orders.userId, user.id), eq(orders.customerEmail, user.email));
  const recent = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(3);
  const [agg] = await db.select({ c: sql<number>`count(*)::int`, spent: sql<string>`coalesce(sum(total) filter (where status <> 'cancelled'),0)` }).from(orders).where(where);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5"><p className="text-xs uppercase tracking-wider text-neutral-500">Orders</p><p className="text-2xl font-bold mt-1">{agg?.c ?? 0}</p></div>
        <div className="card p-5"><p className="text-xs uppercase tracking-wider text-neutral-500">Total spent</p><p className="text-2xl font-bold mt-1">{formatPrice(agg?.spent ?? 0)}</p></div>
        <div className="card p-5"><p className="text-xs uppercase tracking-wider text-neutral-500">Member since</p><p className="text-2xl font-bold mt-1">{profile ? formatDate(profile.createdAt) : "—"}</p></div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100"><h2 className="font-semibold">Recent orders</h2><Link href="/account/orders" className="text-sm underline">View all</Link></div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">No orders yet. <Link href="/shop" className="underline">Start shopping</Link></div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recent.map((o) => (
              <Link key={o.id} href={`/order/${o.orderNumber}`} className="flex items-center justify-between p-5 hover:bg-neutral-50 text-sm">
                <div><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-neutral-500">{formatDate(o.createdAt)}</p></div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[o.status]}`}>{o.status}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="card p-5 text-sm">
        <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">Default address</h2><Link href="/account/profile" className="text-xs underline">Edit</Link></div>
        {profile?.address ? (
          <p className="text-neutral-600">{profile.name}<br />{profile.address}<br />{profile.city}, {profile.postalCode}<br />{profile.country}</p>
        ) : <p className="text-neutral-500">No address saved yet — add one for faster checkout.</p>}
      </div>
    </div>
  );
}
