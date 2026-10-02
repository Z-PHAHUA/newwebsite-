import { NextRequest } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireWrite, logActivity } from "@/lib/admin-api";

export async function POST(req: NextRequest) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const b = await req.json();
  if (!b.code || !b.value) return Response.json({ error: "Code and value required" }, { status: 400 });
  try {
    const [c] = await db.insert(coupons).values({ code: String(b.code).toUpperCase().trim(), type: b.type === "fixed" ? "fixed" : "percent", value: Number(b.value).toFixed(2), minOrder: Number(b.minOrder ?? 0).toFixed(2) }).returning();
    await logActivity(admin, "coupon.create", c.code);
    return Response.json(c);
  } catch {
    return Response.json({ error: "Code already exists" }, { status: 400 });
  }
}
