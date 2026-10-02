import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToggleButton } from "@/components/admin/toggle-button";
import { formatDate } from "@/lib/utils";

export default async function AdminMessages() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Messages</h1><p className="text-sm text-neutral-500">Contact form submissions</p></div>
      <div className="card divide-y divide-neutral-100">
        {rows.map((m) => (
          <div key={m.id} className={`p-5 flex gap-4 ${!m.read ? "bg-blue-50/40" : ""}`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                {!m.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                <span className="font-medium text-sm">{m.name}</span>
                <a href={`mailto:${m.email}`} className="text-xs text-neutral-500 underline">{m.email}</a>
                <span className="text-xs text-neutral-400">{formatDate(m.createdAt)}</span>
              </div>
              {m.subject && <p className="text-sm font-semibold">{m.subject}</p>}
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{m.message}</p>
            </div>
            <div className="flex items-start gap-2">
              <ToggleButton url={`/api/admin/messages/${m.id}`} field="read" value={m.read} onLabel="Mark unread" offLabel="Mark read" />
              <DeleteButton url={`/api/admin/messages/${m.id}`} small />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No messages yet.</p>}
      </div>
    </div>
  );
}
