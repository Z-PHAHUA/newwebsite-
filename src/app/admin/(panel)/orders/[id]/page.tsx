import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id)));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-neutral-500 hover:underline">← Back to orders</Link>
          <h1 className="text-2xl font-bold mt-1">Order {order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">Placed {formatDate(order.createdAt)} · Updated {formatDate(order.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect id={order.id} status={order.status} />
          <DeleteButton url={`/api/admin/orders/${order.id}`} redirectTo="/admin/orders" label="Delete order" />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-neutral-100 font-semibold">Items ({items.length})</div>
          <div className="divide-y divide-neutral-100">
            {items.map((i) => (
              <div key={i.id} className="p-5 flex gap-4 text-sm">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="w-14 h-18 object-cover rounded bg-neutral-100" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{i.productName}</p>
                  <p className="text-xs text-neutral-500">{i.size} · {i.color}</p>
                  <p className="text-xs text-neutral-500">{formatPrice(i.price)} × {i.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(Number(i.price) * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-neutral-100 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {Number(order.discount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({order.couponCode})</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-100"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
        <div className="space-y-6 text-sm">
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Customer</h3>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-neutral-500">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-neutral-500">{order.customerPhone}</p>}
            <Link href={`/admin/orders?q=${encodeURIComponent(order.customerEmail)}`} className="text-xs underline mt-2 inline-block">All orders by this customer</Link>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Shipping address</h3>
            <p>{order.address}</p><p>{order.city}, {order.postalCode}</p><p>{order.country}</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Payment</h3>
            <p className="uppercase">{order.paymentMethod}</p>
            {order.notes && <><h3 className="font-semibold mt-4 mb-1">Customer notes</h3><p className="text-neutral-600">{order.notes}</p></>}
          </div>
          <Link href={`/order/${order.orderNumber}`} target="_blank" className="btn-outline w-full py-2.5 text-xs">View customer page ↗</Link>
        </div>
      </div>
    </div>
  );
}
