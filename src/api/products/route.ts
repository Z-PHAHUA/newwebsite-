import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ids = sp.get("ids");
  if (ids) {
    const idList = ids.split(",").map(Number).filter((n) => !isNaN(n));
    if (idList.length === 0) return Response.json({ items: [] });
    const rows = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
        rating: sql<string>`coalesce((select avg(rating) from reviews r where r.product_id = ${products.id} and r.approved), 0)`,
        reviewCount: sql<number>`(select count(*)::int from reviews r where r.product_id = ${products.id} and r.approved)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(inArray(products.id, idList), eq(products.isActive, true)));
    return Response.json({ items: rows.map((r) => ({ ...r.product, categoryName: r.categoryName, categorySlug: r.categorySlug, rating: Number(r.rating), reviewCount: r.reviewCount })) });
  }
  const result = await getProducts({
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    gender: sp.get("gender") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    limit: Number(sp.get("limit") ?? 24),
  });
  return Response.json(result);
}
