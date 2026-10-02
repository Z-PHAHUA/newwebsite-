import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/data";

export default async function NewProductPage() {
  const cats = await getCategories();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Add Product</h1><p className="text-sm text-neutral-500">Create a new product listing</p></div>
      <ProductForm categories={cats} />
    </div>
  );
}
