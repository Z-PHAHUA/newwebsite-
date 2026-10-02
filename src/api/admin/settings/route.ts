import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireWrite, logActivity } from "@/lib/admin-api";

export async function PUT(req: NextRequest) {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  const b = (await req.json()) as Record<string, string>;
  for (const [key, value] of Object.entries(b)) {
    await db.insert(settings).values({ key, value: String(value) }).onConflictDoUpdate({ target: settings.key, set: { value: String(value) } });
  }
  await logActivity(admin, "settings.update", Object.keys(b).join(", "));
  return Response.json({ ok: true });
}
