import { NextRequest } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rating = Number(b.rating);
  if (!b.productId || !b.authorName || !b.comment || !(rating >= 1 && rating <= 5))
    return Response.json({ error: "Invalid review" }, { status: 400 });
  const [r] = await db.insert(reviews).values({ productId: Number(b.productId), authorName: String(b.authorName).slice(0, 80), comment: String(b.comment).slice(0, 2000), rating }).returning();
  return Response.json(r);
}
