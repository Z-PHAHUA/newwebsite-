import { getCategories } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategories() {
  const cats = await getCategories();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-sm text-neutral-500">{cats.length} categories</p></div>
      <CategoryManager categories={cats} />
    </div>
  );
}
