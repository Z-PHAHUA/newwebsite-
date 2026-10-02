import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWrite, idFrom, logActivity } from "@/lib/admin-api";
import { normalizeProduct } from "@/lib/product-normalize";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const data = normalizeProduct(await req.json());
  try {
    const [p] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    await logActivity(admin, "product.update", `Updated "${p.name}"`);
    return Response.json(p);
  } catch {
    return Response.json({ error: "Failed to update (slug may already exist)" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const b = await req.json();
  const patch: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
  if (b.isActive !== undefined) patch.isActive = Boolean(b.isActive);
  if (b.featured !== undefined) patch.featured = Boolean(b.featured);
  if (b.stock !== undefined) patch.stock = Math.max(0, Math.floor(Number(b.stock)));
  if (b.price !== undefined) patch.price = Number(b.price).toFixed(2);
  if (b.compareAtPrice !== undefined) patch.compareAtPrice = b.compareAtPrice ? Number(b.compareAtPrice).toFixed(2) : null;
  const [p] = await db.update(products).set(patch).where(eq(products.id, id)).returning();
  await logActivity(admin, "product.quick-edit", `"${p.name}": ${Object.keys(b).join(", ")}`);
  return Response.json(p);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(products).where(eq(products.id, id));
  await logActivity(admin, "product.delete", `Deleted product #${id}`);
  return Response.json({ ok: true });
}
