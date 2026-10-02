import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireWrite } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { denied } = await requireWrite();
  if (denied) return denied;
  const b = await req.json();
  if (!b.name) return Response.json({ error: "Name required" }, { status: 400 });
  try {
    const [c] = await db.insert(categories).values({ name: b.name, slug: slugify(b.slug || b.name), description: b.description || null, image: b.image || null }).returning();
    return Response.json(c);
  } catch {
    return Response.json({ error: "Slug already exists" }, { status: 400 });
  }
}
