import { NextRequest } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code) return Response.json({ error: "Enter a coupon code" }, { status: 400 });
  const [c] = await db.select().from(coupons).where(eq(coupons.code, String(code).toUpperCase()));
  if (!c || !c.isActive) return Response.json({ error: "Invalid coupon code" }, { status: 404 });
  const sub = Number(subtotal ?? 0);
  if (sub < Number(c.minOrder ?? 0)) return Response.json({ error: `Minimum order of $${c.minOrder} required` }, { status: 400 });
  const discount = c.type === "percent" ? (sub * Number(c.value)) / 100 : Math.min(Number(c.value), sub);
  return Response.json({ code: c.code, discount: Number(discount.toFixed(2)), type: c.type, value: Number(c.value) });
}
