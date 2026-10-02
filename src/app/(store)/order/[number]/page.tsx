import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/data";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";

export const dynamic = "force-dynamic";

const steps = ["pending", "processing", "shipped", "delivered"];

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await getOrderByNumber(number);
  if (!order) notFound();
  const stepIdx = steps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h1 className="font-serif text-4xl mb-2">Thank you, {order.customerName.split(" ")[0]}!</h1>
        <p className="text-neutral-500">Your order <strong className="text-neutral-900">{order.orderNumber}</strong> has been received.</p>
        <p className="text-xs text-neutral-400 mt-1">A confirmation has been sent to {order.customerEmail}</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Order Status</h2>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>{order.status}</span>
        </div>
        {order.status !== "cancelled" ? (
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIdx ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}>{i + 1}</div>
                  <p className="text-[11px] mt-2 capitalize">{s}</p>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 -mt-5 ${i < stepIdx ? "bg-neutral-900" : "bg-neutral-200"}`} />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-600">This order has been cancelled.</p>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="divide-y divide-neutral-100">
          {order.items.map((i) => (
            <div key={i.id} className="py-3 flex gap-4 text-sm">
              {i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.image} alt="" className="w-14 h-18 object-cover rounded bg-neutral-100" />
              )}
              <div className="flex-1">
                <p className="font-medium">{i.productName}</p>
                <p className="text-xs text-neutral-500">{i.size} · {i.color} · ×{i.quantity}</p>
              </div>
              <span>{formatPrice(Number(i.price) * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 text-sm mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {Number(order.discount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-sm">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Shipping to</h3>
          <p>{order.customerName}</p>
          <p>{order.address}</p>
          <p>{order.city}, {order.postalCode}</p>
          <p>{order.country}</p>
          {order.customerPhone && <p className="text-neutral-500 mt-1">{order.customerPhone}</p>}
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Details</h3>
          <p>Placed: {formatDate(order.createdAt)}</p>
          <p className="capitalize">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
          {order.notes && <p className="text-neutral-500 mt-2">Note: {order.notes}</p>}
        </div>
      </div>
      <div className="text-center mt-10">
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
