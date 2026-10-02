import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Shop" };

type SP = Record<string, string | string[] | undefined>;
const s = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = s(sp.q);
  const category = s(sp.category);
  const gender = s(sp.gender) ?? "all";
  const sort = s(sp.sort) ?? "newest";
  const size = s(sp.size);
  const min = s(sp.min) ? Number(s(sp.min)) : undefined;
  const max = s(sp.max) ? Number(s(sp.max)) : undefined;
  const page = Number(s(sp.page) ?? 1);

  const [{ items, total, pages }, cats] = await Promise.all([
    getProducts({ q, category, gender, sort, size, min, max, page, limit: 12 }),
    getCategories(),
  ]);

  const build = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, category, gender, sort, size, min: min?.toString(), max: max?.toString(), ...patch };
    Object.entries(merged).forEach(([k, v]) => v && v !== "all" && p.set(k, v));
    const str = p.toString();
    return `/shop${str ? `?${str}` : ""}`;
  };

  const title = q ? `Results for “${q}”` : category ? cats.find((c) => c.slug === category)?.name ?? "Shop" : gender !== "all" ? `${gender[0].toUpperCase()}${gender.slice(1)}` : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-neutral-500 mb-6"><Link href="/">Home</Link> / <span className="text-neutral-900">Shop</span></nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl">{title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{total} products</p>
        </div>
        <form className="flex items-center gap-2 text-sm" action="/shop">
          {q && <input type="hidden" name="q" value={q} />}
          {category && <input type="hidden" name="category" value={category} />}
          {gender !== "all" && <input type="hidden" name="gender" value={gender} />}
          {size && <input type="hidden" name="size" value={size} />}
          <label className="text-neutral-500">Sort</label>
          <select name="sort" defaultValue={sort} className="input w-auto py-2">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
          <button className="btn-outline py-2 px-4 text-xs">Apply</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {["all", "women", "men"].map((g) => (
                <Link key={g} href={build({ gender: g })} className={cn("px-3 py-1.5 rounded-full text-xs border capitalize", gender === g ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-900")}>{g}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Category</h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link href={build({ category: undefined })} className={cn("hover:underline", !category && "font-semibold")}>All</Link></li>
              {cats.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <Link href={build({ category: c.slug })} className={cn("hover:underline", category === c.slug && "font-semibold")}>{c.name}</Link>
                  <span className="text-xs text-neutral-400">{c.productCount}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                <Link key={sz} href={build({ size: size === sz ? undefined : sz })} className={cn("w-10 h-10 flex items-center justify-center rounded-md text-xs border", size === sz ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-900")}>{sz}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Price</h3>
            <form action="/shop" className="flex items-center gap-2">
              {q && <input type="hidden" name="q" value={q} />}
              {category && <input type="hidden" name="category" value={category} />}
              {gender !== "all" && <input type="hidden" name="gender" value={gender} />}
              <input name="min" type="number" placeholder="Min" defaultValue={min} className="input py-2" />
              <span>–</span>
              <input name="max" type="number" placeholder="Max" defaultValue={max} className="input py-2" />
              <button className="btn-primary py-2 px-3 text-xs">Go</button>
            </form>
          </div>
          {(q || category || gender !== "all" || size || min || max) && (
            <Link href="/shop" className="text-xs underline text-neutral-500">Clear all filters</Link>
          )}
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl mb-2">No products found</p>
              <p className="text-neutral-500 text-sm mb-6">Try adjusting your filters or search.</p>
              <Link href="/shop" className="btn-primary">Reset filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10">
              {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-14">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={`${build({})}${build({}).includes("?") ? "&" : "?"}page=${n}`} className={cn("w-10 h-10 flex items-center justify-center rounded-md text-sm border", n === page ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-900")}>{n}</Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
