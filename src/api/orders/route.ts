import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, orders, orderItems, coupons } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/utils";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type ItemIn = { productId: number; size?: string; color?: string; quantity: number };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await getCurrentUser().catch(() => null);
  if (!user) return Response.json({ error: "Please sign in to place an order" }, { status: 401 });
  const items: ItemIn[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return Response.json({ error: "Cart is empty" }, { status: 400 });
  for (const k of ["customerName", "customerEmail", "address", "city", "postalCode", "country"]) {
    if (!body[k] || typeof body[k] !== "string") return Response.json({ error: `Missing ${k}` }, { status: 400 });
  }

  const prods = await db.select().from(products).where(inArray(products.id, items.map((i) => Number(i.productId))));
  const map = new Map(prods.map((p) => [p.id, p]));
  let subtotal = 0;
  const lines = [];
  for (const it of items) {
    const p = map.get(Number(it.productId));
    if (!p || !p.isActive) return Response.json({ error: "A product in your cart is no longer available" }, { status: 400 });
    const qty = Math.max(1, Math.floor(Number(it.quantity)));
    if (p.stock < qty) return Response.json({ error: `Only ${p.stock} left of ${p.name}` }, { status: 400 });
    subtotal += Number(p.price) * qty;
    lines.push({ p, qty, size: it.size ?? null, color: it.color ?? null });
  }

  let discount = 0;
  let couponCode: string | null = null;
  if (body.couponCode) {
    const [c] = await db.select().from(coupons).where(eq(coupons.code, String(body.couponCode).toUpperCase()));
    if (c && c.isActive && subtotal >= Number(c.minOrder ?? 0)) {
      discount = c.type === "percent" ? (subtotal * Number(c.value)) / 100 : Number(c.value);
      discount = Math.min(discount, subtotal);
      couponCode = c.code;
      await db.update(coupons).set({ usageCount: sql`${coupons.usageCount} + 1` }).where(eq(coupons.id, c.id));
    }
  }
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shipping);
  const orderNumber = `VA-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

  const [order] = await db.insert(orders).values({
    orderNumber,
    userId: user.id,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone || null,
    address: body.address,
    city: body.city,
    postalCode: body.postalCode,
    country: body.country,
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    couponCode,
    paymentMethod: ["card", "paypal", "cod"].includes(body.paymentMethod) ? body.paymentMethod : "cod",
    notes: body.notes || null,
  }).returning();

  await db.insert(orderItems).values(lines.map((l) => ({
    orderId: order.id,
    productId: l.p.id,
    productName: l.p.name,
    image: l.p.images[0] ?? null,
    size: l.size,
    color: l.color,
    price: l.p.price,
    quantity: l.qty,
  })));
  for (const l of lines) {
    await db.update(products).set({ stock: sql`${products.stock} - ${l.qty}` }).where(eq(products.id, l.p.id));
  }
  return Response.json({ orderNumber: order.orderNumber, id: order.id });
}
