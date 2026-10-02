import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, eq, or, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/customer-auth";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";

export default async function AccountOrders() {
  const user = (await getCurrentUser())!;
  const rows = await db.select().from(orders).where(or(eq(orders.userId, user.id), eq(orders.customerEmail, user.email))).orderBy(desc(orders.createdAt));
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))) : [];

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Order history</h2>
      {rows.length === 0 && <div className="card p-10 text-center text-sm text-neutral-500">You haven&apos;t placed any orders yet. <Link href="/shop" className="underline">Start shopping</Link></div>}
      {rows.map((o) => {
        const its = items.filter((i) => i.orderId === o.id);
        return (
          <div key={o.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm">
              <div><p className="font-semibold">{o.orderNumber}</p><p className="text-xs text-neutral-500">Placed {formatDate(o.createdAt)} · {its.length} item(s)</p></div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[o.status]}`}>{o.status}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
                <Link href={`/order/${o.orderNumber}`} className="btn-outline py-1.5 px-3 text-xs">Details</Link>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {its.map((i) => i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i.id} src={i.image} alt={i.productName} title={i.productName} className="w-14 h-18 object-cover rounded bg-neutral-100 shrink-0" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
