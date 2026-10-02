import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function ActivityPage() {
  const rows = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(300);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Activity Log</h1><p className="text-sm text-neutral-500">Who changed what, and when.</p></div>
      <div className="card divide-y divide-neutral-100">
        {rows.map((r) => (
          <div key={r.id} className="px-5 py-3 flex items-center gap-4 text-sm">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold shrink-0">{r.adminName[0]}</div>
            <div className="flex-1 min-w-0">
              <p><span className="font-medium">{r.adminName}</span> <span className="text-neutral-500">·</span> <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">{r.action}</code></p>
              {r.details && <p className="text-xs text-neutral-500 truncate">{r.details}</p>}
            </div>
            <span className="text-xs text-neutral-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No activity yet.</p>}
      </div>
    </div>
  );
}
