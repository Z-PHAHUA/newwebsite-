import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { and, eq, isNotNull, desc, sql } from "drizzle-orm";
import { ProductCard } from "@/components/product-card";
import { ensureSeeded } from "@/lib/data";

export const metadata = { title: "Sale" };
export const dynamic = "force-dynamic";

export default async function SalePage() {
  await ensureSeeded();
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
    .where(and(eq(products.isActive, true), isNotNull(products.compareAtPrice)))
    .orderBy(desc(products.createdAt));
  const items = rows.map((r) => ({ ...r.product, categoryName: r.categoryName, categorySlug: r.categorySlug, rating: Number(r.rating), reviewCount: r.reviewCount }));

  return (
    <div>
      <section className="bg-red-600 text-white py-20 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-3">Limited time</p>
        <h1 className="font-serif text-6xl mb-4">End of Season Sale</h1>
        <p className="text-white/80">Up to 30% off selected styles. While stocks last.</p>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-sm text-neutral-500 mb-8">{items.length} items on sale</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
