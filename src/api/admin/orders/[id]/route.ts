import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireWrite, idFrom, logActivity } from "@/lib/admin-api";
import { ORDER_STATUSES } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const { status } = await req.json();
  if (!ORDER_STATUSES.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  // Restock when cancelling
  if (status === "cancelled" && existing.status !== "cancelled") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    for (const it of items) {
      if (it.productId) await db.update(products).set({ stock: sql`${products.stock} + ${it.quantity}` }).where(eq(products.id, it.productId));
    }
  }
  const [o] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
  await logActivity(admin, "order.status", `${o.orderNumber}: ${existing.status} → ${status}`);
  return Response.json(o);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(orders).where(eq(orders.id, id));
  return Response.json({ ok: true });
}
