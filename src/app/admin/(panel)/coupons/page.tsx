import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CouponForm } from "@/components/admin/coupon-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToggleButton } from "@/components/admin/toggle-button";
import { formatDate } from "@/lib/utils";

export default async function AdminCoupons() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Coupons</h1><p className="text-sm text-neutral-500">Discount codes customers can apply at checkout</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <CouponForm />
        <div className="lg:col-span-2 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50">
              <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Discount</th><th className="px-5 py-3">Min order</th><th className="px-5 py-3">Used</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3"><span className="font-mono font-semibold">{c.code}</span><p className="text-xs text-neutral-400">{formatDate(c.createdAt)}</p></td>
                  <td className="px-5 py-3">{c.type === "percent" ? `${Number(c.value)}%` : `$${Number(c.value)}`}</td>
                  <td className="px-5 py-3">${Number(c.minOrder ?? 0)}</td>
                  <td className="px-5 py-3">{c.usageCount}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{c.isActive ? "Active" : "Disabled"}</span></td>
                  <td className="px-5 py-3 text-right">
                    <ToggleButton url={`/api/admin/coupons/${c.id}`} field="isActive" value={c.isActive} onLabel="Disable" offLabel="Enable" />
                    <DeleteButton url={`/api/admin/coupons/${c.id}`} small />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No coupons yet.</p>}
        </div>
      </div>
    </div>
  );
}
