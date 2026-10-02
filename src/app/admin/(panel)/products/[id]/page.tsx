import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/data";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, Number(id)));
  if (!product) notFound();
  const cats = await getCategories();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Edit Product</h1><p className="text-sm text-neutral-500">{product.name}</p></div>
      <ProductForm product={product} categories={cats} />
    </div>
  );
}
