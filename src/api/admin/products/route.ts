import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireWrite, logActivity } from "@/lib/admin-api";
import { normalizeProduct } from "@/lib/product-normalize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const data = normalizeProduct(await req.json());
  if (!data.name) return Response.json({ error: "Name is required" }, { status: 400 });
  try {
    const [p] = await db.insert(products).values(data).returning();
    await logActivity(admin, "product.create", `Created "${p.name}"`);
    return Response.json(p);
  } catch (e) {
    return Response.json({ error: (e as Error).message.includes("unique") ? "Slug already exists" : "Failed to create" }, { status: 400 });
  }
}
