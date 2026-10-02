import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate } from "@/lib/utils";

export default async function AdminSubscribers() {
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Newsletter Subscribers</h1><p className="text-sm text-neutral-500">{rows.length} subscribers</p></div>
        <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(["email,subscribed_at", ...rows.map((r) => `${r.email},${r.createdAt.toISOString()}`)].join("\n"))}`} download="subscribers.csv" className="btn-outline py-2 px-4 text-xs">Export CSV</a>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50"><tr><th className="px-5 py-3">Email</th><th className="px-5 py-3">Subscribed</th><th className="px-5 py-3 text-right"></th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((s) => (
              <tr key={s.id}><td className="px-5 py-3">{s.email}</td><td className="px-5 py-3 text-neutral-500">{formatDate(s.createdAt)}</td><td className="px-5 py-3 text-right"><DeleteButton url={`/api/admin/subscribers?id=${s.id}`} small label="Remove" /></td></tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No subscribers yet.</p>}
      </div>
    </div>
  );
}
