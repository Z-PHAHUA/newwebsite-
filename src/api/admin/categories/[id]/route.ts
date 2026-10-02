import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWrite, idFrom } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const b = await req.json();
  const [c] = await db.update(categories).set({ name: b.name, slug: slugify(b.slug || b.name), description: b.description || null, image: b.image || null }).where(eq(categories.id, id)).returning();
  return Response.json(c);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(categories).where(eq(categories.id, id));
  return Response.json({ ok: true });
}
