import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(orders).where(or(eq(orders.userId, user.id), eq(orders.customerEmail, user.email))).orderBy(desc(orders.createdAt));
  return Response.json({ orders: rows });
}
