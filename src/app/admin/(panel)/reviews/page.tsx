import Link from "next/link";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToggleButton } from "@/components/admin/toggle-button";
import { formatDate } from "@/lib/utils";

export default async function AdminReviews() {
  const rows = await db.select({ r: reviews, productName: products.name, productSlug: products.slug }).from(reviews).leftJoin(products, eq(reviews.productId, products.id)).orderBy(desc(reviews.createdAt)).limit(200);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Reviews</h1><p className="text-sm text-neutral-500">{rows.length} reviews · moderate what appears on product pages</p></div>
      <div className="card divide-y divide-neutral-100">
        {rows.map(({ r, productName, productSlug }) => (
          <div key={r.id} className="p-5 flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-amber-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="font-medium text-sm">{r.authorName}</span>
                <span className="text-xs text-neutral-400">{formatDate(r.createdAt)}</span>
                {!r.approved && <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Hidden</span>}
              </div>
              <p className="text-sm text-neutral-700">{r.comment}</p>
              <p className="text-xs text-neutral-400 mt-1">on <Link href={`/product/${productSlug}`} target="_blank" className="underline">{productName}</Link></p>
            </div>
            <div className="flex items-start gap-2">
              <ToggleButton url={`/api/admin/reviews/${r.id}`} field="approved" value={r.approved} onLabel="Hide" offLabel="Approve" />
              <DeleteButton url={`/api/admin/reviews/${r.id}`} small />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No reviews yet.</p>}
      </div>
    </div>
  );
}
