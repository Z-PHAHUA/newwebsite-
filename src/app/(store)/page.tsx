import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [featured, newest, cats] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getProducts({ sort: "newest", limit: 4 }),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden bg-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="Autumn collection" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-xl text-white animate-fade-up">
            <p className="text-xs tracking-[0.3em] uppercase mb-4">Autumn / Winter 2026</p>
            <h1 className="font-serif text-5xl sm:text-7xl leading-[1.05] mb-6">
              Dress for the life you&apos;re building.
            </h1>
            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-md">
              Timeless silhouettes, honest fabrics, and pieces designed to be worn for years — not seasons.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop?gender=women" className="btn-primary bg-white text-neutral-900 hover:bg-neutral-200">Shop Women</Link>
              <Link href="/shop?gender=men" className="btn-outline border-white text-white hover:bg-white hover:text-neutral-900">Shop Men</Link>
            </div>
          </div>
        </div>
      </section>

      {/* USP bar */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-200">
          {[
            ["Free Shipping", "On all orders over $100"],
            ["30-Day Returns", "Hassle-free exchanges"],
            ["Secure Checkout", "Card, PayPal or COD"],
            ["Made Responsibly", "Small-batch production"],
          ].map(([t, d]) => (
            <div key={t} className="py-6 px-4 text-center">
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs text-neutral-500 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2">Browse</p>
            <h2 className="font-serif text-4xl">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium underline underline-offset-4 hover:text-neutral-500">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100">
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-white/70">{c.productCount} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2">Curated</p>
            <h2 className="font-serif text-4xl">Featured Pieces</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {featured.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Editorial split */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-6">
        <Link href="/shop?category=jackets" className="group relative aspect-[4/5] md:aspect-[4/4] rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.pexels.com/photos/35114789/pexels-photo-35114789.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1000" alt="Outerwear" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs tracking-[0.3em] uppercase mb-2">The Edit</p>
            <h3 className="font-serif text-4xl mb-4">Outerwear Season</h3>
            <span className="text-sm underline underline-offset-4">Explore coats & jackets →</span>
          </div>
        </Link>
        <Link href="/shop?category=denim" className="group relative aspect-[4/5] md:aspect-[4/4] rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.pexels.com/photos/24287019/pexels-photo-24287019.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1000" alt="Denim" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs tracking-[0.3em] uppercase mb-2">Essentials</p>
            <h3 className="font-serif text-4xl mb-4">Denim, Reworked</h3>
            <span className="text-sm underline underline-offset-4">Shop the denim edit →</span>
          </div>
        </Link>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2">Just landed</p>
            <h2 className="font-serif text-4xl">New Arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-sm font-medium underline underline-offset-4 hover:text-neutral-500">See all new</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {newest.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl text-center mb-12">Loved by 40,000+ customers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ["“The quality is unreal for the price. My moto jacket gets compliments every single time.”", "Amelia R.", "London"],
              ["“Finally a brand that gets fit right. Ordered my size and it was perfect — no returns needed.”", "Jordan K.", "New York"],
              ["“Fast delivery, beautiful packaging, and the satin dress is even better in person.”", "Priya S.", "Toronto"],
            ].map(([q, n, c]) => (
              <div key={n} className="border border-neutral-800 rounded-xl p-8">
                <div className="text-amber-400 mb-4">★★★★★</div>
                <p className="text-neutral-200 leading-relaxed mb-6">{q}</p>
                <p className="text-sm font-semibold">{n}</p>
                <p className="text-xs text-neutral-500">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
