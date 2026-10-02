import { NextRequest } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWrite } from "@/lib/admin-api";

export async function DELETE(req: NextRequest) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  await db.delete(subscribers).where(eq(subscribers.id, id));
  return Response.json({ ok: true });
}
