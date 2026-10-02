import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductDetails } from "./product-details";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return { title: p?.name ?? "Product", description: p?.description.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();
  const related = await getProducts({ category: product.categorySlug ?? undefined, limit: 5 });
  const relatedItems = related.items.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-neutral-500 mb-6">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
        {product.categoryName && <> / <Link href={`/shop?category=${product.categorySlug}`}>{product.categoryName}</Link></>}
        {" / "}<span className="text-neutral-900">{product.name}</span>
      </nav>
      <ProductDetails product={product} />
      {relatedItems.length > 0 && (
        <section className="mt-24">
          <h2 className="font-serif text-3xl mb-8">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {relatedItems.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
