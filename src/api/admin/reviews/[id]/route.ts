import { NextRequest } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWrite, idFrom } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const b = await req.json();
  const [r] = await db.update(reviews).set({ approved: Boolean(b.approved) }).where(eq(reviews.id, id)).returning();
  return Response.json(r);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(reviews).where(eq(reviews.id, id));
  return Response.json({ ok: true });
}
