import { db } from "@/db";
import { categories, products, reviews, orders, orderItems, settings } from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql, gte, lte, count, avg } from "drizzle-orm";
import { seedIfEmpty } from "./seed";

let seedPromise: Promise<unknown> | null = null;
export async function ensureSeeded() {
  if (!seedPromise) seedPromise = seedIfEmpty().catch(() => null);
  await seedPromise;
}

export type ProductFilters = {
  q?: string;
  category?: string;
  gender?: string;
  min?: number;
  max?: number;
  sort?: string;
  featured?: boolean;
  size?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

export async function getProducts(f: ProductFilters = {}) {
  await ensureSeeded();
  const conds = [];
  if (!f.includeInactive) conds.push(eq(products.isActive, true));
  if (f.q) conds.push(or(ilike(products.name, `%${f.q}%`), ilike(products.description, `%${f.q}%`)));
  if (f.category) conds.push(eq(categories.slug, f.category));
  if (f.gender && f.gender !== "all") conds.push(or(eq(products.gender, f.gender), eq(products.gender, "unisex")));
  if (f.min !== undefined) conds.push(gte(products.price, String(f.min)));
  if (f.max !== undefined) conds.push(lte(products.price, String(f.max)));
  if (f.featured) conds.push(eq(products.featured, true));
  if (f.size) conds.push(sql`${products.sizes} @> ${JSON.stringify([f.size])}::jsonb`);

  const order =
    f.sort === "price-asc" ? asc(products.price)
    : f.sort === "price-desc" ? desc(products.price)
    : f.sort === "name" ? asc(products.name)
    : desc(products.createdAt);

  const limit = f.limit ?? 24;
  const page = Math.max(1, f.page ?? 1);
  const where = conds.length ? and(...conds) : undefined;

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
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  return {
    items: rows.map((r) => ({
      ...r.product,
      categoryName: r.categoryName,
      categorySlug: r.categorySlug,
      rating: Number(r.rating),
      reviewCount: r.reviewCount,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export type ProductListItem = Awaited<ReturnType<typeof getProducts>>["items"][number];

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const [row] = await db
    .select({ product: products, categoryName: categories.name, categorySlug: categories.slug })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!row) return null;
  const productReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, row.product.id), eq(reviews.approved, true)))
    .orderBy(desc(reviews.createdAt));
  const [agg] = await db
    .select({ avg: avg(reviews.rating), cnt: count() })
    .from(reviews)
    .where(and(eq(reviews.productId, row.product.id), eq(reviews.approved, true)));
  return {
    ...row.product,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    reviews: productReviews,
    rating: Number(agg?.avg ?? 0),
    reviewCount: agg?.cnt ?? 0,
  };
}

export async function getCategories() {
  await ensureSeeded();
  const rows = await db
    .select({
      category: categories,
      productCount: sql<number>`(select count(*)::int from products p where p.category_id = ${categories.id} and p.is_active)`,
    })
    .from(categories)
    .orderBy(asc(categories.name));
  return rows.map((r) => ({ ...r.category, productCount: r.productCount }));
}

export async function getSettings() {
  await ensureSeeded();
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export async function getOrderByNumber(orderNumber: string, email?: string) {
  const conds = [eq(orders.orderNumber, orderNumber)];
  if (email) conds.push(ilike(orders.customerEmail, email));
  const [order] = await db.select().from(orders).where(and(...conds)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function getAdminStats() {
  const [totals] = await db
    .select({
      revenue: sql<string>`coalesce(sum(case when status <> 'cancelled' then total else 0 end), 0)`,
      orders: count(),
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
    })
    .from(orders);
  const [prod] = await db
    .select({
      total: count(),
      lowStock: sql<number>`count(*) filter (where stock <= 5)::int`,
    })
    .from(products);
  const [cust] = await db
    .select({ total: sql<number>`count(distinct customer_email)::int` })
    .from(orders);
  const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8);
  const daily = await db.execute<{ day: string; revenue: string; orders: string }>(sql`
    select to_char(d::date, 'Mon DD') as day,
      coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0)::text as revenue,
      count(o.id)::text as orders
    from generate_series(current_date - interval '13 days', current_date, '1 day') d
    left join orders o on o.created_at::date = d::date
    group by d order by d
  `);
  const topProducts = await db.execute<{ name: string; qty: string; revenue: string }>(sql`
    select product_name as name, sum(quantity)::text as qty, sum(quantity * price)::text as revenue
    from order_items group by product_name order by sum(quantity) desc limit 5
  `);
  const statusBreakdown = await db
    .select({ status: orders.status, c: count() })
    .from(orders)
    .groupBy(orders.status);
  return {
    revenue: Number(totals?.revenue ?? 0),
    orders: totals?.orders ?? 0,
    pending: totals?.pending ?? 0,
    products: prod?.total ?? 0,
    lowStock: prod?.lowStock ?? 0,
    customers: cust?.total ?? 0,
    recent,
    daily: daily.rows.map((r) => ({ day: r.day, revenue: Number(r.revenue), orders: Number(r.orders) })),
    topProducts: topProducts.rows.map((r) => ({ name: r.name, qty: Number(r.qty), revenue: Number(r.revenue) })),
    statusBreakdown,
  };
}
