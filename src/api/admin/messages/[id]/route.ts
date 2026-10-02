import { NextRequest } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWrite, idFrom } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const b = await req.json();
  const [m] = await db.update(messages).set({ read: Boolean(b.read) }).where(eq(messages.id, id)).returning();
  return Response.json(m);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(messages).where(eq(messages.id, id));
  return Response.json({ ok: true });
}
