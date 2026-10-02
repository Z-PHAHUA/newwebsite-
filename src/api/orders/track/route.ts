import { NextRequest } from "next/server";
import { getOrderByNumber } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const number = req.nextUrl.searchParams.get("number")?.toUpperCase();
  const email = req.nextUrl.searchParams.get("email") ?? undefined;
  if (!number) return Response.json({ error: "Missing order number" }, { status: 400 });
  const order = await getOrderByNumber(number, email);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ orderNumber: order.orderNumber, status: order.status });
}
