import { requireWrite, logActivity } from "@/lib/admin-api";
import { resyncSeedMedia } from "@/lib/seed";

export async function POST() {
  const { denied, admin } = await requireWrite();
  if (denied) return denied;
  await resyncSeedMedia();
  await logActivity(admin, "catalog.refresh-demo", "Refreshed demo products & images");
  return Response.json({ ok: true });
}
